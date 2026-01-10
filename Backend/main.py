import os
import cv2
import mediapipe as mp
import numpy as np
import time
import math

# ------------------ CONFIG ------------------
LOOK_AWAY_YAW_THRESHOLD = 25     # degrees
MOUTH_OPEN_THRESHOLD = 0.03
DISTRACTED_TIME_LIMIT = 5        # seconds
NO_FACE_TIME_LIMIT = 10          # seconds
FRAME_RATE = 5                   # frames per second for testing
# --------------------------------------------

# Suppress TensorFlow/MediaPipe logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

mp_face = mp.solutions.face_mesh
face_mesh = mp_face.FaceMesh(refine_landmarks=True)

# Use default camera (0) - should work for others on their own machines
cap = cv2.VideoCapture(0)

last_face_time = time.time()
distracted_start = None

def distance(p1, p2):
    return math.dist(p1, p2)

def get_head_yaw(landmarks):
    left_eye = landmarks[33]
    right_eye = landmarks[263]
    nose = landmarks[1]

    eye_dx = right_eye.x - left_eye.x
    nose_offset = nose.x - (left_eye.x + right_eye.x) / 2

    yaw = nose_offset / eye_dx * 60
    return yaw

def is_talking(landmarks):
    upper_lip = landmarks[13]
    lower_lip = landmarks[14]
    return abs(upper_lip.y - lower_lip.y) > MOUTH_OPEN_THRESHOLD

def get_attention_state():
    global last_face_time, distracted_start

    ret, frame = cap.read()
    if not ret:
        return None

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    now = time.time()

    state = {
        "face_present": False,
        "looking_forward": False,
        "talking": False,
        "distracted": False
    }

    if not result.multi_face_landmarks:
        if now - last_face_time > NO_FACE_TIME_LIMIT:
            state["distracted"] = True
        return state

    last_face_time = now
    landmarks = result.multi_face_landmarks[0].landmark

    state["face_present"] = True

    yaw = get_head_yaw(landmarks)
    state["looking_forward"] = abs(yaw) < LOOK_AWAY_YAW_THRESHOLD
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
print("Starting attention monitor. Press Ctrl+C to stop.")

try:
    while True:
        state = get_attention_state()
        if state:
            print(
                f"[{time.strftime('%H:%M:%S')}] "
                f"Face: {state['face_present']}, "
                f"Looking Forward: {state['looking_forward']}, "
                f"Talking: {state['talking']}, "
                f"Distracted: {state['distracted']}"
            )
        time.sleep(1 / FRAME_RATE)
except KeyboardInterrupt:
    print("Stopping monitor...")
finally:
    cap.release()
    cv2.destroyAllWindows()