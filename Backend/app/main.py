import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.core.logging_config import setup_logging, log_request

# Models

from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.payout import Payout
from app.models.notification import Notification
from app.models.service import ServiceCatalog, ServiceRequest
from app.models.quotation import Quotation

# Routers
from app.routers import (
    auth, product, order, payment, quotation,
    payout, notification, service, admin,       # ← admin added
)


logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("═" * 55)
    logger.info(f"🚀  Starting {settings.APP_NAME}")
    logger.info(f"🌍  Environment: {settings.ENVIRONMENT}")

    issues = settings.validate_startup()
    if issues:
        logger.warning("─" * 55)
        logger.warning("Configuration checks:")
        for issue in issues:
            logger.warning(f"  {issue}")
        logger.warning("─" * 55)

    logger.info("📦  Creating database tables...")
    create_db_and_tables()
    logger.info("✅  Database tables ready")
    logger.info("═" * 55)

    yield
    logger.info("👋  Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Multivendor Escrow + AI Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
    except Exception:
        log_request(request.method, request.url.path, 500, (time.time() - start) * 1000)
        raise
    log_request(request.method, request.url.path, response.status_code, (time.time() - start) * 1000)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled: {request.method} {request.url.path}: {exc}")
    return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Register all routers ───
app.include_router(auth.router)
app.include_router(product.router)
app.include_router(order.router)
app.include_router(payment.router)
app.include_router(quotation.router)
app.include_router(payout.router)
app.include_router(notification.router)
app.include_router(service.router)
app.include_router(admin.router)                # ← admin added


@app.get("/")
def root():
    return {"success": True, "message": f"🚀 {settings.APP_NAME} is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}