"use client";

type MetricKey = "AV" | "AC" | "AT" | "PR" | "UI" | "VC" | "VI" | "VA" | "SC" | "SI" | "SA";

export type CvssMetrics = Record<MetricKey, string>;

type MetricOption = {
  label: string;
  value: string;
};

type MetricDefinition = {
  key: MetricKey;
  label: string;
  options: MetricOption[];
};

const metricDefinitions: { title: string; metrics: MetricDefinition[] }[] = [
  {
    title: "Exploitability Metrics",
    metrics: [
      { key: "AV", label: "Attack Vector", options: [{ label: "Physical", value: "P" }, { label: "Local", value: "L" }, { label: "Adjacent", value: "A" }, { label: "Network", value: "N" }] },
      { key: "AC", label: "Attack Complexity", options: [{ label: "Low", value: "L" }, { label: "High", value: "H" }] },
      { key: "AT", label: "Attack Requirements", options: [{ label: "None", value: "N" }, { label: "Present", value: "P" }] },
      { key: "PR", label: "Privileges Required", options: [{ label: "None", value: "N" }, { label: "Low", value: "L" }, { label: "High", value: "H" }] },
      { key: "UI", label: "User Interaction", options: [{ label: "None", value: "N" }, { label: "Passive", value: "P" }, { label: "Active", value: "A" }] },
    ],
  },
  {
    title: "Vulnerable System Impact Metrics",
    metrics: [
      { key: "VC", label: "Confidentiality", options: [{ label: "None", value: "N" }, { label: "Low", value: "L" }, { label: "High", value: "H" }] },
      { key: "VI", label: "Integrity", options: [{ label: "None", value: "N" }, { label: "Low", value: "L" }, { label: "High", value: "H" }] },
      { key: "VA", label: "Availability", options: [{ label: "None", value: "N" }, { label: "Low", value: "L" }, { label: "High", value: "H" }] },
    ],
  },
  {
    title: "Subsequent System Impact Metrics",
    metrics: [
      { key: "SC", label: "Confidentiality", options: [{ label: "None", value: "N" }, { label: "Low", value: "L" }, { label: "High", value: "H" }] },
      { key: "SI", label: "Integrity", options: [{ label: "None", value: "N" }, { label: "Low", value: "L" }, { label: "High", value: "H" }] },
      { key: "SA", label: "Availability", options: [{ label: "None", value: "N" }, { label: "Low", value: "L" }, { label: "High", value: "H" }] },
    ],
  },
];

export function defaultCvssMetrics(): CvssMetrics {
  return {
    AV: "N",
    AC: "L",
    AT: "N",
    PR: "N",
    UI: "N",
    VC: "H",
    VI: "H",
    VA: "H",
    SC: "N",
    SI: "N",
    SA: "N",
  };
}

export function parseCvssVector(vector: string): CvssMetrics {
  const defaults = defaultCvssMetrics();
  if (!vector.startsWith("CVSS:4.0/")) return defaults;

  const parts = vector.replace("CVSS:4.0/", "").split("/");
  for (const part of parts) {
    const [key, value] = part.split(":");
    if (!key || !value) continue;
    if (key in defaults) {
      defaults[key as MetricKey] = value;
    }
  }
  return defaults;
}

export function buildCvssVector(metrics: CvssMetrics): string {
  const order: MetricKey[] = ["AV", "AC", "AT", "PR", "UI", "VC", "VI", "VA", "SC", "SI", "SA"];
  const body = order.map((key) => `${key}:${metrics[key]}`).join("/");
  return `CVSS:4.0/${body}`;
}

const weightMap: Record<MetricKey, Record<string, number>> = {
  AV: { N: 1, A: 0.8, L: 0.6, P: 0.2 },
  AC: { L: 1, H: 0.7 },
  AT: { N: 1, P: 0.7 },
  PR: { N: 1, L: 0.7, H: 0.4 },
  UI: { N: 1, P: 0.7, A: 0.4 },
  VC: { H: 1, L: 0.6, N: 0 },
  VI: { H: 1, L: 0.6, N: 0 },
  VA: { H: 1, L: 0.6, N: 0 },
  SC: { H: 1, L: 0.6, N: 0 },
  SI: { H: 1, L: 0.6, N: 0 },
  SA: { H: 1, L: 0.6, N: 0 },
};

export function calculateCvssScore(metrics: CvssMetrics): number {
  const exploitability = (weightMap.AV[metrics.AV] + weightMap.AC[metrics.AC] + weightMap.AT[metrics.AT] + weightMap.PR[metrics.PR] + weightMap.UI[metrics.UI]) / 5;
  const impact = (weightMap.VC[metrics.VC] + weightMap.VI[metrics.VI] + weightMap.VA[metrics.VA] + weightMap.SC[metrics.SC] + weightMap.SI[metrics.SI] + weightMap.SA[metrics.SA]) / 6;
  const score = Math.min(10, exploitability * 4 + impact * 6);
  return Math.round(score * 10) / 10;
}

type CvssMatrixProps = {
  metrics: CvssMetrics;
  onChange: (next: CvssMetrics) => void;
};

export function CvssMatrix({ metrics, onChange }: CvssMatrixProps) {
  return (
    <div className="cvss-grid">
      {metricDefinitions.map((group) => (
        <article key={group.title} className="cvss-column">
          <h4>{group.title}</h4>
          {group.metrics.map((metric) => (
            <div key={metric.key} className="cvss-metric">
              <p className="cvss-metric-label">
                {metric.label} ({metric.key}) <span>*</span>
              </p>
              <fieldset className="cvss-options">
                {metric.options.map((option) => {
                  const active = metrics[metric.key] === option.value;
                  return (
                    <button
                      key={option.value}
                      className={active ? "cvss-option active" : "cvss-option"}
                      type="button"
                      onClick={() => onChange({ ...metrics, [metric.key]: option.value })}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </fieldset>
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}
