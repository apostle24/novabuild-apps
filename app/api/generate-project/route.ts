import { NextRequest, NextResponse } from "next/server";

type GeneratedFile = {
  path: string;
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function extractJson(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code fences if the model adds them
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Find the JSON object inside the response
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI response did not contain a valid JSON object.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

async function callOpenRouter(prompt: string): Promise<GeneratedFile[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "NOVABUILD AI",
      },
      body: JSON.stringify({
        model,

        messages: [
          {
            role: "system",
            content: `
You are NOVABUILD AI, an expert software engineer and AI application builder.

Your job is to generate a complete small React application from the user's request.

RETURN ONLY JSON.

The response must have exactly this structure:

{
  "files": [
    {
      "path": "src/App.jsx",
      "content": "..."
    }
  ]
}

IMPORTANT RULES:

1. Return ONLY the JSON object.
2. Do NOT use markdown code fences.
3. Do NOT include explanations before or after the JSON.
4. Every file must contain:
   - path
   - content
5. Generate valid React code.
6. Use Tailwind CSS classes where appropriate.
7. Keep the project reasonably small.
8. Make the generated application visually polished.
9. Escape quotes, backslashes and newlines correctly inside JSON strings.
10. Never return incomplete JSON.
11. Never return a safety message instead of the JSON.
12. Do not include unsupported file types.
13. Prefer these files when appropriate:
   - src/App.jsx
   - src/main.jsx
   - index.html
14. The main application should be in src/App.jsx.
15. The generated application must be able to run in the NOVABUILD preview.
`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
        max_tokens: 12000,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter API error ${response.status}: ${errorText.slice(0, 1000)}`
    );
  }

  const data = (await response.json()) as OpenRouterResponse;

  const content = data.choices?.[0]?.message?.content;

  if (!content || !content.trim()) {
    throw new Error("OpenRouter returned an empty response.");
  }

  const cleaned = extractJson(content);

  let parsed: {
    files?: GeneratedFile[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid AI JSON:", cleaned);

    throw new Error(
      "The AI returned invalid JSON. Please try generating again."
    );
  }

  if (!Array.isArray(parsed.files)) {
    throw new Error("AI response did not contain a files array.");
  }

  const files = parsed.files
    .filter(
      (file): file is GeneratedFile =>
        typeof file?.path === "string" &&
        typeof file?.content === "string"
    )
    .map((file: GeneratedFile) => ({
      path: file.path,
      content: file.content,
    }));

  if (files.length === 0) {
    throw new Error("AI did not generate any valid project files.");
  }

  return files;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const prompt =
      typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        {
          error: "Please provide a project prompt.",
        },
        {
          status: 400,
        }
      );
    }

    const files = await callOpenRouter(prompt);

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Generate project error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate project.",
      },
      {
        status: 500,
      }
    );
  }
}