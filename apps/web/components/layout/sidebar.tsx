"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", hint: "Overview" },
  { href: "/clients", label: "Clients", hint: "Organization profiles" },
  { href: "/projects", label: "Projects", hint: "VAPT engagements" },
  { href: "/notifications", label: "Notifications", hint: "Workflow updates" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <div className="brand-block">
        <div className="brand-badge">PV</div>
        <div>
          <h1>Phisudo VAPT</h1>
          <p>Security Reporting Platform</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link key={link.href} href={link.href} className={isActive ? "nav-link active" : "nav-link"}>
              <span>{link.label}</span>
              <small>{link.hint}</small>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Environment</p>
        <strong>Production-like MVP</strong>
      </div>
    </aside>
  );
}
