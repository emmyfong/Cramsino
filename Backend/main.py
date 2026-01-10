import os
import cv2
import mediapipe as mp
import numpy as np
import time
import math
import pyaudio
import threading
import json
import uuid

try:
    import websocket
except ImportError:
    websocket = None

from dotenv import load_dotenv

# ------------------ CONFIG ------------------
LOOK_AWAY_YAW_THRESHOLD = 20     # degrees (side to side)
LOOK_UP_PITCH_THRESHOLD = 15     # degrees (looking up away)
LOOK_DOWN_PITCH_THRESHOLD = 30   # degrees (looking down is OK)
MOUTH_OPEN_THRESHOLD = 0.01
AUDIO_THRESHOLD = 300            # RMS threshold for detecting speech
DISTRACTED_TIME_LIMIT = 0.3        # seconds
NO_FACE_TIME_LIMIT = 10          # seconds
FRAME_RATE = 5                   # frames per second
# --------------------------------------------

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
load_dotenv()

STATUS_WS_URL = os.getenv("STATUS_WS_URL")
STATUS_CLIENT_ID = os.getenv("STATUS_CLIENT_ID")
CLIENT_ID_PATH = os.getenv("STATUS_CLIENT_ID_PATH", ".client_id")

_ws_app = None
_ws_connected = False


def _load_or_create_client_id():
    if STATUS_CLIENT_ID:
        return STATUS_CLIENT_ID

    try:
        if os.path.exists(CLIENT_ID_PATH):
            with open(CLIENT_ID_PATH, "r", encoding="utf-8") as f:
                client_id = f.read().strip()
                if client_id:
                    return client_id
    except OSError:
        pass

    client_id = str(uuid.uuid4())
    try:
        with open(CLIENT_ID_PATH, "w", encoding="utf-8") as f:
            f.write(client_id)
    except OSError:
        pass
    return client_id


def _start_status_ws():
    global _ws_app, _ws_connected
    if not STATUS_WS_URL or websocket is None:
        return

    def _on_open(_):
        global _ws_connected
        _ws_connected = True

    def _on_close(_, __, ___):
        global _ws_connected
        _ws_connected = False

    def _on_error(_, __):
        global _ws_connected
        _ws_connected = False

    _ws_app = websocket.WebSocketApp(
        STATUS_WS_URL,
        on_open=_on_open,
        on_close=_on_close,
        on_error=_on_error,
    )
    threading.Thread(target=_ws_app.run_forever, daemon=True).start()


def _send_status(state):
    if not _ws_app or not _ws_connected:
        return
    payload = {
        "client_id": _load_or_create_client_id(),
        "status": state,
    }
    try:
        _ws_app.send(json.dumps(payload))
    except Exception:
        pass

mp_face = mp.solutions.face_mesh
face_mesh = mp_face.FaceMesh(refine_landmarks=True)

cap = cv2.VideoCapture(0)

last_face_time = time.time()
distracted_start = None
audio_levels = []
is_audio_running = True

# ------------------ AUDIO MONITOR ------------------
def audio_monitor():
    """Monitor microphone audio levels in background thread"""
    global audio_levels, is_audio_running
    try:
        p = pyaudio.PyAudio()
        stream = p.open(format=pyaudio.paInt16, channels=1, rate=44100,
                        input=True, frames_per_buffer=1024)
        
        while is_audio_running:
            data = np.frombuffer(stream.read(1024, exception_on_overflow=False), dtype=np.int16)
            rms = np.sqrt(np.mean(data**2))
            audio_levels.append(rms)
            if len(audio_levels) > 10:
                audio_levels.pop(0)
        
        stream.stop_stream()
        stream.close()
        p.terminate()
    except Exception as e:
        print(f"Audio monitoring error: {e}")

audio_thread = threading.Thread(target=audio_monitor, daemon=True)
audio_thread.start()

# ------------------ HEAD / MOUTH ------------------
def get_head_yaw_and_pitch(landmarks):
    """Calculate both horizontal (yaw) and vertical (pitch) head orientation"""
    left_eye = landmarks[33]
    right_eye = landmarks[263]
    nose = landmarks[1]
    chin = landmarks[152]
    forehead = landmarks[10]

    # Yaw (left-right)
    eye_dx = right_eye.x - left_eye.x
    nose_offset = nose.x - (left_eye.x + right_eye.x) / 2
    yaw = nose_offset / eye_dx * 60

    # Pitch (up-down)
    face_height = abs(forehead.y - chin.y)
    nose_vertical_offset = nose.y - (forehead.y + chin.y)/2
    pitch = nose_vertical_offset / face_height * 60

    return yaw, pitch

def is_talking(landmarks):
    """Detect talking using mouth landmarks only"""
    upper_lip = landmarks[13]
    lower_lip = landmarks[14]
    mouth_open = abs(upper_lip.y - lower_lip.y) > MOUTH_OPEN_THRESHOLD
    return mouth_open

# ------------------ ATTENTION ------------------
def get_attention_state():
    global last_face_time, distracted_start

    ret, frame = cap.read()
    if not ret:
        return None

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_result = face_mesh.process(rgb)

    now = time.time()

    state = {
        "face_present": False,
        "looking_forward": False,
        "talking": False,
        "distracted": False,
        "debug_yaw": 0,
        "debug_pitch": 0
    }

    if not face_result.multi_face_landmarks:
        if now - last_face_time > NO_FACE_TIME_LIMIT:
            state["distracted"] = True
        return state

    last_face_time = now
    landmarks = face_result.multi_face_landmarks[0].landmark

    state["face_present"] = True

    yaw, pitch = get_head_yaw_and_pitch(landmarks)
    state["debug_yaw"] = yaw
    state["debug_pitch"] = pitch

    # Looking forward if yaw within threshold and pitch not looking up too far
    state["looking_forward"] = (
        abs(yaw) < LOOK_AWAY_YAW_THRESHOLD and
        pitch < LOOK_UP_PITCH_THRESHOLD
    )

    state["talking"] = is_talking(landmarks)

    distracted = not state["looking_forward"] or state["talking"]

    if distracted:
        if distracted_start is None:
            distracted_start = now
        elif now - distracted_start > DISTRACTED_TIME_LIMIT:
            state["distracted"] = True
    else:
        distracted_start = None

    return state

# ------------------ TEST LOOP ------------------
if __name__ == "__main__":
    print("Starting attention monitor. Press Ctrl+C to stop.")
    client_id = _load_or_create_client_id()
    print(f"Client ID: {client_id}")
    _start_status_ws()
    try:
        while True:
            state = get_attention_state()
            if state:
                audio_level = np.mean(audio_levels) if audio_levels else 0
                print(
                    f"[{time.strftime('%H:%M:%S')}] "
                    f"Face: {state['face_present']}, "
                    f"Looking Forward: {state['looking_forward']}, "
                    f"Talking: {state['talking']}, "
                    f"Distracted: {state['distracted']} "
                    f"(Yaw: {state['debug_yaw']:.1f}°, Pitch: {state['debug_pitch']:.1f}°)"
                )
                _send_status(state)
            time.sleep(1 / FRAME_RATE)
    except KeyboardInterrupt:
        print("\nStopping monitor...")
    finally:
        is_audio_running = False
        cap.release()
        cv2.destroyAllWindows()
