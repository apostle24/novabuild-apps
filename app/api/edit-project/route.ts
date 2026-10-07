import { NextRequest, NextResponse } from "next/server";
import { editProject } from "@/lib/ai/openrouter";
import type { ProjectFile } from "@/types/project";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const prompt =
      typeof body?.prompt === "string"
        ? body.prompt.trim()
        : "";

    const files: ProjectFile[] = Array.isArray(body?.files)
      ? body.files
      : [];

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide an edit instruction.",
        },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No project files were provided.",
        },
        { status: 400 }
      );
    }

    const updatedFiles = await editProject({
      prompt,
      files,
      mode: "edit",
    });

    return NextResponse.json({
      success: true,
      files: updatedFiles,
    });
  } catch (error) {
    console.error("Edit project error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to edit project.",
      },
      { status: 500 }
    );
  }
}
