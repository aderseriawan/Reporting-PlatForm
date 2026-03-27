from fastapi import APIRouter, HTTPException

from app.schemas.cases import CaseCreateRequest, CaseResponse, CaseUpdateRequest, RefineRequest, RefineResponse
from app.store import store

router = APIRouter(prefix="/cases", tags=["cases"])


def _to_case_response(item: dict[str, str | float]) -> CaseResponse:
    return CaseResponse(
        id=str(item["id"]),
        project_id=str(item["project_id"]),
        name=str(item["name"]),
        status=str(item["status"]),
        asset=str(item["asset"]),
        type=str(item["type"]),
        reporter=str(item["reporter"]),
        found_date=str(item["found_date"]),
        cwe=str(item["cwe"]),
        cvss_score=float(item["cvss_score"]),
        cvss_severity=str(item["cvss_severity"]),
        cvss_vector=str(item["cvss_vector"]),
        description=str(item["description"]),
        threat_risk=str(item["threat_risk"]),
        recommendation=str(item["recommendation"]),
        reference=str(item["reference"]),
        steps_to_reproduce=str(item["steps_to_reproduce"]),
        retest_result=str(item["retest_result"]),
        created_at=str(item["created_at"]),
    )


@router.get("")
def list_cases(project_id: str | None = None) -> dict[str, list[dict[str, str | float]]]:
    if project_id is None:
        return {"items": store.cases}
    return {"items": [item for item in store.cases if item["project_id"] == project_id]}


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str) -> CaseResponse:
    item = next((case for case in store.cases if case["id"] == case_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return _to_case_response(item)


@router.post("", response_model=CaseResponse)
def create_case(payload: CaseCreateRequest) -> CaseResponse:
    item = store.create_case(payload.model_dump())
    return _to_case_response(item)


@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(case_id: str, payload: CaseUpdateRequest) -> CaseResponse:
    item = next((case for case in store.cases if case["id"] == case_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Case not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        item[key] = value

    return _to_case_response(item)


def _simple_refine(raw_content: str, section: str) -> str:
    text = " ".join(raw_content.split())
    prefix = f"[{section.upper()}] "
    if not text.endswith("."):
        text += "."
    return prefix + text


@router.post("/refine", response_model=RefineResponse)
def refine_case_content(payload: RefineRequest) -> RefineResponse:
    refined = _simple_refine(payload.raw_content_html, payload.section)

    return RefineResponse(
        refined_content_html=refined,
        changes_summary=[
            "Improved readability and sentence flow",
            "Standardized report tone and structure",
            "Kept factual technical details intact",
        ],
        risk_flags=[],
        model_info={
            "provider": "local-stub",
            "model": "refiner-v1",
            "timestamp": "2026-03-26T00:00:00Z",
        },
    )
