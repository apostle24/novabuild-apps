"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Rocket,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { ProjectFile } from "@/types/project";

export default function DeployPage() {
  const [deploying, setDeploying] = useState(false);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  async function deploy() {
    setDeploying(true);
    setMessage("Preparing your application...");
    setUrl("");

    try {
      const savedFiles = localStorage.getItem(
        "novabuild-studio-files"
      );

      const files: ProjectFile[] = savedFiles
        ? JSON.parse(savedFiles)
        : [];

      if (!Array.isArray(files) || files.length === 0) {
        throw new Error(
          "No project files found. Open your project in Studio and save it first."
        );
      }

      setMessage("Sending your application to Vercel...");

      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: "novabuild-current-project",
          files,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Deployment failed."
        );
      }

      setUrl(data.url || "");
      setMessage(
        data.url
          ? "Your application is now deployed."
          : "Deployment completed."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Deployment failed."
      );
    } finally {
      setDeploying(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="h-16 border-b border-slate-800 flex items-center px-6">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-white mr-4"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="font-bold text-lg">
            Deploy Application
          </h1>

          <p className="text-xs text-slate-500">
            Publish your NOVABUILD AI application
          </p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
            <Rocket size={30} />
          </div>

          <h2 className="text-3xl font-bold">
            Publish your application
          </h2>

          <p className="text-slate-400 mt-3 max-w-xl">
            Take your AI-generated application from
            NOVABUILD Studio and publish it to the web.
          </p>

          <button
            onClick={deploy}
            disabled={deploying}
            className="mt-8 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold flex items-center gap-2"
          >
            {deploying ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Deploying...
              </>
            ) : (
              <>
                <Rocket size={18} />
                Deploy Application
              </>
            )}
          </button>

          {message && (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              {url ? (
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle2 size={20} />
                  <span>{message}</span>
                </div>
              ) : (
                message
              )}
            </div>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-cyan-300 hover:bg-cyan-500/10"
            >
              <span className="truncate mr-4">
                {url}
              </span>

              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </section>
    </main>
  );
}