from __future__ import annotations

from datetime import datetime
from uuid import uuid4


def _now_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def _id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10]}"


class InMemoryStore:
    def __init__(self) -> None:
        self.users = {
            "analyst": {
                "id": "u-1",
                "username": "analyst",
                "password": "ChangeMe123!",
                "full_name": "Security Analyst",
                "role": "lead-pentester",
            }
        }

        self.clients: list[dict[str, str]] = [
            {
                "id": "c-1",
                "name": "Sample Client",
                "username": "sample-client",
                "status": "Active",
                "created_at": _now_iso(),
            }
        ]

        self.projects: list[dict[str, str]] = [
            {
                "id": "p-1",
                "name": "Sample VAPT Project",
                "client_id": "c-1",
                "client_name": "Sample Client",
                "pic_client_name": "Client PIC",
                "pic_client_contact": "+62-800-0000-0000",
                "status": "On Progress",
                "lead_pentester": "Security Analyst",
                "lead_pentester_contact": "+62-800-0000-0001",
                "assets": "sample.target.local",
                "method": "White Box",
                "created_at": _now_iso(),
            }
        ]

        self.cases: list[dict[str, str | float]] = [
            {
                "id": "case-1",
                "project_id": "p-1",
                "name": "Sample Finding",
                "status": "Submitted",
                "asset": "sample.target.local",
                "type": "Web",
                "reporter": "Security Analyst",
                "found_date": _now_iso(),
                "cwe": "CWE-000",
                "cvss_score": 5.0,
                "cvss_severity": "Medium",
                "cvss_vector": "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:L/SC:N/SI:N/SA:N",
                "description": "Sample description content.",
                "threat_risk": "Sample threat and risk content.",
                "recommendation": "Sample remediation guidance.",
                "reference": "https://example.com/reference",
                "steps_to_reproduce": "1. Sample proof of concept step.",
                "retest_result": "Not retested.",
                "created_at": _now_iso(),
            }
        ]

        self.notifications: list[dict[str, str | bool]] = [
            {
                "id": _id("n"),
                "title": "Welcome",
                "message": "Platform initialized successfully.",
                "category": "System",
                "read": False,
                "created_at": _now_iso(),
            }
        ]

    def create_client(self, name: str, username: str, status: str) -> dict[str, str]:
        item = {
            "id": _id("c"),
            "name": name,
            "username": username,
            "status": status,
            "created_at": _now_iso(),
        }
        self.clients.insert(0, item)
        return item

    def create_project(
        self,
        name: str,
        client_id: str,
        pic_client_name: str,
        pic_client_contact: str,
        status: str,
        lead_pentester: str,
        lead_pentester_contact: str,
        assets: str,
        method: str,
    ) -> dict[str, str]:
        client_name = next((c["name"] for c in self.clients if c["id"] == client_id), "Unknown Client")
        item = {
            "id": _id("p"),
            "name": name,
            "client_id": client_id,
            "client_name": client_name,
            "pic_client_name": pic_client_name,
            "pic_client_contact": pic_client_contact,
            "status": status,
            "lead_pentester": lead_pentester,
            "lead_pentester_contact": lead_pentester_contact,
            "assets": assets,
            "method": method,
            "created_at": _now_iso(),
        }
        self.projects.insert(0, item)
        return item

    def create_case(self, payload: dict[str, str | float]) -> dict[str, str | float]:
        item = {
            "id": _id("case"),
            **payload,
            "found_date": str(payload.get("found_date") or _now_iso()),
            "created_at": _now_iso(),
        }
        self.cases.insert(0, item)
        return item


store = InMemoryStore()
