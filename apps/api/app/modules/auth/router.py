from fastapi import APIRouter, HTTPException

from app.schemas.auth import LoginRequest, LoginResponse, ProfileResponse
from app.store import store

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    user = store.users.get(payload.username)
    if user is None or user["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    profile = ProfileResponse(
        id=str(user["id"]),
        username=str(user["username"]),
        full_name=str(user["full_name"]),
        role=str(user["role"]),
    )
    return LoginResponse(access_token=f"token-{payload.username}", profile=profile)


@router.get("/my-profile", response_model=ProfileResponse)
def my_profile() -> ProfileResponse:
    user = store.users["analyst"]
    return ProfileResponse(
        id=str(user["id"]),
        username=str(user["username"]),
        full_name=str(user["full_name"]),
        role=str(user["role"]),
    )
