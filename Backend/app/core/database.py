from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings


# Create the database engine
# This is the "connection" to your Neon PostgreSQL database
engine = create_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development"),  # Print SQL in dev mode
    pool_pre_ping=True,
    pool_recycle=300,
)


def create_db_and_tables():
    """Create all tables in the database (if they don't exist)."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency for endpoints: gives each request its own DB session."""
    with Session(engine) as session:
        yield session