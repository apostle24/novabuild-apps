"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export type ProjectFile = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  content?: string;
};

type Props = {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelect: (file: ProjectFile) => void;
  onCreateFile: (parentId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
};

export default function FileExplorer({
  files,
  activeFileId,
  onSelect,
  onCreateFile,
  onCreateFolder,
  onDelete,
  onRename,
}: Props) {
  const [expanded, setExpanded] = useState<string[]>(["root"]);

  const toggle = (id: string) => {
    setExpanded((items) =>
      items.includes(id)
        ? items.filter((item) => item !== id)
        : [...items, id]
    );
  };

  const rename = (file: ProjectFile) => {
    const name = window.prompt("Enter the new name:", file.name);
    if (name?.trim()) onRename(file.id, name.trim());
  };

  const renderTree = (parentId: string | null, depth = 0) =>
    files
      .filter((file) => file.parentId === parentId)
      .map((file) => {
        const open = expanded.includes(file.id);
        const active = activeFileId === file.id;

        return (
          <div key={file.id}>
            <div
              className={`group flex items-center gap-1 rounded-md px-2 py-2 text-sm ${
                active
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
              style={{ paddingLeft: 8 + depth * 14 }}
            >
              {file.type === "folder" ? (
                <button
                  onClick={() => toggle(file.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {open ? (
                    <FolderOpen size={16} className="text-yellow-400" />
                  ) : (
                    <Folder size={16} className="text-yellow-400" />
                  )}
                  <span className="truncate">{file.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => onSelect(file)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="w-3" />
                  <FileCode size={16} className="text-blue-400" />
                  <span className="truncate">{file.name}</span>
                </button>
              )}

              <div className="hidden items-center gap-1 group-hover:flex">
                {file.type === "folder" && (
                  <>
                    <button title="New file" onClick={() => onCreateFile(file.id)}>
                      <FilePlus size={14} />
                    </button>
                    <button title="New folder" onClick={() => onCreateFolder(file.id)}>
                      <FolderPlus size={14} />
                    </button>
                  </>
                )}
                <button title="Rename" onClick={() => rename(file)}>
                  <span className="text-xs">✎</span>
                </button>
                <button
                  title="Delete"
                  onClick={() => onDelete(file.id)}
                  className="text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {file.type === "folder" && open && renderTree(file.id, depth + 1)}
          </div>
        );
      });

  return (
    <aside className="flex h-full min-h-[300px] flex-col bg-slate-900 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-3">
        <span className="text-xs font-bold tracking-wider text-slate-400">
          EXPLORER
        </span>
        <div className="flex gap-2">
          <button title="New file" onClick={() => onCreateFile(null)}>
            <FilePlus size={17} />
          </button>
          <button title="New folder" onClick={() => onCreateFolder(null)}>
            <FolderPlus size={17} />
          </button>
        </div>
      </div>

      <button
        onClick={() => toggle("root")}
        className="flex items-center gap-2 px-3 py-3 text-left text-xs font-bold"
      >
        {expanded.includes("root") ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
        <FolderOpen size={16} className="text-yellow-400" />
        NOVABUILD PROJECT
      </button>

      {expanded.includes("root") && (
        <div className="overflow-y-auto pb-4">{renderTree(null)}</div>
      )}
    </aside>
  );
}
