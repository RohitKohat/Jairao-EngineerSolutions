from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select, func
from fastapi import HTTPException, status

from app.models.notification import Notification, NotificationType
from app.models.user import User, UserRole


def create_notification(
    session: Session,
    user_id: int,
    type: NotificationType,
    title: str,
    message: str,
    link: Optional[str] = None,
    related_id: Optional[int] = None,
) -> Notification:
    """Helper: create a single notification."""
    notification = Notification(
        type=type,
        title=title,
        message=message,
        link=link,
        user_id=user_id,
        related_id=related_id,
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def list_notifications(
    session: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
    unread_only: bool = False,
):
    """List notifications for a user."""
    query = select(Notification).where(Notification.user_id == user.id)

    if unread_only:
        query = query.where(Notification.is_read == False)

    # Counts
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    unread_query = select(func.count()).where(
        Notification.user_id == user.id,
        Notification.is_read == False,
    )
    unread_count = session.exec(unread_query).one()

    # Fetch
    query = query.offset((page - 1) * limit).limit(limit).order_by(Notification.created_at.desc())
    notifications = session.exec(query).all()

    return {
        "total": total,
        "unread_count": unread_count,
        "notifications": notifications,
    }


def mark_as_read(session: Session, notification_id: int, user: User) -> Notification:
    """Mark one notification as read."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def mark_all_as_read(session: Session, user: User) -> int:
    """Mark all of a user's notifications as read. Returns count."""
    notifications = session.exec(
        select(Notification).where(
            Notification.user_id == user.id,
            Notification.is_read == False,
        )
    ).all()

    now = datetime.now(timezone.utc)
    for n in notifications:
        n.is_read = True
        n.read_at = now
        session.add(n)

    session.commit()
    return len(notifications)


def delete_notification(session: Session, notification_id: int, user: User) -> None:
    """Delete a single notification."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    session.delete(notification)
    session.commit()