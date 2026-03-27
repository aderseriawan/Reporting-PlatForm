from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class ProfileResponse(BaseModel):
    id: str
    username: str
    full_name: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile: ProfileResponse
