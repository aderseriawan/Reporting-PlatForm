"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiPost } from "@/lib/api-client";

type LoginResponse = {
  access_token: string;
  token_type: string;
  profile: {
    id: string;
    username: string;
    full_name: string;
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("ChangeMe123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiPost<LoginResponse, { username: string; password: string }>("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("vapt_token", result.access_token);
      localStorage.setItem("vapt_profile", JSON.stringify(result.profile));
      router.push("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <section className="split-layout" style={{ width: "100%", maxWidth: 980 }}>
        <article className="card" style={{ background: "linear-gradient(180deg, #0e1d33 0%, #132b49 100%)", color: "#e8f1ff" }}>
          <h1 style={{ marginTop: 0, fontSize: 32 }}>Phisudo VAPT</h1>
          <p style={{ color: "#bdd2f0" }}>
            Professional workspace for vulnerability reporting, CVSS assessment, and AI-assisted refinement.
          </p>
          <ul>
            <li>Client & project tracking</li>
            <li>Structured vulnerability lifecycle</li>
            <li>AI refine with analyst-controlled apply/cancel</li>
          </ul>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Sign in</h2>
          <p className="muted">Use your assigned analyst account to access reporting workflow.</p>
          <div className="field">
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <div className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="inline-actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="button" onClick={() => void onLogin()} disabled={loading}>
              {loading ? "Signing in..." : "Login to Workspace"}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
