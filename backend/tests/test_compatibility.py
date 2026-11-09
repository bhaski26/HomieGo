from app.compatibility import score_preferences
def test_matches_are_high():
 r=score_preferences({'food':'vegetarian','cleanliness':'tidy'},{'food':'vegetarian','cleanliness':'tidy'})
 assert r['overall'] >= 85 and not r['dealbreakers']
def test_mutual_dealbreaker_is_reported():
 r=score_preferences({'food':'vegan','food_priority':'dealbreaker'},{'food':'non-vegetarian'})
 assert r['categories']['food']==0 and r['dealbreakers']
