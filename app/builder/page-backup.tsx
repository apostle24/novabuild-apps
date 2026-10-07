
"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import JSZip from "jszip";

type SavedProject = {
  id: string;
  name: string;
  prompt: string;
  code: string;
  createdAt: string;
};

type Device = "Desktop" | "Tablet" | "Mobile";

export default function BuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [draftCode, setDraftCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Preview" | "Code">("Preview");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [editInstruction, setEditInstruction] = useState("");
  const [previousCode, setPreviousCode] = useState("");
  const [device, setDevice] = useState<Device>("Desktop");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("novabuild-projects");
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      }
    } catch {
      setError("Could not load saved projects.");
    }
  }, []);

  const persistProjects = (projects: SavedProject[]) => {
    setSavedProjects(projects);
    localStorage.setItem("novabuild-projects", JSON.stringify(projects));
  };

  const saveProject = () => {
    if (!result) {
      setError("Generate an application first.");
      return;
    }

    const project: SavedProject = {
      id: crypto.randomUUID(),
      name: prompt.trim().slice(0, 40) || "Untitled Project",
      prompt,
      code: result,
      createdAt: new Date().toISOString(),
    };

    persistProjects([project, ...savedProjects]);
    setSaveMessage("Project saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const openProject = (project: SavedProject) => {
    setPrompt(project.prompt);
    setResult(project.code);
    setDraftCode(project.code);
    setPreviousCode("");
    setError("");
    setActiveTab("Preview");
    setPreviewKey((key) => key + 1);
  };

  const deleteProject = (id: string) => {
    persistProjects(savedProjects.filter((project) => project.id !== id));
  };

  const generateApp = async () => {
    if (!prompt.trim()) {
      setError("Describe the application you want to build.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "generate" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      const code = data.code || data.result;

      if (!code || typeof code !== "string") {
        throw new Error("The AI returned invalid application code.");
      }

      setResult(code);
      setDraftCode(code);
      setPreviousCode("");
      setActiveTab("Preview");
      setPreviewKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const editApp = async () => {
    if (!result) {
      setError("Generate an application before editing.");
      return;
    }

    if (!editInstruction.trim()) {
      setError("Enter the changes you want.");
      return;
    }

    setEditing(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editInstruction,
          existingCode: result,
          mode: "edit",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI editing failed.");
      }

      const updatedCode = data.code || data.result;

      if (!updatedCode || typeof updatedCode !== "string") {
        throw new Error("The AI returned invalid code.");
      }

      setPreviousCode(result);
      setResult(updatedCode);
      setDraftCode(updatedCode);
      setEditInstruction("");
      setActiveTab("Preview");
      setPreviewKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setEditing(false);
    }
  };

  const applyCodeChanges = () => {
    if (!draftCode.trim()) {
      setError("The code editor is empty.");
      return;
    }

    if (!draftCode.includes("function App") && !draftCode.includes("App =")) {
      setError("Your code should contain an App component.");
      return;
    }

    setPreviousCode(result);
    setResult(draftCode);
    setPreviewKey((key) => key + 1);
    setSaveMessage("Code changes applied!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const undoChange = () => {
    if (!previousCode) return;

    setResult(previousCode);
    setDraftCode(previousCode);
    setPreviousCode("");
    setError("");
    setPreviewKey((key) => key + 1);
  };

  const downloadProject = async () => {
    if (!result) {
      setError("Generate an application first.");
      return;
    }

    try {
      const zip = new JSZip();

      zip.file("src/App.jsx", result);

      zip.file(
        "src/main.jsx",
        `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      );

      zip.file(
        "src/style.css",
        `@tailwind base;
@tailwind components;
@tailwind utilities;`
      );

      zip.file(
        "index.html",
        `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>NOVABUILD Project</title>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>`
      );

      zip.file(
        "package.json",
        JSON.stringify(
          {
            name: "novabuild-project",
            version: "1.0.0",
            private: true,
            type: "module",
            scripts: {
              dev: "vite",
              build: "vite build",
              preview: "vite preview",
            },
            dependencies: {
              "@vitejs/plugin-react": "latest",
              vite: "latest",
              react: "latest",
              "react-dom": "latest",
              tailwindcss: "^3.4.17",
              postcss: "latest",
              autoprefixer: "latest",
            },
          },
          null,
          2
        )
      );

      zip.file(
        "vite.config.js",
        `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});`
      );

      zip.file(
        "tailwind.config.js",
        `export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};`
      );

      zip.file(
        "postcss.config.js",
        `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
      );

      zip.file(
        "README.md",
        `# NOVABUILD Project

## Requirements
Node.js installed.

## Install
npm install

## Start
npm run dev

## Build
npm run build
`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "novabuild-project.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      setError("Could not create the ZIP file.");
    }
  };

  const previewCode = result
    .replace(/^\s*import\s+.*?;?\s*$/gm, "")
    .replace(/export\s+default\s+function\s+App/g, "function App")
    .replace(/export\s+default\s+App\s*;?/g, "");

  const previewDocument = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"></script>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body style="margin:0">
<div id="root"></div>
<script type="text/babel">
${previewCode}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
</script>
</body>
</html>`;

  const deviceWidth =
    device === "Desktop"
      ? "100%"
      : device === "Tablet"
        ? "768px"
        : "375px";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-5 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-wide">
            NOVABUILD <span className="text-violet-400">AI</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={saveProject}
              disabled={!result}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-40"
            >
              Save
            </button>

            <button
              onClick={downloadProject}
              disabled={!result}
              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-40"
            >
              Download ZIP
            </button>

            <a
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h1 className="mb-3 text-lg font-bold">AI App Builder</h1>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website, application, business tool, or digital product you want to create..."
              rows={6}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-violet-500"
            />

            <button
              onClick={generateApp}
              disabled={loading}
              className="mt-3 w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Application"}
            </button>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 font-semibold">AI Editor</h2>

            <textarea
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              placeholder="Tell AI what to change..."
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-violet-500"
            />

            <button
              onClick={editApp}
              disabled={!result || editing}
              className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700 disabled:opacity-40"
            >
              {editing ? "Applying Changes..." : "Apply AI Changes"}
            </button>

            <button
              onClick={undoChange}
              disabled={!previousCode}
              className="mt-2 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-40"
            >
              Undo Last Change
            </button>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 font-semibold">Saved Projects</h2>

            {savedProjects.length === 0 ? (
              <p className="text-sm text-slate-500">No saved projects yet.</p>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-800 p-3"
                  >
                    <button
                      onClick={() => openProject(project)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-medium">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </button>

                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
            <div className="flex gap-2">
              {(["Preview", "Code"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    activeTab === tab
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["Desktop", "Tablet", "Mobile"] as Device[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setDevice(item)}
                  className={`rounded-lg px-3 py-2 text-xs ${
                    device === item
                      ? "bg-slate-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}

              <button
                onClick={() => setPreviewKey((key) => key + 1)}
                disabled={!result}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800 disabled:opacity-40"
              >
                Refresh
              </button>
            </div>
          </div>

          {!result ? (
            <div className="flex min-h-[650px] items-center justify-center p-8 text-center">
              <div>
                <div className="mb-4 text-5xl text-violet-400">✦</div>
                <h2 className="text-xl font-semibold">
                  Your development workspace
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Describe an idea and generate your first application.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[650px] grid-cols-1 xl:grid-cols-2">
              <div className="flex min-w-0 flex-col border-b border-slate-800 xl:border-b-0 xl:border-r">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">src / App.jsx</p>
                    <p className="text-xs text-slate-500">
                      React JavaScript
                    </p>
                  </div>

                  <button
                    onClick={applyCodeChanges}
                    className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold hover:bg-violet-700"
                  >
                    Apply Code Changes
                  </button>
                </div>

                <div className="h-[650px] min-w-0">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={draftCode}
                    onChange={(value) => setDraftCode(value ?? "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      wordWrap: "on",
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      padding: { top: 16 },
                      tabSize: 2,
                    }}
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-col bg-slate-800">
                <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Live Preview
                    </p>
                    <p className="text-xs text-slate-400">{device} View</p>
                  </div>

                  <span className="text-xs text-green-400">● Preview</span>
                </div>

                <div className="flex min-h-[650px] justify-center overflow-auto bg-slate-800 p-3">
                  <div
                    className="h-[620px] max-w-full overflow-hidden rounded-lg bg-white shadow-xl"
                    style={{ width: deviceWidth }}
                  >
                    <iframe
                      key={previewKey}
                      title="NOVABUILD Live Preview"
                      sandbox="allow-scripts"
                      srcDoc={previewDocument}
                      className="h-full w-full border-0 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {saveMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-xl border border-green-800 bg-green-950 px-5 py-3 text-sm text-green-300 shadow-xl">
          {saveMessage}
        </div>
      )}

      {error && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md rounded-xl border border-red-800 bg-red-950 p-4 text-sm text-red-200 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Close error">
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}