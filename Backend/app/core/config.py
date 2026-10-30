from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Jairao Backend"
    ENVIRONMENT: str = "development"
    PORT: int = 8000

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MINUTES: int = 10080

    # Business rules
    ADMIN_COMMISSION_RATE: float = 10.0
    MIN_PAYOUT_AMOUNT: float = 500.0

    # Groq AI
    GROQ_API_KEY: str = ""

    # Payment Gateways (loaded from .env)
    RAZORPAY_KEY_ID: str = "rzp_test_VksBmt0ezm329d"
    RAZORPAY_KEY_SECRET: str = "0w9yCJQQWnc1R0A3EdcLzWtc"
    STRIPE_SECRET_KEY: str = ""

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )

    def validate_startup(self) -> list:
        """Return a list of warnings/errors for missing critical config."""
        issues = []

        if not self.DATABASE_URL:
            issues.append("❌ DATABASE_URL is missing")
        elif "YOUR_REAL_PASSWORD" in self.DATABASE_URL:
            issues.append("❌ DATABASE_URL still contains placeholder password")

        if not self.JWT_SECRET or len(self.JWT_SECRET) < 16:
            issues.append("⚠️  JWT_SECRET should be at least 16 characters")

        if not self.RAZORPAY_KEY_ID or not self.RAZORPAY_KEY_SECRET:
            issues.append("⚠️  Razorpay keys missing — online payments will not work")

        if not self.GROQ_API_KEY:
            issues.append("ℹ️  GROQ_API_KEY missing — AI features disabled (fine for now)")

        return issues


settings = Settings()