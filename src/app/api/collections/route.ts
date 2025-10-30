import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createCollection,
  listCollections,
  getCollection,
  updateCardOrder,
  deleteCollection,
  updateCollectionName
} from "@/server/db/collections";
import { ensureSchema } from "@/server/db/conversations";
import { log } from "@/lib/observability/logger";
import { cookies } from "next/headers";
import { getUserById } from "@/server/db/users";

const createCollectionSchema = z.object({
  name: z.string().min(1),
  cards: z.array(z.any()),
  userId: z.string().uuid()
});

const updateOrderSchema = z.object({
  collectionId: z.string().uuid(),
  cards: z.array(z.any())
});

const updateNameSchema = z.object({
  collectionId: z.string().uuid(),
  name: z.string().min(1)
});

const deleteCollectionSchema = z.object({
  collectionId: z.string().uuid()
});

/**
 * GET /api/collections
 * List all collections for a user
 */
export async function GET(request: Request) {
  try {
    await ensureSchema();
    
    // Get user ID from query params (for now, until we have proper session management)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const collections = await listCollections(userId);

    return NextResponse.json({ collections });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to list collections",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json(
      { error: "Unable to list collections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections
 * Create a new collection or update card order
 */
export async function POST(request: Request) {
  try {
    await ensureSchema();
    
    const body = await request.json();
    const { action } = body;

    // Create new collection
    if (action === "create" || !action) {
      const { name, cards, userId } = createCollectionSchema.parse(body);
      const collectionId = await createCollection(name, cards, userId);
      
      return NextResponse.json({ collectionId, message: "Collection created successfully" });
    }

    // Update card order
    if (action === "updateOrder") {
      const { collectionId, cards } = updateOrderSchema.parse(body);
      await updateCardOrder(collectionId, cards);
      
      return NextResponse.json({ message: "Card order updated successfully" });
    }

    // Update collection name
    if (action === "updateName") {
      const { collectionId, name } = updateNameSchema.parse(body);
      await updateCollectionName(collectionId, name);
      
      return NextResponse.json({ message: "Collection name updated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    log({
      level: "error",
      message: "Collection operation failed",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json(
      { error: "Unable to perform collection operation" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/collections
 * Delete a collection
 */
export async function DELETE(request: Request) {
  try {
    await ensureSchema();
    
    const body = await request.json();
    const { collectionId } = deleteCollectionSchema.parse(body);

    await deleteCollection(collectionId);

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to delete collection",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json(
      { error: "Unable to delete collection" },
      { status: 400 }
    );
  }
}
