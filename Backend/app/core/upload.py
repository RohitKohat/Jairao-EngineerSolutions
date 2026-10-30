import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status

# ─── Upload settings ───
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
}

# Max size: 5 MB
MAX_FILE_SIZE = 5 * 1024 * 1024


async def save_upload_file(file: UploadFile, prefix: str = "product") -> str:
    """
    Save an uploaded file to the uploads folder.
    Returns the public URL path (e.g., /uploads/product_abc123.jpg).
    """
    # ─── Validate MIME type ───
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    # ─── Validate extension ───
    original_name = file.filename or "upload.jpg"
    ext = Path(original_name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # ─── Read content and check size ───
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    # ─── Generate unique filename ───
    unique_id = uuid.uuid4().hex[:12]
    filename = f"{prefix}_{unique_id}{ext}"
    filepath = UPLOAD_DIR / filename

    # ─── Write file ───
    try:
        with open(filepath, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )

    # ─── Return public URL ───
    return f"/uploads/{filename}"


def delete_upload_file(file_url: str) -> bool:
    """Delete an uploaded file given its URL path."""
    if not file_url or not file_url.startswith("/uploads/"):
        return False

    filename = file_url.replace("/uploads/", "")
    filepath = UPLOAD_DIR / filename

    if filepath.exists():
        try:
            filepath.unlink()
            return True
        except Exception:
            return False
    return False