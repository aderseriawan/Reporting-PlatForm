from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.store import store

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectCreateRequest(BaseModel):
    name: str
    client_id: str
    pic_client_name: str = ""
    pic_client_contact: str = ""
    status: str = "On Progress"
    lead_pentester: str = ""
    lead_pentester_contact: str = ""
    assets: str = ""
    method: str = "White Box"


@router.get("")
def list_projects() -> dict[str, list[dict[str, str]]]:
    return {"items": store.projects}


@router.post("")
def create_project(payload: ProjectCreateRequest) -> dict[str, dict[str, str]]:
    item = store.create_project(
        name=payload.name,
        client_id=payload.client_id,
        pic_client_name=payload.pic_client_name,
        pic_client_contact=payload.pic_client_contact,
        status=payload.status,
        lead_pentester=payload.lead_pentester,
        lead_pentester_contact=payload.lead_pentester_contact,
        assets=payload.assets,
        method=payload.method,
    )
    return {"item": item}


@router.get("/{project_id}")
def get_project(project_id: str) -> dict[str, object]:
    project = next((item for item in store.projects if item["id"] == project_id), None)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project_cases = [item for item in store.cases if item["project_id"] == project_id]
    return {"project": project, "cases": project_cases}
