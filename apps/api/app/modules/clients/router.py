from pydantic import BaseModel
from fastapi import APIRouter

from app.store import store

router = APIRouter(prefix="/clients", tags=["clients"])


class ClientCreateRequest(BaseModel):
    name: str
    username: str
    status: str = "Active"


@router.get("")
def list_clients() -> dict[str, list[dict[str, str]]]:
    return {"items": store.clients}


@router.post("")
def create_client(payload: ClientCreateRequest) -> dict[str, dict[str, str]]:
    item = store.create_client(name=payload.name, username=payload.username, status=payload.status)
    return {"item": item}
