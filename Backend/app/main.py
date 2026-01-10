from fastapi import FastAPI
from app.routes import sessions, cv, gacha

app = FastAPI(title="Cramsino Backend")

app.include_router(sessions.router)
app.include_router(cv.router)
app.include_router(gacha.router)
