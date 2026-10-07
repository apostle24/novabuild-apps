import { NextRequest, NextResponse } from "next/server";
import { mkdtemp, writeFile, rm, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";

function runVercel(cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command =
      process.platform === "win32"
        ? "vercel.cmd"
        : "vercel";

    const child = spawn(
      command,
      [
        "--prod",
        "--yes",
      ],
      {
        cwd,
        shell: true,
        windowsHide: true,
        env: {
          ...process.env,
          VERCEL_TOKEN: undefined,
        },
      }
    );

    let output = "";

    child.stdout?.on("data", (data) => {
      output += data.toString();
    });

    child.stderr?.on("data", (data) => {
      output += data.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(
          new Error(
            `Vercel CLI exited with code ${code}.\n${output}`
          )
        );
      }
    });
  });
}

export async function POST(request: NextRequest) {
  let tempDir = "";

  try {
    const body = await request.json();

    const files = Array.isArray(body?.files)
      ? body.files
      : [];

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No project files were provided.",
        },
        { status: 400 }
      );
    }

    tempDir = await mkdtemp(
      path.join(os.tmpdir(), "novabuild-")
    );

    for (const file of files) {
      if (
        typeof file?.path !== "string" ||
        typeof file?.content !== "string"
      ) {
        continue;
      }

      const safePath = file.path
        .replace(/^[/\\]+/, "")
        .replace(/\.\.[/\\]/g, "");

      const targetPath = path.join(
        tempDir,
        safePath
      );

      await mkdir(path.dirname(targetPath), {
        recursive: true,
      });

      await writeFile(
        targetPath,
        file.content,
        "utf8"
      );
    }

    const output = await runVercel(tempDir);

    const urls = output.match(
      /https:\/\/[a-zA-Z0-9.-]+\.vercel\.app/g
    );

    const url = urls
      ? urls[urls.length - 1]
      : "";

    return NextResponse.json({
      success: true,
      message: "Application deployed successfully.",
      url,
      output,
    });
  } catch (error) {
    console.error(
      "NOVABUILD deployment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Deployment failed.",
      },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      await rm(tempDir, {
        recursive: true,
        force: true,
      }).catch(() => {});
    }
  }
}
