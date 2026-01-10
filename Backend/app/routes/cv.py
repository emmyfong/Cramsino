from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.db.supabase import supabase

router = APIRouter(prefix="/cv", tags=["cv"])


class CVEvent(BaseModel):
    session_id: str
    face_present: bool
    looking_forward: bool
    talking: bool
    distracted: bool


@router.post("/event")
def ingest_event(payload: CVEvent, user=Depends(get_current_user)):
    supabase.table("cv_events").insert({
        "session_id": payload.session_id,
        "face_present": payload.face_present,
        "looking_forward": payload.looking_forward,
        "talking": payload.talking,
        "distracted": payload.distracted,
    }).execute()

    return {"status": "ok"}
