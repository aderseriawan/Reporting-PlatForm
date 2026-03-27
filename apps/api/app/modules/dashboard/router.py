from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/getSidebarItems")
def get_sidebar_items() -> dict[str, list[dict[str, str]]]:
    return {
        "items": [
            {"label": "Dashboard", "href": "/dashboard"},
            {"label": "Clients", "href": "/clients"},
            {"label": "Projects", "href": "/projects"},
            {"label": "Notifications", "href": "/notifications"},
        ]
    }
