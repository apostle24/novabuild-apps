"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderOpen, Plus, Trash2 } from "lucide-react";

type Project = {
  id: string;
  name: string;
  description?: string;
  files: {
    path: string;
    content: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    const saved = localStorage.getItem("novabuild-projects");

    if (!saved) {
      setProjects([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setProjects(parsed);
      }
    } catch {
      setProjects([]);
    }
  }

  function deleteProject(id: string) {
    if (!window.confirm("Delete this project?")) {
      return;
    }

    const updated = projects.filter(
      (project) => project.id !== id
    );

    localStorage.setItem(
      "novabuild-projects",
      JSON.stringify(updated)
    );

    setProjects(updated);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="font-bold text-lg">
              My Projects
            </h1>
            <p className="text-xs text-slate-500">
              Build and manage your AI applications
            </p>
          </div>
        </div>

        <Link
          href="/studio"
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold flex items-center gap-2"
        >
          <Plus size={17} />
          New Project
        </Link>
      </header>

      <section className="max-w-7xl mx-auto p-6">
        {projects.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-5">
                <FolderOpen size={30} />
              </div>

              <h2 className="text-2xl font-bold mb-2">
                No projects yet
              </h2>

              <p className="text-slate-400 mb-6">
                Create your first application with NOVABUILD AI.
              </p>

              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                <Plus size={18} />
                Create Your First App
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Your Projects
              </h2>
              <p className="text-slate-400 mt-1">
                {projects.length} project
                {projects.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                    <FolderOpen size={21} />
                  </div>

                  <h3 className="font-bold text-lg truncate">
                    {project.name}
                  </h3>

                  <p className="text-sm text-slate-400 mt-2 min-h-10">
                    {project.description ||
                      "NOVABUILD AI application"}
                  </p>

                  <div className="text-xs text-slate-500 mt-4">
                    {Array.isArray(project.files) ? project.files.length : 0} files
                  </div>

                  <div className="flex gap-2 mt-5">
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold text-center"
                    >
                      Open
                    </Link>

                    <button
                      onClick={() =>
                        deleteProject(project.id)
                      }
                      className="px-3 py-2 rounded-lg bg-red-950/50 hover:bg-red-950 text-red-300"
                      title="Delete project"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

