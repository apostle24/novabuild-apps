"use client";

import { useState } from "react";

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-white/10 bg-[#0d1220] p-6 md:block">
          <h1 className="text-2xl font-bold text-cyan-400">NOVABUILD AI</h1>

          <nav className="mt-12 space-y-3 text-sm">
            <a href="/dashboard" className="block rounded-xl bg-cyan-500/15 px-4 py-3 text-cyan-300">Dashboard</a>
            <a href="/builder" className="block rounded-xl px-4 py-3 text-gray-400 hover:bg-white/5">AI App Builder</a>
            <a href="/projects" className="block rounded-xl px-4 py-3 text-gray-400 hover:bg-white/5">My Projects</a>
            <a href="/settings" className="block rounded-xl px-4 py-3 text-gray-400 hover:bg-white/5">Settings</a>
          </nav>

          <div className="mt-16 rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-semibold">Free Plan</p>
            <p className="mt-2 text-xs text-gray-400">Start building your ideas with AI.</p>
          </div>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Workspace</p>
              <h2 className="mt-1 text-2xl font-bold">Dashboard</h2>
            </div>
            <a href="/builder" className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-400">
              + New Project
            </a>
          </header>

          <div className="mt-12 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-8 md:p-12">
            <p className="text-sm font-medium text-cyan-300">YOUR AI DEVELOPMENT WORKSPACE</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
              What will you build today?
            </h1>
            <p className="mt-4 max-w-xl text-gray-400">
              Describe your idea. NOVABUILD AI will help turn it into an application.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b1020] p-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Build me a modern booking app for a beauty salon..."
                className="min-h-28 w-full resize-none bg-transparent p-3 text-sm text-white outline-none placeholder:text-gray-500"
              />
              <div className="flex justify-end">
                <a
                  href={prompt.trim() ? `/builder?prompt=${encodeURIComponent(prompt)}` : "/builder"}
                  className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-400"
                >
                  Build with AI →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["01", "AI App Builder", "Turn natural language ideas into application projects."],
              ["02", "Your Projects", "Keep your applications organized in one workspace."],
              ["03", "Deploy Anywhere", "Prepare your projects for web deployment."],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-2xl border border-white/10 bg-[#0d1220] p-6">
                <span className="text-sm text-cyan-400">{number}</span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}