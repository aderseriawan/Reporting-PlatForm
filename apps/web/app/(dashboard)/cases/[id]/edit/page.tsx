"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { CaseForm } from "@/components/cases/case-form";
import { apiGet } from "@/lib/api-client";
import type { CaseItem, Project } from "@/lib/types";

type ProjectListResponse = { items: Project[] };

export default function EditCasePage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const [projects, setProjects] = useState<Project[]>([]);
  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [projectResponse, caseResponse] = await Promise.all([
        apiGet<ProjectListResponse>("/projects"),
        apiGet<CaseItem>(`/cases/${caseId}`),
      ]);
      setProjects(projectResponse.items);
      setCaseItem(caseResponse);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load case");
    }
  }, [caseId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (error) {
    return <section className="card error-text">{error}</section>;
  }

  if (!caseItem || projects.length === 0) {
    return <section className="card">Loading case...</section>;
  }

  return <CaseForm projects={projects} caseItem={caseItem} onSaved={setCaseItem} />;
}
