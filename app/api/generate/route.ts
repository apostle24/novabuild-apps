
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { prompt, existingCode, mode } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Please enter an instruction." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is missing." },
        { status: 500 }
      );
    }

    const isEditing = mode === "edit";

    if (isEditing && !existingCode) {
      return NextResponse.json(
        { error: "Generate an application before editing." },
        { status: 400 }
      );
    }

    const systemPrompt = isEditing
      ? `
You are NOVABUILD AI, an expert React developer.

The user wants to modify an existing React application.

Return the COMPLETE updated application code, not just the changes.

RULES:
- Return only JavaScript React code.
- No Markdown or code fences.
- Keep the existing features unless the user requests their removal.
- Apply the requested changes.
- Use one component named App.
- Use export default function App().
- Use React and Tailwind CSS.
- Do not use import statements.
- Keep the code concise.
- Close every JSX tag, bracket, function and string.
- Do not truncate the application.
- Preserve responsive design.
- Return the entire updated component.
      `.trim()
      : `
You are NOVABUILD AI, an expert React application developer.

Generate a complete React application based on the user's request.

RULES:
- Return only JavaScript React code.
- No Markdown or code fences.
- Create one component named App.
- Use export default function App().
- Use React and Tailwind CSS.
- Do not use import statements.
- Use React.useState for interactive elements.
- Make the interface responsive.
- Use realistic sample data.
- Keep the implementation concise.
- Close every JSX tag, bracket, function and string.
- Do not truncate the application.
- Finish the complete application.
      `.trim();

    const messages = isEditing
      ? [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `
EXISTING APPLICATION CODE:

${existingCode}

USER'S REQUESTED CHANGES:

${prompt}

Return the complete updated application.
            `.trim(),
          },
        ]
      : [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3001",
          "X-Title": "NOVABUILD AI",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          temperature: 0.2,
          max_tokens: 12000,          messages,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            `OpenRouter request failed: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const choice = data?.choices?.[0];
    let generatedCode = choice?.message?.content?.trim();

    if (!generatedCode) {
      return NextResponse.json(
        { error: "The AI returned an empty response." },
        { status: 500 }
      );
    }

    if (choice?.finish_reason === "length") {
      return NextResponse.json(
        {
          error:
            "The AI response reached its output limit. Try a smaller change.",
        },
        { status: 422 }
      );
    }

    generatedCode = generatedCode
      .replace(/^```(?:jsx|tsx|javascript|js)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    if (
      !generatedCode.includes("function App") &&
      !generatedCode.includes("App =")
    ) {
      return NextResponse.json(
        { error: "The AI did not return a valid App component." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      code: generatedCode,
      result: generatedCode,
    });
  } catch (error) {
    console.error("NOVABUILD API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}