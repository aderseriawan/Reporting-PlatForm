"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { apiGet, apiPostBlob } from "@/lib/api-client";
import type { CaseItem, Project } from "@/lib/types";

type ProjectDetailResponse = {
  project: Project;
  cases: CaseItem[];
};

function severityClass(severity: string): string {
  return `severity ${severity.toLowerCase()}`;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [data, setData] = useState<ProjectDetailResponse | null>(null);
  const [query, setQuery] = useState("");
  const [reportStatus, setReportStatus] = useState("Draft");
  const [reportVersion, setReportVersion] = useState("1.0");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await apiGet<ProjectDetailResponse>(`/projects/${projectId}`);
      setData(result);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load project");
    }
  }, [projectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredCases = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.cases;
    return data.cases.filter((item) => item.name.toLowerCase().includes(q) || item.cwe.toLowerCase().includes(q));
  }, [data, query]);

  async function handleExportPdf() {
    setExporting(true);
    setError(null);
    try {
      const blob = await apiPostBlob<{ project_id: string; report_status: string; report_version: string }>(
        "/reports/export",
        {
        project_id: projectId,
        report_status: reportStatus,
        report_version: reportVersion,
      }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Phisudo_VAPT_Report_${projectId}_${reportStatus}_v${reportVersion}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  }

  if (error && !data) {
    return <section className="card error-text">{error}</section>;
  }

  if (!data) {
    return <section className="card">Loading project...</section>;
  }

  const doneCount = data.cases.filter((item) => item.status === "Done").length;

  return (
    <>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>{data.project.name}</h1>
        <div className="grid-3">
          <article className="card surface-soft kpi-card">
            <h3>Client</h3>
            <p style={{ fontSize: 18 }}>{data.project.client_name}</p>
          </article>
          <article className="card surface-soft kpi-card">
            <h3>Lead Pentester</h3>
            <p style={{ fontSize: 18 }}>{data.project.lead_pentester}</p>
          </article>
          <article className="card surface-soft kpi-card">
            <h3>Case Completion</h3>
            <p style={{ fontSize: 18 }}>
              {doneCount}/{data.cases.length}
            </p>
          </article>
        </div>

        <div className="grid-2" style={{ marginTop: 10 }}>
          <div className="card surface-soft">
            <strong>Client PIC</strong>
            <div>{data.project.pic_client_name}</div>
            <div className="muted">{data.project.pic_client_contact}</div>
          </div>
          <div className="card surface-soft">
            <strong>Lead Pentester Contact</strong>
            <div>{data.project.lead_pentester}</div>
            <div className="muted">{data.project.lead_pentester_contact}</div>
          </div>
        </div>

        <p className="muted">Assets: {data.project.assets}</p>
        <div className="inline-actions">
          <Link className="btn btn-primary" href={`/cases/create?projectId=${projectId}`}>
            Add New Case
          </Link>
          <label className="field" style={{ marginTop: 0, minWidth: 160 }}>
            <span>Report Status</span>
            <select value={reportStatus} onChange={(event) => setReportStatus(event.target.value)}>
              <option>Draft</option>
              <option>Final</option>
            </select>
          </label>
          <label className="field" style={{ marginTop: 0, minWidth: 120 }}>
            <span>Version</span>
            <input value={reportVersion} onChange={(event) => setReportVersion(event.target.value)} placeholder="1.0" />
          </label>
          <button className="btn btn-primary" type="button" onClick={() => void handleExportPdf()} disabled={exporting}>
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
          <Link className="btn btn-muted" href="/projects">
            Back to Projects
          </Link>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="card">
        <div className="section-head">
          <h2 style={{ margin: 0 }}>Findings</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by case title or CWE"
            style={{ maxWidth: 300 }}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Case</th>
              <th>Status</th>
              <th>Severity</th>
              <th>CVSS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <div className="muted">{item.cwe}</div>
                </td>
                <td>
                  <span className={`status ${item.status.toLowerCase().replace(" ", "-")}`}>{item.status}</span>
                </td>
                <td>
                  <span className={severityClass(item.cvss_severity)}>{item.cvss_severity}</span>
                </td>
                <td>{item.cvss_score.toFixed(1)}</td>
                <td>
                  <Link className="btn btn-muted" href={`/cases/${item.id}/edit`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
