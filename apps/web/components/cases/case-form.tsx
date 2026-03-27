"use client";

import { useMemo, useState } from "react";

import { apiPatch, apiPost } from "@/lib/api-client";
import type { CaseItem, Project, RefineResponse } from "@/lib/types";
import {
  buildCvssVector,
  calculateCvssScore,
  CvssMatrix,
  defaultCvssMetrics,
  parseCvssVector,
  type CvssMetrics,
} from "@/components/cases/cvss-matrix";
import { RichTextEditor } from "@/components/editors/rich-text-editor";

type CaseFormProps = {
  projects: Project[];
  caseItem?: CaseItem;
  onSaved: (savedCase: CaseItem) => void;
};

type EditableSections = {
  description: string;
  threat_risk: string;
  recommendation: string;
  reference: string;
  steps_to_reproduce: string;
  retest_result: string;
};

const refineEnabledSections: Array<keyof EditableSections> = [
  "description",
  "threat_risk",
  "recommendation",
  "reference",
  "retest_result",
];

function severityFromScore(score: number): string {
  if (score >= 9) return "Critical";
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function severityClass(severity: string): string {
  return `severity ${severity.toLowerCase()}`;
}

function toDateTimeLocal(input: string): string {
  if (!input) return "";
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function CaseForm({ projects, caseItem, onSaved }: CaseFormProps) {
  const initialMetrics = caseItem?.cvss_vector ? parseCvssVector(caseItem.cvss_vector) : defaultCvssMetrics();

  const [projectId, setProjectId] = useState(caseItem?.project_id ?? projects[0]?.id ?? "");
  const [name, setName] = useState(caseItem?.name ?? "");
  const [status, setStatus] = useState(caseItem?.status ?? "Submitted");
  const [asset, setAsset] = useState(caseItem?.asset ?? "");
  const [type, setType] = useState(caseItem?.type ?? "Web");
  const [reporter, setReporter] = useState(caseItem?.reporter ?? "Security Analyst");
  const [foundDate, setFoundDate] = useState(toDateTimeLocal(caseItem?.found_date ?? new Date().toISOString()));
  const [cwe, setCwe] = useState(caseItem?.cwe ?? "");
  const [metrics, setMetrics] = useState<CvssMetrics>(initialMetrics);
  const [sections, setSections] = useState<EditableSections>({
    description: caseItem?.description ?? "",
    threat_risk: caseItem?.threat_risk ?? "",
    recommendation: caseItem?.recommendation ?? "",
    reference: caseItem?.reference ?? "",
    steps_to_reproduce: caseItem?.steps_to_reproduce ?? "",
    retest_result: caseItem?.retest_result ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refineLoading, setRefineLoading] = useState<keyof EditableSections | null>(null);
  const [refinePreview, setRefinePreview] = useState<{
    section: keyof EditableSections;
    refined: string;
    summary: string[];
  } | null>(null);

  const cvssScore = useMemo(() => calculateCvssScore(metrics), [metrics]);
  const cvssSeverity = useMemo(() => severityFromScore(cvssScore), [cvssScore]);
  const cvssVector = useMemo(() => buildCvssVector(metrics), [metrics]);

  async function handleRefine(section: keyof EditableSections) {
    setRefineLoading(section);
    setError(null);
    try {
      const payload = {
        case_id: caseItem?.id ?? "new-case",
        section,
        raw_content_html: sections[section] || "No content provided.",
        context: {
          project_name: projects.find((p) => p.id === projectId)?.name ?? "Unknown Project",
          asset,
          case_title: name,
          cwe,
          cvss_score: cvssScore,
          cvss_severity: cvssSeverity,
          cvss_vector: cvssVector,
        },
      };

      const result = await apiPost<RefineResponse, typeof payload>("/cases/refine", payload);
      setRefinePreview({ section, refined: result.refined_content_html, summary: result.changes_summary });
    } catch (refineError) {
      setError(refineError instanceof Error ? refineError.message : "Failed to refine content");
    } finally {
      setRefineLoading(null);
    }
  }

  function applyRefine() {
    if (!refinePreview) return;
    setSections((prev) => ({ ...prev, [refinePreview.section]: refinePreview.refined }));
    setRefinePreview(null);
  }

  async function handleSave() {
    if (!projectId || !name.trim() || !asset.trim() || !reporter.trim()) {
      setError("Project, case title, asset, and reporter are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      project_id: projectId,
      name,
      status,
      asset,
      type,
      reporter,
      found_date: new Date(foundDate).toISOString(),
      cwe,
      cvss_score: cvssScore,
      cvss_severity: cvssSeverity,
      cvss_vector: cvssVector,
      description: sections.description,
      threat_risk: sections.threat_risk,
      recommendation: sections.recommendation,
      reference: sections.reference,
      steps_to_reproduce: sections.steps_to_reproduce,
      retest_result: sections.retest_result,
    };

    try {
      const savedCase = caseItem
        ? await apiPatch<CaseItem, Partial<typeof payload>>(`/cases/${caseItem.id}`, payload)
        : await apiPost<CaseItem, typeof payload>("/cases", payload);
      onSaved(savedCase);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save case");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>{caseItem ? "Edit Case" : "Create Case"}</h1>

        <div className="grid-3">
          <label className="field">
            <span>Name *</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Case name" />
          </label>
          <label className="field">
            <span>Status *</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Submitted</option>
              <option>Fixing</option>
              <option>Done</option>
            </select>
          </label>
          <label className="field">
            <span>Project *</span>
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid-3">
          <label className="field">
            <span>Type *</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option>Web</option>
              <option>API</option>
              <option>Mobile</option>
              <option>Infrastructure</option>
            </select>
          </label>
          <label className="field">
            <span>Asset *</span>
            <input value={asset} onChange={(event) => setAsset(event.target.value)} placeholder="Search asset" />
          </label>
          <label className="field">
            <span>Reporter *</span>
            <input value={reporter} onChange={(event) => setReporter(event.target.value)} />
          </label>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>Found Date *</span>
            <input type="datetime-local" value={foundDate} onChange={(event) => setFoundDate(event.target.value)} />
          </label>
          <label className="field">
            <span>CWE</span>
            <input value={cwe} onChange={(event) => setCwe(event.target.value)} placeholder="Select CWE" />
          </label>
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>CVSS Score</h2>
        <CvssMatrix metrics={metrics} onChange={setMetrics} />

        <h3 style={{ marginBottom: 8 }}>Calculated Score</h3>
        <div className="grid-3">
          <div className="field" style={{ marginTop: 0 }}>
            <span>Severity</span>
            <div className={severityClass(cvssSeverity)}>{cvssSeverity.toUpperCase()}</div>
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <span>CVSS Score</span>
            <input value={cvssScore.toFixed(1)} readOnly />
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <span>CVSS Vector</span>
            <input value={cvssVector} readOnly />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Description</h2>
        <div className="section-head">
          <span className="muted">Impact and root cause</span>
          <button className="btn btn-muted" type="button" onClick={() => void handleRefine("description")}>
            {refineLoading === "description" ? "Refining..." : "AI Refine"}
          </button>
        </div>
        <RichTextEditor value={sections.description} onChange={(next) => setSections((prev) => ({ ...prev, description: next }))} />
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Steps to Reproduce (PoC)</h2>
        <RichTextEditor
          value={sections.steps_to_reproduce}
          onChange={(next) => setSections((prev) => ({ ...prev, steps_to_reproduce: next }))}
        />
      </section>

      {(
        [
          ["threat_risk", "Threat and Risk"],
          ["recommendation", "Recommendation"],
          ["reference", "Reference"],
          ["retest_result", "Retest Result"],
        ] as const
      ).map(([key, label]) => (
        <section key={key} className="card">
          <div className="section-head">
            <h2 style={{ margin: 0 }}>{label}</h2>
            {refineEnabledSections.includes(key) ? (
              <button className="btn btn-muted" type="button" onClick={() => void handleRefine(key)}>
                {refineLoading === key ? "Refining..." : "AI Refine"}
              </button>
            ) : null}
          </div>
          <RichTextEditor value={sections[key]} onChange={(next) => setSections((prev) => ({ ...prev, [key]: next }))} />
        </section>
      ))}

      {refinePreview ? (
        <section className="card">
          <strong>Refinement Preview ({refinePreview.section})</strong>
          <pre className="preview-box">{refinePreview.refined}</pre>
          <ul>
            {refinePreview.summary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="inline-actions">
            <button className="btn btn-muted" type="button" onClick={() => setRefinePreview(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={applyRefine}>
              Apply
            </button>
          </div>
        </section>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <section className="card">
        <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-primary" type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save Case"}
          </button>
        </div>
      </section>
    </>
  );
}
