from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationListResponse
from app.services import notification_service


router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def list_my_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List notifications for the logged-in user."""
    return notification_service.list_notifications(
        session, current_user, page=page, limit=limit, unread_only=unread_only
    )


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Mark a single notification as read."""
    return notification_service.mark_as_read(session, notification_id, current_user)


@router.put("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Mark all notifications as read."""
    count = notification_service.mark_all_as_read(session, current_user)
    return {"success": True, "marked_read": count}


@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a notification."""
    notification_service.delete_notification(session, notification_id, current_user)