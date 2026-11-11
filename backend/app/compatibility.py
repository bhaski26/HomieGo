WEIGHTS = {
    "lifestyle": 20,
    "cleanliness": 15,
    "sleeping": 15,
    "financial": 15,
    "food": 10,
    "social": 10,
    "work": 10,
    "boundaries": 5,
}


def score_preferences(a: dict, b: dict) -> dict:
    categories = {}
    conflicts = []

    available_weight = 0
    weighted_score = 0
    comparable_categories = 0

    for key, weight in WEIGHTS.items():

        value_a = a.get(key)
        value_b = b.get(key)

        # Missing preferences are not scored.
        if value_a is None or value_b is None:
            categories[key] = None
            continue

        comparable_categories += 1
        available_weight += weight

        # Exact preference match.
        if value_a == value_b:
            score = 100

        else:
            # A dealbreaker from either person is sufficient.
            a_strict = (
                a.get(f"{key}_priority") == "dealbreaker"
            )

            b_strict = (
                b.get(f"{key}_priority") == "dealbreaker"
            )

            if a_strict or b_strict:
                score = 0

                conflicts.append(
                    f"{key.title()} is a dealbreaker conflict."
                )

            else:
                score = 65

        categories[key] = score

        weighted_score += score * weight

    # Calculate compatibility using only available categories.
    if available_weight > 0:
        overall = round(weighted_score / available_weight)
    else:
        overall = None

    # Completeness measures jointly available categories.
    completeness = round(
        comparable_categories / len(WEIGHTS) * 100
    )

    positives = [
        key
        for key, value in categories.items()
        if value is not None and value >= 90
    ]

    if positives:
        explanation = (
            "Strong alignment in "
            + ", ".join(positives[:3])
            + "."
        )
    else:
        explanation = (
            "Some preferences need a conversation."
        )

    if conflicts:
        explanation += " " + " ".join(conflicts)

    return {
        "overall": overall,
        "completeness": completeness,
        "categories": categories,
        "dealbreakers": conflicts,
        "explanation": explanation,
    }