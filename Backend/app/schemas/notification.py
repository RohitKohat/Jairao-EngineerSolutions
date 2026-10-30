from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: int
    type: NotificationType
    title: str
    message: str
    link: Optional[str]
    is_read: bool
    read_at: Optional[datetime]
    user_id: int
    related_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    notifications: List[NotificationResponse]