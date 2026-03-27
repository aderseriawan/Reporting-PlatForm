"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "@/lib/api-client";
import type { Client, Project } from "@/lib/types";

type ProjectListResponse = { items: Project[] };
type ProjectCreateResponse = { item: Project };
type ClientListResponse = { items: Client[] };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [picClientName, setPicClientName] = useState("Client PIC");
  const [picClientContact, setPicClientContact] = useState("+62-");
  const [leadPentester, setLeadPentester] = useState("Security Analyst");
  const [leadPentesterContact, setLeadPentesterContact] = useState("+62-");
  const [assets, setAssets] = useState("sample.target.local");
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [projectResponse, clientResponse] = await Promise.all([
      apiGet<ProjectListResponse>("/projects"),
      apiGet<ClientListResponse>("/clients"),
    ]);
    setProjects(projectResponse.items);
    setClients(clientResponse.items);
    if (!clientId && clientResponse.items.length > 0) {
      setClientId(clientResponse.items[0].id);
    }
  }, [clientId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const searchPass =
        q.length === 0 ||
        project.name.toLowerCase().includes(q) ||
        project.client_name.toLowerCase().includes(q) ||
        project.assets.toLowerCase().includes(q);
      const statusPass = statusFilter === "All" || project.status === statusFilter;
      return searchPass && statusPass;
    });
  }, [projects, query, statusFilter]);

  async function createProject() {
    if (!name.trim() || !clientId || !picClientName.trim() || !picClientContact.trim()) {
      setError("Project name, client, PIC client name, and PIC contact are required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiPost<
        ProjectCreateResponse,
        {
          name: string;
          client_id: string;
          pic_client_name: string;
          pic_client_contact: string;
          status: string;
          lead_pentester: string;
          lead_pentester_contact: string;
          assets: string;
          method: string;
        }
      >("/projects", {
        name,
        client_id: clientId,
        pic_client_name: picClientName,
        pic_client_contact: picClientContact,
        status: "On Progress",
        lead_pentester: leadPentester,
        lead_pentester_contact: leadPentesterContact,
        assets,
        method: "White Box",
      });
      setName("");
      await loadData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>Projects</h1>
      <p className="muted">Manage VAPT engagements, PIC ownership, and reporting contacts.</p>

      <div className="grid-2">
        <article className="card surface-soft">
          <h2 style={{ marginTop: 0 }}>Create Project</h2>
          <label className="field">
            <span>Project Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="VAPT API Banking" />
          </label>
          <label className="field">
            <span>Client</span>
            <select value={clientId} onChange={(event) => setClientId(event.target.value)}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid-2">
            <label className="field">
              <span>PIC Client Name</span>
              <input value={picClientName} onChange={(event) => setPicClientName(event.target.value)} />
            </label>
            <label className="field">
              <span>PIC Client Contact</span>
              <input value={picClientContact} onChange={(event) => setPicClientContact(event.target.value)} />
            </label>
          </div>
          <div className="grid-2">
            <label className="field">
              <span>Lead Pentester</span>
              <input value={leadPentester} onChange={(event) => setLeadPentester(event.target.value)} />
            </label>
            <label className="field">
              <span>Lead Pentester Contact</span>
              <input value={leadPentesterContact} onChange={(event) => setLeadPentesterContact(event.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Assets</span>
            <input value={assets} onChange={(event) => setAssets(event.target.value)} />
          </label>
          <div className="inline-actions" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" type="button" onClick={() => void createProject()} disabled={loading}>
              {loading ? "Saving..." : "Create Project"}
            </button>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Project Pipeline</h2>
          <div className="grid-2">
            <label className="field" style={{ marginTop: 0 }}>
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" />
            </label>
            <label className="field" style={{ marginTop: 0 }}>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All</option>
                <option>On Progress</option>
                <option>Fixing</option>
                <option>Done</option>
              </select>
            </label>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Client PIC</th>
                <th>Lead Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                    <div className="muted">{project.client_name}</div>
                  </td>
                  <td>
                    {project.pic_client_name}
                    <div className="muted">{project.pic_client_contact}</div>
                  </td>
                  <td>
                    {project.lead_pentester}
                    <div className="muted">{project.lead_pentester_contact}</div>
                  </td>
                  <td>
                    <span className={`status ${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span>
                  </td>
                  <td>
                    <Link className="btn btn-muted" href={`/projects/${project.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
