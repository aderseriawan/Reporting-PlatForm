"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "@/lib/api-client";
import type { Client } from "@/lib/types";

type ClientListResponse = { items: Client[] };
type ClientCreateResponse = { item: Client };

export default function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    const result = await apiGet<ClientListResponse>("/clients");
    setItems(result.items);
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q) || item.username.toLowerCase().includes(q));
  }, [items, query]);

  async function createClient() {
    if (!name.trim() || !username.trim()) {
      setError("Client name and username are required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiPost<ClientCreateResponse, { name: string; username: string; status: string }>("/clients", {
        name,
        username,
        status: "Active",
      });
      setName("");
      setUsername("");
      await loadClients();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="card split-layout">
        <article className="card surface-soft">
          <h2 style={{ marginTop: 0 }}>Create Client</h2>
          <p className="muted">Register a new organization profile for project onboarding.</p>
          <label className="field">
            <span>Client Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="PT Example Indonesia" />
          </label>
          <label className="field">
            <span>Client Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="pt-example" />
          </label>
          <div className="inline-actions" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" type="button" onClick={() => void createClient()} disabled={loading}>
              {loading ? "Saving..." : "Create Client"}
            </button>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Client Registry</h2>
          <label className="field" style={{ marginTop: 0 }}>
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or username"
            />
          </label>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.username}</td>
                  <td>
                    <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                  </td>
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </>
  );
}
