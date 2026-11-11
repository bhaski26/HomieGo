import os


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "development-only-change-me"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_MINUTES = int(
    os.getenv("ACCESS_TOKEN_MINUTES", "1440")
)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")