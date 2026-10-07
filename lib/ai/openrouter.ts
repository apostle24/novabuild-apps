import type { ProjectFile } from "@/types/project";

type AIOptions = {
  prompt: string;
  files?: ProjectFile[];
  mode?: "generate" | "edit";
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function extractJson(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI did not return a JSON object.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export async function generateProject({
  prompt,
}: AIOptions): Promise<ProjectFile[]> {
  return runAI({
    prompt,
    mode: "generate",
  });
}

export async function editProject({
  prompt,
  files = [],
}: AIOptions): Promise<ProjectFile[]> {
  return runAI({
    prompt,
    files,
    mode: "edit",
  });
}

async function runAI({
  prompt,
  files = [],
  mode,
}: AIOptions): Promise<ProjectFile[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  const systemPrompt =
    mode === "edit"
      ? `
You are NOVABUILD AI, an expert software engineer.

The user has an existing application.

Modify the application according to the user's request.

Return ONLY valid JSON:

{
  "files": [
    {
      "path": "src/App.jsx",
      "content": "..."
    }
  ]
}

Rules:
- Return the COMPLETE updated files.
- Preserve existing functionality.
- Do not explain anything.
- Do not use markdown.
- Do not use code fences.
- Every file must have path and content.
- Keep the application functional.
- Use React and Tailwind CSS where appropriate.
`
      : `
You are NOVABUILD AI, an expert software engineer.

Build a complete React application from the user's request.

Return ONLY valid JSON:

{
  "files": [
    {
      "path": "src/App.jsx",
      "content": "..."
    }
  ]
}

Rules:
- Return only JSON.
- Do not use markdown.
- Do not explain anything.
- Every file must have path and content.
- Use React.
- Use Tailwind CSS where appropriate.
- Make the application visually polished.
- Keep the generated project reasonably small.
- Put the main application in src/App.jsx.
`;

  const userContent =
    mode === "edit"
      ? `
USER REQUEST:
${prompt}

CURRENT PROJECT:
${JSON.stringify(files)}
`
      : prompt;

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
            content: systemPrompt,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        temperature: 0.2,
        max_tokens: 16000,
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

  const parsed = JSON.parse(extractJson(content)) as {
    files?: ProjectFile[];
  };

  if (!Array.isArray(parsed.files)) {
    throw new Error("AI response did not contain a files array.");
  }

  const validFiles = parsed.files.filter(
    (file): file is ProjectFile =>
      typeof file?.path === "string" &&
      typeof file?.content === "string"
  );

  if (validFiles.length === 0) {
    throw new Error("AI did not return valid project files.");
  }

  return validFiles;
}
