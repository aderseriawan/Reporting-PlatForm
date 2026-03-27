"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { CaseForm } from "@/components/cases/case-form";
import { apiGet } from "@/lib/api-client";
import type { Project } from "@/lib/types";

type ProjectListResponse = { items: Project[] };

function CreateCasePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const projectIdFromQuery = useMemo(() => searchParams.get("projectId"), [searchParams]);

  const loadProjects = useCallback(async () => {
    try {
      const result = await apiGet<ProjectListResponse>("/projects");
      const sorted = [...result.items];
      if (projectIdFromQuery) {
        sorted.sort((a, b) => (a.id === projectIdFromQuery ? -1 : b.id === projectIdFromQuery ? 1 : 0));
      }
      setProjects(sorted);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load projects");
    }
  }, [projectIdFromQuery]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  if (error) {
    return <section className="card error-text">{error}</section>;
  }

  if (projects.length === 0) {
    return <section className="card">Loading projects...</section>;
  }

  return (
    <CaseForm
      projects={projects}
      onSaved={(savedCase) => {
        router.push(`/cases/${savedCase.id}/edit`);
      }}
    />
  );
}

export default function CreateCasePage() {
  return (
    <Suspense fallback={<section className="card">Loading projects...</section>}>
      <CreateCasePageInner />
    </Suspense>
  );
}
