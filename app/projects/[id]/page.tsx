"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();

  useEffect(() => {
    const id = params?.id;

    if (typeof id === "string") {
      window.location.href = `/studio?project=${encodeURIComponent(id)}`;
    }
  }, [params]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-cyan-400 font-semibold">
          NOVABUILD AI
        </div>
        <h1 className="text-2xl font-bold mt-2">
          Opening project...
        </h1>
        <p className="text-slate-500 mt-2">
          Loading your workspace.
        </p>
      </div>
    </main>
  );
}
