from typing import Literal

from pydantic import BaseModel, Field


RefineSection = Literal[
    "description",
    "threat_risk",
    "recommendation",
    "reference",
    "retest_result",
]


class CaseBase(BaseModel):
    project_id: str
    name: str
    status: str = "Submitted"
    asset: str
    type: str = "Web"
    reporter: str
    found_date: str = ""
    cwe: str = ""
    cvss_score: float = 0.0
    cvss_severity: str = "Low"
    cvss_vector: str = ""
    description: str = ""
    threat_risk: str = ""
    recommendation: str = ""
    reference: str = ""
    steps_to_reproduce: str = ""
    retest_result: str = ""


class CaseCreateRequest(CaseBase):
    pass


class CaseUpdateRequest(BaseModel):
    name: str | None = None
    status: str | None = None
    asset: str | None = None
    type: str | None = None
    reporter: str | None = None
    found_date: str | None = None
    cwe: str | None = None
    cvss_score: float | None = None
    cvss_severity: str | None = None
    cvss_vector: str | None = None
    description: str | None = None
    threat_risk: str | None = None
    recommendation: str | None = None
    reference: str | None = None
    steps_to_reproduce: str | None = None
    retest_result: str | None = None


class CaseResponse(CaseBase):
    id: str
    created_at: str


class RefineContext(BaseModel):
    project_name: str
    asset: str
    case_title: str
    cwe: str | None = None
    cvss_score: float | None = None
    cvss_severity: str | None = None
    cvss_vector: str | None = None


class RefineRequest(BaseModel):
    case_id: str
    section: RefineSection
    raw_content_html: str = Field(min_length=1)
    context: RefineContext


class RefineResponse(BaseModel):
    refined_content_html: str
    changes_summary: list[str]
    risk_flags: list[str]
    model_info: dict[str, str]
