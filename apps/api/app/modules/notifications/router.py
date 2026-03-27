from fastapi import APIRouter

from app.store import store

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications() -> dict[str, list[dict[str, str | bool]]]:
    return {"items": store.notifications}


@router.get("/unread/count")
def unread_count() -> dict[str, int]:
    count = len([item for item in store.notifications if item["read"] is False])
    return {"count": count}


@router.post("/mark-all-read")
def mark_all_read() -> dict[str, str]:
    for item in store.notifications:
        item["read"] = True
    return {"message": "All notifications marked as read"}
