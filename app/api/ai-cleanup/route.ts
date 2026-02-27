import { NextRequest, NextResponse } from "next/server";
import { aiCleanup } from "@/lib/api/ai-cleanup";
import { spellCheck } from "@/lib/utils/spellcheck";
import { summarize } from "@/lib/api/ai-cleanup";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type, title } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Missing text", message: "Text is required" },
        { status: 400 }
      );
    }

    if (type === "spellcheck") {
      const result = spellCheck(text);
      return NextResponse.json(result);
    }

    if (type === "ai-cleanup") {
      const result = await aiCleanup(text);
      return NextResponse.json(result);
    }

    if (type === "summarize") {
      const result = await summarize(text, title);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid type", message: "Type must be 'spellcheck', 'ai-cleanup', or 'summarize'" },
      { status: 400 }
    );

  } catch (error) {
    console.error("AI cleanup API error:", error);
    return NextResponse.json(
      { error: "API Error", message: "Failed to process cleanup request" },
      { status: 500 }
    );
  }
}
