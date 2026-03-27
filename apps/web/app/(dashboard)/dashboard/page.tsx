"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet } from "@/lib/api-client";
import type { CaseItem, Client, NotificationItem, Project } from "@/lib/types";

type SidebarResponse = { items: Array<{ label: string; href: string }> };
type ListResponse<T> = { items: T[] };

function severityClass(severity: string): string {
  return `severity ${severity.toLowerCase()}`;
}

export default function DashboardPage() {
  const [modules, setModules] = useState<Array<{ label: string; href: string }>>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    void (async () => {
      const [nav, clientResult, projectResult, caseResult, notificationResult] = await Promise.all([
        apiGet<SidebarResponse>("/dashboard/getSidebarItems"),
        apiGet<ListResponse<Client>>("/clients"),
        apiGet<ListResponse<Project>>("/projects"),
        apiGet<ListResponse<CaseItem>>("/cases"),
        apiGet<ListResponse<NotificationItem>>("/notifications"),
      ]);

      setModules(nav.items);
      setClients(clientResult.items);
      setProjects(projectResult.items);
      setCases(caseResult.items);
      setNotifications(notificationResult.items);
    })();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const highRiskCases = cases.filter((item) => ["High", "Critical"].includes(item.cvss_severity)).length;

  return (
    <>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Operational Dashboard</h1>
        <p className="muted">
          Real-time overview for Phisudo VAPT engagements, reporting progress, and remediation workload.
        </p>
        <div className="grid-3">
          <article className="card kpi-card surface-soft">
            <h3>Active Clients</h3>
            <p>{clients.length}</p>
          </article>
          <article className="card kpi-card surface-soft">
            <h3>Running Projects</h3>
            <p>{projects.length}</p>
          </article>
          <article className="card kpi-card surface-soft">
            <h3>High/Critical Findings</h3>
            <p>{highRiskCases}</p>
          </article>
        </div>
        <div className="inline-actions" style={{ marginTop: 12 }}>
          <Link href="/projects" className="btn btn-primary">
            Open Projects
          </Link>
          <Link href="/cases/create" className="btn btn-muted">
            Create New Case
          </Link>
          <Link href="/notifications" className="btn btn-muted">
            Review Notifications ({unreadCount})
          </Link>
        </div>
      </section>

      <section className="split-layout">
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Module Access</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Route</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((item) => (
                <tr key={item.href}>
                  <td>{item.label}</td>
                  <td>{item.href}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Latest Findings</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 6).map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <span className={`status ${item.status.toLowerCase().replace(" ", "-")}`}>{item.status}</span>
                  </td>
                  <td>
                    <span className={severityClass(item.cvss_severity)}>{item.cvss_severity}</span>
                  </td>
                  <td>{item.cvss_score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </>
  );
}
