import random

RARITY_WEIGHTS = {
    "super_rare": 5,
    "rare": 15,
    "uncommon": 0.30,
    "common": 0.5,
}

BASE_RARITIES = {"common", "uncommon", "rare"}
SUPER_RARE_TYPES = ["base", "holo", "foil"]
BASE_TYPES = ["base", "holo"]


def roll_rarity():
    return random.choices(
        list(RARITY_WEIGHTS.keys()),
        weights=list(RARITY_WEIGHTS.values()),
        k=1,
    )[0]


def roll_type_for_rarity(rarity):
    if rarity == "super_rare":
        return random.choice(SUPER_RARE_TYPES)

    if rarity in BASE_RARITIES:
        return random.choices(BASE_TYPES, weights=[3, 1], k=1)[0]

    return "base"
