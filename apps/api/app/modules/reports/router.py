from html import unescape
from io import BytesIO
from textwrap import wrap

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.store import store

router = APIRouter(prefix="/reports", tags=["reports"])

PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT = 46
RIGHT = PAGE_WIDTH - 46
TOP = PAGE_HEIGHT - 44
BOTTOM = 52


class ExportReportRequest(BaseModel):
    project_id: str
    report_status: str = "Draft"
    report_version: str = "1.0"


def _severity_counts(cases: list[dict[str, str | float]]) -> dict[str, int]:
    result = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for case in cases:
        severity = str(case.get("cvss_severity", "Low"))
        if severity in result:
            result[severity] += 1
    return result


def _clean_html_text(value: str) -> str:
    raw = value or ""
    text = raw.replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n")
    for tag in ["<p>", "</p>", "<div>", "</div>", "<li>", "</li>"]:
        text = text.replace(tag, "\n")

    output: list[str] = []
    inside = False
    for char in text:
        if char == "<":
            inside = True
            continue
        if char == ">":
            inside = False
            continue
        if not inside:
            output.append(char)

    cleaned = unescape("".join(output))
    normalized = "\n".join([line.strip() for line in cleaned.splitlines() if line.strip()])
    return normalized or "-"


def _draw_watermark(pdf: canvas.Canvas, text: str) -> None:
    pdf.saveState()
    pdf.setFillColorRGB(0.90, 0.92, 0.95)
    pdf.setFont("Helvetica-Bold", 64)
    pdf.translate(300, 420)
    pdf.rotate(35)
    pdf.drawCentredString(0, 0, text.upper())
    pdf.restoreState()


def _draw_header_footer(pdf: canvas.Canvas, report_title: str, status_label: str, version: str, page_no: int) -> None:
    pdf.saveState()
    pdf.setStrokeColor(colors.HexColor("#c6d3e7"))
    pdf.line(LEFT, TOP + 6, RIGHT, TOP + 6)
    pdf.line(LEFT, BOTTOM - 8, RIGHT, BOTTOM - 8)

    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(colors.HexColor("#4a5d78"))
    pdf.drawString(LEFT, TOP + 12, f"Phisudo VAPT | {report_title}")
    pdf.drawRightString(RIGHT, TOP + 12, f"Status: {status_label} | Version: {version}")
    pdf.drawString(LEFT, BOTTOM - 20, "Confidential - Authorized Recipients Only")
    pdf.drawRightString(RIGHT, BOTTOM - 20, f"Page {page_no}")
    pdf.restoreState()


def _start_page(pdf: canvas.Canvas, report_title: str, status_label: str, version: str, page_no: int) -> float:
    _draw_watermark(pdf, status_label)
    _draw_header_footer(pdf, report_title, status_label, version, page_no)
    return TOP - 14


def _next_page(pdf: canvas.Canvas, report_title: str, status_label: str, version: str, page_no: int) -> tuple[float, int]:
    pdf.showPage()
    page_no += 1
    y = _start_page(pdf, report_title, status_label, version, page_no)
    return y, page_no


def _draw_paragraph(
    pdf: canvas.Canvas, x: float, y: float, text: str, width_chars: int = 105, line_gap: int = 13
) -> float:
    pdf.setFont("Helvetica", 10)
    for line in wrap(text, width_chars):
        pdf.drawString(x, y, line)
        y -= line_gap
    return y


def _draw_label_block(pdf: canvas.Canvas, y: float, label: str, body: str, width_chars: int = 104) -> float:
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(LEFT, y, label)
    y -= 14
    pdf.setFont("Helvetica", 10)
    for line in wrap(body or "-", width_chars):
        pdf.drawString(LEFT, y, line)
        y -= 12
    return y - 6


def _draw_table_row(pdf: canvas.Canvas, y: float, columns: list[tuple[float, str, bool]]) -> float:
    x = LEFT
    row_height = 18
    for width, value, bold in columns:
        pdf.rect(x, y - row_height + 4, width, row_height, stroke=1, fill=0)
        pdf.setFont("Helvetica-Bold" if bold else "Helvetica", 9)
        display = value[:80]
        pdf.drawString(x + 4, y - 8, display)
        x += width
    return y - row_height


