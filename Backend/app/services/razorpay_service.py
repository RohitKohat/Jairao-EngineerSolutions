import hmac
import hashlib
import razorpay
from fastapi import HTTPException, status
from app.core.config import settings


# Initialize client
client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def create_razorpay_order(amount_in_rupees: float, receipt: str) -> dict:
    """
    Create a Razorpay order.
    Amount must be in paise (multiply by 100).
    """
    try:
        order = client.order.create({
            "amount": int(amount_in_rupees * 100),  # convert to paise
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1,  # auto-capture
        })
        return {
            "razorpay_order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": settings.RAZORPAY_KEY_ID,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Razorpay order creation failed: {str(e)}",
        )


def verify_razorpay_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """Verify Razorpay webhook signature."""
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, razorpay_signature)