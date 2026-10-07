"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  Bot,
  Download,
  File,
  Folder,
  Play,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Pencil,
} from "lucide-react";
import Link from "next/link";

type ProjectFile = {
  path: string;
  content: string;
};

const starterFiles: ProjectFile[] = [
  {
    path: "src/App.jsx",
    content: `import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <p className="text-cyan-400 font-semibold mb-3">NOVABUILD AI</p>
        <h1 className="text-5xl font-bold mb-6">
          Build anything with AI.
        </h1>
        <p className="text-slate-400 text-lg">
          Describe your idea and NOVABUILD AI will turn it into a working application.
        </p>
      </div>
    </div>
  );
}`,
  },
  {
    path: "src/main.jsx",
    content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NOVABUILD AI App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  },
];

export default function StudioPage() {
  const [files, setFiles] = useState<ProjectFile[]>(starterFiles);
  const [selectedPath, setSelectedPath] = useState("src/App.jsx");

  const [prompt, setPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);

  const selectedFile = useMemo(
    () => files.find((file) => file.path === selectedPath),
    [files, selectedPath]
  );

  useEffect(() => {
    const saved = localStorage.getItem("novabuild-studio-files");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setFiles(parsed);

          if (parsed[0]?.path) {
            setSelectedPath(parsed[0].path);
          }
        }
      } catch {
        console.error("Could not load saved Studio files.");
      }
    }
  }, []);

  function updateSelectedFile(content: string) {
    setFiles((current) =>
      current.map((file) =>
        file.path === selectedPath
          ? { ...file, content }
          : file
      )
    );
  }

  function createFile() {
    const path = window.prompt("Enter the new file path:");

    if (!path?.trim()) return;

    if (files.some((file) => file.path === path.trim())) {
      setMessage("A file with that name already exists.");
      return;
    }

    const newFile = {
      path: path.trim(),
      content: "",
    };

    setFiles((current) => [...current, newFile]);
    setSelectedPath(newFile.path);
    setMessage(`Created ${newFile.path}`);
  }

  function renameSelectedFile() {
    if (!selectedFile) return;

    const newPath = window.prompt(
      "Enter the new file path:",
      selectedFile.path
    );

    if (!newPath?.trim() || newPath === selectedFile.path) return;

    if (files.some((file) => file.path === newPath.trim())) {
      setMessage("A file with that name already exists.");
      return;
    }

    setFiles((current) =>
      current.map((file) =>
        file.path === selectedPath
          ? { ...file, path: newPath.trim() }
          : file
      )
    );

    setSelectedPath(newPath.trim());
    setMessage("File renamed.");
  }

  function deleteSelectedFile() {
    if (!selectedFile) return;

    if (!window.confirm(`Delete ${selectedFile.path}?`)) {
      return;
    }

    const remaining = files.filter(
      (file) => file.path !== selectedPath
    );

    setFiles(remaining);

    if (remaining.length > 0) {
      setSelectedPath(remaining[0].path);
    } else {
      setSelectedPath("");
    }

    setMessage("File deleted.");
  }

  async function generateProject() {
    if (!prompt.trim()) {
      setMessage("Describe the application you want to build.");
      return;
    }

    setGenerating(true);
    setMessage("NOVABUILD AI is building your project...");

    try {
      const response = await fetch("/api/generate-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "AI generation failed."
        );
      }

      if (!Array.isArray(data.files) || data.files.length === 0) {
        throw new Error("AI returned no project files.");
      }

      setFiles(data.files);
      setSelectedPath(data.files[0].path);
      setPrompt("");
      setPreviewKey((key) => key + 1);
      setMessage(
        `Generated ${data.files.length} files successfully.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "AI generation failed."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function editProject() {
    if (!editPrompt.trim()) {
      setMessage("Tell AI what you want to change.");
      return;
    }

    if (files.length === 0) {
      setMessage("There are no project files to edit.");
      return;
    }

    setEditing(true);
    setMessage("NOVABUILD AI is editing your project...");

    try {
      const response = await fetch("/api/edit-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          files,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "AI edit failed."
        );
      }

      if (!Array.isArray(data.files) || data.files.length === 0) {
        throw new Error("AI returned no updated files.");
      }

      setFiles(data.files);
      setSelectedPath(
        data.files.some(
          (file: ProjectFile) => file.path === selectedPath
        )
          ? selectedPath
          : data.files[0].path
      );

      setEditPrompt("");
      setPreviewKey((key) => key + 1);

      setMessage(
        `AI updated ${data.files.length} files successfully.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "AI edit failed."
      );
    } finally {
      setEditing(false);
    }
  }

  function saveProject() {
    const storageKey = "novabuild-projects";

    let projects: Array<{
      id: string;
      name: string;
      description?: string;
      files: ProjectFile[];
      createdAt: string;
      updatedAt: string;
    }> = [];

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          projects = parsed;
        }
      }
    } catch {
      projects = [];
    }

    const existingProject = projects.find(
      (project) => project.id === "novabuild-current-project"
    );

    const now = new Date().toISOString();

    const project = {
      id: "novabuild-current-project",
      name: "My NOVABUILD App",
      description: "Application created with NOVABUILD AI",
      files,
      createdAt: existingProject?.createdAt || now,
      updatedAt: now,
    };

    const updatedProjects = [
      project,
      ...projects.filter(
        (item) => item.id !== "novabuild-current-project"
      ),
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedProjects)
    );

    localStorage.setItem(
      "novabuild-studio-files",
      JSON.stringify(files)
    );

    setMessage("Project saved successfully.");
  }
  function exportProject() {
    const project = {
      name: "novabuild-project",
      files,
    };

    const blob = new Blob(
      [JSON.stringify(project, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "novabuild-project.json";
    link.click();

    URL.revokeObjectURL(url);

    setMessage("Project exported.");
  }

  function getPreviewHtml() {
    const appFile =
      files.find((file) => file.path === "src/App.jsx") ||
      files.find((file) => file.path.endsWith("App.jsx"));

    const mainFile =
      files.find((file) => file.path === "src/main.jsx") ||
      files.find((file) => file.path.endsWith("main.jsx"));

    const htmlFile =
      files.find((file) => file.path === "index.html") ||
      files.find((file) => file.path.endsWith(".html"));

    const appCode = (appFile?.content || "").replace(/import\s+[^;]+;?/g, "").replace(/export\s+default\s+function\s+App/g, "function App").replace(/export\s+default\s+App\s*;?/g, "").replace(/export\s+default\s+/g, "");
    const mainCode = mainFile?.content || "";
    const htmlCode = htmlFile?.content || "";

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script src="https://cdn.tailwindcss.com"></script>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
}
</style>
</head>
<body>
<div id="root"></div>

<script type="text/babel">
${appCode}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
</script>

<script>
try {
  document.title = ${JSON.stringify(
    htmlCode.match(/<title>(.*?)<\/title>/i)?.[1] ||
      "NOVABUILD AI Preview"
  )};
} catch {}
</script>
</body>
</html>
`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between px-5">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <div className="font-bold">NOVABUILD AI Studio</div>
            <div className="text-xs text-slate-500">
              AI App Development Workspace
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/builder"
            className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm"
          >
            Builder
          </Link>

          <button
            onClick={saveProject}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>

          <button
            onClick={exportProject}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      <div className="h-[calc(100vh-4rem)] grid grid-cols-[240px_1fr_1fr]">
        <aside className="border-r border-slate-800 bg-slate-950 p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Explorer
            </div>

            <button
              onClick={createFile}
              className="p-1.5 rounded hover:bg-slate-800"
              title="Create file"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  selectedPath === file.path
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                {file.path.includes("/") ? (
                  <File size={15} />
                ) : (
                  <Folder size={15} />
                )}

                <span className="truncate">
                  {file.path}
                </span>
              </button>
            ))}
          </div>

          {selectedFile && (
            <div className="mt-5 border-t border-slate-800 pt-4 space-y-2">
              <button
                onClick={renameSelectedFile}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm flex items-center gap-2"
              >
                <Pencil size={15} />
                Rename
              </button>

              <button
                onClick={deleteSelectedFile}
                className="w-full px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-950/70 text-red-300 text-sm flex items-center gap-2"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )}

          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Project AI
            </div>

            <div className="text-xs text-slate-500">
              {files.length} files
            </div>
          </div>
        </aside>

        <section className="min-w-0 border-r border-slate-800 flex flex-col">
          <div className="border-b border-slate-800 p-3 bg-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={18} className="text-cyan-400" />
              <span className="font-semibold text-sm">
                Generate Application
              </span>
            </div>

            <div className="flex gap-2">
              <input
                value={prompt}
                onChange={(event) =>
                  setPrompt(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey)
                  ) {
                    generateProject();
                  }
                }}
                placeholder="Describe the app you want to build..."
                className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />

              <button
                onClick={generateProject}
                disabled={generating}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold text-sm flex items-center gap-2"
              >
                <Sparkles size={16} />
                {generating ? "Building..." : "Generate"}
              </button>
            </div>
          </div>

          <div className="border-b border-slate-800 p-3 bg-slate-950">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={18} className="text-purple-400" />
              <span className="font-semibold text-sm">
                AI Edit
              </span>
            </div>

            <div className="flex gap-2">
              <input
                value={editPrompt}
                onChange={(event) =>
                  setEditPrompt(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey)
                  ) {
                    editProject();
                  }
                }}
                placeholder="e.g. Add a pricing section and dark mode..."
                className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
              />

              <button
                onClick={editProject}
                disabled={editing}
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2"
              >
                <Sparkles size={16} />
                {editing ? "Editing..." : "Edit"}
              </button>
            </div>
          </div>

          {message && (
            <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-800 bg-slate-950">
              {message}
            </div>
          )}

          <div className="flex-1 min-h-0">
            <div className="h-10 border-b border-slate-800 flex items-center px-3 text-xs text-slate-400 bg-slate-900">
              {selectedFile?.path || "No file selected"}
            </div>

            {selectedFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={
                  selectedFile.path.endsWith(".json")
                    ? "json"
                    : selectedFile.path.endsWith(".css")
                    ? "css"
                    : selectedFile.path.endsWith(".html")
                    ? "html"
                    : "javascript"
                }
                value={selectedFile.content}
                onChange={(value) =>
                  updateSelectedFile(value || "")
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Create or select a file.
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 bg-white flex flex-col">
          <div className="h-10 border-b border-slate-200 bg-slate-100 text-slate-700 flex items-center justify-between px-3 text-xs">
            <div className="flex items-center gap-2">
              <Play size={14} />
              Live Preview
            </div>

            <button
              onClick={() =>
                setPreviewKey((key) => key + 1)
              }
              className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300"
            >
              Refresh
            </button>
          </div>

          <iframe
            key={previewKey}
            title="NOVABUILD Preview"
            className="w-full flex-1 border-0"
            sandbox="allow-scripts allow-forms"
            srcDoc={getPreviewHtml()}
          />
        </section>
      </div>
    </div>
  );
}






