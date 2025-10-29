import { NextResponse } from "next/server";
import { z } from "zod";
import { searchImages } from "@/server/azure/imageSearch";
import { log } from "@/lib/observability/logger";

const requestSchema = z.object({
  query: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = requestSchema.parse(body);

    const results = await searchImages(query);

    return NextResponse.json({ results });
  } catch (error) {
    log({
      level: "error",
      message: "Image search failed",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json({ error: "Unable to search images" }, { status: 400 });
  }
}
