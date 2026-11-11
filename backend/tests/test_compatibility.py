from app.compatibility import score_preferences


def test_perfect_matches_are_high():
    preferences = {
        "food": "vegetarian",
        "cleanliness": "tidy",
    }

    result = score_preferences(preferences, preferences)

    assert result["overall"] == 100
    assert result["completeness"] == 25
    assert not result["dealbreakers"]


def test_missing_preferences_are_not_penalised():
    a = {
        "food": "vegetarian",
        "cleanliness": "tidy",
    }

    b = {
        "food": "vegetarian",
        "cleanliness": "tidy",
    }

    result = score_preferences(a, b)

    assert result["overall"] == 100
    assert result["categories"]["lifestyle"] is None
    assert result["completeness"] == 25


def test_one_sided_dealbreaker_is_reported():
    a = {
        "food": "vegan",
        "food_priority": "dealbreaker",
    }

    b = {
        "food": "non-vegetarian",
    }

    result = score_preferences(a, b)

    assert result["categories"]["food"] == 0
    assert len(result["dealbreakers"]) == 1


def test_non_dealbreaker_difference():
    a = {
        "food": "vegetarian",
    }

    b = {
        "food": "non-vegetarian",
    }

    result = score_preferences(a, b)

    assert result["categories"]["food"] == 65
    assert not result["dealbreakers"]


def test_no_shared_preferences():
    a = {
        "food": "vegetarian",
    }

    b = {
        "cleanliness": "tidy",
    }

    result = score_preferences(a, b)

    assert result["overall"] is None
    assert result["completeness"] == 0