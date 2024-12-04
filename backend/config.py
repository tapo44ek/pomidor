from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    DB_HOST = os.environ["DB_HOST"]
    DB_PORT = os.environ["DB_PORT"]
    DB_USER = os.environ["DB_USER"]
    DB_PASS = os.environ["DB_PASS"]
    DB_NAME = os.environ["DB_NAME"]
    DB_SCHEMA = os.environ["DB_SCHEMA"]

    DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    ALGORITHM = os.environ["ALGORITHM"]
    SECRET_KEY = os.environ["SECRET_KEY"]