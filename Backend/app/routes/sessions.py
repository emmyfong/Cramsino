from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.db.supabase import supabase

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/start")
def start_session(user=Depends(get_current_user)):
    session = supabase.table("study_sessions").insert({
        "user_id": user.id,
    }).execute()

    return {"session_id": session.data[0]["id"]}


@router.post("/end")
def end_session(session_id: str, user=Depends(get_current_user)):
    supabase.table("study_sessions").update({
        "end_time": "now()",
    }).eq("id", session_id).eq("user_id", user.id).execute()

    return {"status": "ended"}
