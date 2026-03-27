"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "@/lib/api-client";
import type { NotificationItem } from "@/lib/types";

type NotificationsResponse = { items: NotificationItem[] };
type MessageResponse = { message: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await apiGet<NotificationsResponse>("/notifications");
      setItems(result.items);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load notifications");
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((item) => !item.read);
  }, [items, filter]);

  async function markAllRead() {
    setLoading(true);
    try {
      await apiPost<MessageResponse, Record<string, never>>("/notifications/mark-all-read", {});
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to mark notifications");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>Notifications</h1>
      <p className="muted">Track workflow updates, system alerts, and pending review actions.</p>

      <div className="inline-actions">
        <button className="btn btn-muted" type="button" onClick={() => setFilter("All")}>
          All
        </button>
        <button className="btn btn-muted" type="button" onClick={() => setFilter("Unread")}>
          Unread
        </button>
        <button className="btn btn-primary" type="button" onClick={() => void markAllRead()} disabled={loading}>
          {loading ? "Updating..." : "Mark all as read"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>
                <span className={`status ${item.read ? "done" : "submitted"}`}>{item.read ? "Read" : "Unread"}</span>
              </td>
              <td>{item.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