@router.post("/export")
def export_report(payload: ExportReportRequest) -> StreamingResponse:
    project = next((item for item in store.projects if item["id"] == payload.project_id), None)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project_cases = [item for item in store.cases if item["project_id"] == payload.project_id]
    counts = _severity_counts(project_cases)
    total_findings = len(project_cases)
    status_label = "Final Report" if payload.report_status.lower() == "final" else "Draft Report"

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    report_title = str(project["name"])
    page_no = 1

    # Cover
    _draw_watermark(pdf, status_label)
    pdf.setFont("Helvetica-Bold", 28)
    pdf.drawString(LEFT, PAGE_HEIGHT - 94, "Phisudo VAPT")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(LEFT, PAGE_HEIGHT - 128, "Initial Vulnerability Assessment Report")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(LEFT, PAGE_HEIGHT - 166, f"Project: {project['name']}")
    pdf.drawString(LEFT, PAGE_HEIGHT - 186, f"Client: {project['client_name']}")
    pdf.drawString(LEFT, PAGE_HEIGHT - 206, f"PIC Client: {project.get('pic_client_name', '-')}")
    pdf.drawString(LEFT, PAGE_HEIGHT - 226, f"PIC Contact: {project.get('pic_client_contact', '-')}")
    pdf.drawString(LEFT, PAGE_HEIGHT - 246, f"Lead Pentester: {project['lead_pentester']}")
    pdf.drawString(LEFT, PAGE_HEIGHT - 266, f"Lead Contact: {project.get('lead_pentester_contact', '-')}")
    pdf.drawString(LEFT, PAGE_HEIGHT - 286, f"Report Status: {status_label}")
    pdf.drawString(LEFT, PAGE_HEIGHT - 306, f"Version: {payload.report_version}")

    pdf.rect(LEFT, 104, RIGHT - LEFT, 184, stroke=1, fill=0)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(LEFT + 10, 270, "01. Limitations on Disclosure & Use of This Report")
    pdf.setFont("Helvetica", 10)
    notice = (
        "This report is confidential and intended only for authorized stakeholders. "
        "Results represent a point-in-time observation during the engagement period and may change if systems are modified."
    )
    for idx, line in enumerate(wrap(notice, 101)):
        pdf.drawString(LEFT + 10, 250 - idx * 14, line)

    y, page_no = _next_page(pdf, report_title, status_label, payload.report_version, page_no)

    # Executive Summary + Highlight
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(LEFT, y, "02. Executive Summary")
    y -= 20
    summary = (
        f"Phisudo conducted a vulnerability assessment for {project['name']} on asset(s): {project['assets']}. "
        "Testing approach combines manual validation and security testing practice aligned with common standards."
    )
    y = _draw_paragraph(pdf, LEFT, y, summary)
    y -= 8

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(LEFT, y, "03. Introduction")
    y -= 18
    y = _draw_paragraph(pdf, LEFT, y, "Project Objective: identify exploitable weaknesses and prioritize remediation actions.")
    y = _draw_paragraph(pdf, LEFT, y - 6, f"Project Scope: {project['assets']}")
    y -= 10

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(LEFT, y, "04. Highlight")
    y -= 18
    y = _draw_paragraph(pdf, LEFT, y, "4.1 Main Business Impact: unauthorized access, data exposure, and service disruption risk.")
    y = _draw_paragraph(pdf, LEFT, y - 4, "4.2 Risk Assessment: likelihood and impact based prioritization applied to findings.")
    y -= 8

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(LEFT, y, "4.3 Finding Summary")
    y -= 14
    pdf.setFont("Helvetica", 10)
    pdf.drawString(LEFT, y, f"Total Findings: {total_findings}")
    pdf.drawString(LEFT + 140, y, f"Critical: {counts['Critical']}")
    pdf.drawString(LEFT + 240, y, f"High: {counts['High']}")
    pdf.drawString(LEFT + 320, y, f"Medium: {counts['Medium']}")
    pdf.drawString(LEFT + 420, y, f"Low: {counts['Low']}")
    y -= 20

    # Summary table
    col = [28, 276, 70, 70, 70]
    y = _draw_table_row(pdf, y, [(col[0], "No", True), (col[1], "Finding", True), (col[2], "Status", True), (col[3], "Severity", True), (col[4], "CVSS", True)])
    for idx, case in enumerate(project_cases, start=1):
        if y < BOTTOM + 80:
            y, page_no = _next_page(pdf, report_title, status_label, payload.report_version, page_no)
        y = _draw_table_row(
            pdf,
            y,
            [
                (col[0], str(idx), False),
                (col[1], str(case["name"]), False),
                (col[2], str(case["status"]), False),
                (col[3], str(case["cvss_severity"]), False),
                (col[4], str(case["cvss_score"]), False),
            ],
        )

    # Finding details
    y, page_no = _next_page(pdf, report_title, status_label, payload.report_version, page_no)
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(LEFT, y, "05. Finding Details")
    y -= 22

    if not project_cases:
        y = _draw_paragraph(pdf, LEFT, y, "No findings recorded for this project.")

    for idx, case in enumerate(project_cases, start=1):
        if y < BOTTOM + 200:
            y, page_no = _next_page(pdf, report_title, status_label, payload.report_version, page_no)

        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(LEFT, y, f"5.{idx} {case['name']}")
        y -= 14
        pdf.setFont("Helvetica", 10)
        pdf.drawString(
            LEFT,
            y,
            f"Severity: {case['cvss_severity']} ({case['cvss_score']}) | Status: {case['status']} | CVSS: {case['cvss_vector']}",
        )
        y -= 18

        y = _draw_label_block(pdf, y, "Descriptions", _clean_html_text(str(case.get("description", ""))))
        y = _draw_label_block(pdf, y, "PoC Exploit", _clean_html_text(str(case.get("steps_to_reproduce", ""))))
        y = _draw_label_block(pdf, y, "Threats And Risks", _clean_html_text(str(case.get("threat_risk", ""))))
        y = _draw_label_block(pdf, y, "Recommendation", _clean_html_text(str(case.get("recommendation", ""))))
        y = _draw_label_block(pdf, y, "Reference", _clean_html_text(str(case.get("reference", ""))))

        pdf.setStrokeColor(colors.HexColor("#d3dce8"))
        pdf.line(LEFT, y, RIGHT, y)
        y -= 16

    # Appendix
    y, page_no = _next_page(pdf, report_title, status_label, payload.report_version, page_no)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(LEFT, y, "Appendix - Proof-of-Concept Scripts")
    y -= 20
    for idx, case in enumerate(project_cases, start=1):
        poc = _clean_html_text(str(case.get("steps_to_reproduce", "")))
        if poc == "-":
            continue
        if y < BOTTOM + 100:
            y, page_no = _next_page(pdf, report_title, status_label, payload.report_version, page_no)
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(LEFT, y, f"A.{idx} {case['name']}")
        y -= 14
        y = _draw_paragraph(pdf, LEFT, y, poc, width_chars=104, line_gap=12)
        y -= 8

    # Authorization page
    y, page_no = _next_page(pdf, report_title, status_label, payload.report_version, page_no)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(LEFT, y, "Authorization Page")
    y -= 20
    pdf.setFont("Helvetica", 10)
    pdf.drawString(LEFT, y, "This report is issued by Phisudo VAPT for authorized recipients.")
    y -= 24
    pdf.rect(LEFT, y - 86, RIGHT - LEFT, 92, stroke=1, fill=0)
    pdf.drawString(LEFT + 10, y - 16, "Prepared By: Phisudo Security Team")
    pdf.drawString(LEFT + 10, y - 34, f"Lead Pentester: {project['lead_pentester']}")
    pdf.drawString(LEFT + 10, y - 52, f"Client PIC: {project.get('pic_client_name', '-')}")
    pdf.drawString(LEFT + 10, y - 70, f"Report Status: {status_label} | Version: {payload.report_version}")

    pdf.save()
    buffer.seek(0)

    safe_name = str(project["name"]).replace(" ", "_")
    filename = f"Phisudo_VAPT_Report_{safe_name}_{payload.report_status}_v{payload.report_version}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
