from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.db.supabase import supabase
from app.services.gacha_logic import roll_rarity

router = APIRouter(prefix="/gacha", tags=["gacha"])


@router.post("/pull")
def pull_cards(pull_count: int = 1, user=Depends(get_current_user)):
    cards_pulled = []

    for _ in range(pull_count):
        rarity = roll_rarity()
        card = (
            supabase
            .table("cards")
            .select("*")
            .eq("rarity", rarity)
            .order("random()")
            .limit(1)
            .execute()
        ).data[0]

        supabase.table("user_cards").insert({
            "user_id": user.id,
            "card_id": card["id"],
        }).execute()

        cards_pulled.append(card)

    supabase.table("gacha_logs").insert({
        "user_id": user.id,
        "pull_count": pull_count,
        "results": cards_pulled,
    }).execute()

    return {"cards": cards_pulled}
