from fastapi import Header, HTTPException
from supabase import create_client
from app.core.config import SUPABASE_URL, SUPABASE_ANON_KEY

auth_client = create_client(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
)

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "")
    user = auth_client.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user.user
