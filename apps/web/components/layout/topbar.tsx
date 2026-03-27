"use client";

import { useEffect, useState } from "react";

export function Topbar({ title }: { title: string }) {
  const [fullName, setFullName] = useState("Analyst");

  useEffect(() => {
    const raw = localStorage.getItem("vapt_profile");
    if (!raw) return;
    try {
      const profile = JSON.parse(raw) as { full_name?: string };
      if (profile.full_name) {
        setFullName(profile.full_name);
      }
    } catch {
      // no-op for malformed local storage value
    }
  }, []);

  return (
    <header className="topbar">
      <div>
        <p className="crumb">Phisudo VAPT / Workspace</p>
        <strong>{title}</strong>
      </div>
      <div className="topbar-user">
        <span>{fullName}</span>
        <small>Lead Pentester</small>
      </div>
    </header>
  );
}
