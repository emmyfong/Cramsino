import random

RARITY_WEIGHTS = {
    "exclusive": 0.5,
    "super_rare": 2,
    "rare": 7,
    "uncommon": 20,
    "common": 70.5,
}


def roll_rarity():
    return random.choices(
        list(RARITY_WEIGHTS.keys()),
        weights=list(RARITY_WEIGHTS.values()),
        k=1,
    )[0]
