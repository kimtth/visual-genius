import { NextRequest, NextResponse } from "next/server";
import {
  getAllSettings,
  updateSettings,
  clearSettingsCache,
  loadSettingsCache,
  ensureSettingsSchema
} from "@/server/db/settings";
import { log } from "@/lib/observability/logger";

/**
 * GET /api/settings - Fetch all settings
 */
export async function GET() {
  try {
    // Ensure schema exists first
    await ensureSettingsSchema();
    
    const settings = await getAllSettings();

    // Mask sensitive values for display
    const maskedSettings = settings.map((setting) => {
      const isSensitive = 
        setting.key.includes("KEY") ||
        setting.key.includes("PASSWORD") ||
        setting.key.includes("SECRET") ||
        setting.key.includes("URL");

      return {
        ...setting,
        value: setting.value && isSensitive ? maskValue(setting.value) : setting.value,
        originalValue: setting.value // Keep for edit form
      };
    });

    return NextResponse.json({ settings: maskedSettings });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to fetch settings",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json(
      { error: "Failed to fetch settings. Database may not be initialized." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings - Update settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string | null> };

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Invalid settings format" },
        { status: 400 }
      );
    }

    const success = await updateSettings(settings);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    // Reload cache after update
    await loadSettingsCache();

    log({
      level: "info",
      message: `Updated ${Object.keys(settings).length} settings`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to update settings",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/refresh - Refresh settings cache
 */
export async function POST() {
  try {
    clearSettingsCache();
    await loadSettingsCache();

    return NextResponse.json({ success: true, message: "Settings cache refreshed" });
  } catch (error) {
    log({
      level: "error",
      message: "Failed to refresh settings cache",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return NextResponse.json(
      { error: "Failed to refresh cache" },
      { status: 500 }
    );
  }
}

/**
 * Mask sensitive values for display
 */
function maskValue(value: string): string {
  if (value.length <= 8) {
    return "••••••••";
  }
  return value.substring(0, 4) + "••••••••" + value.substring(value.length - 4);
}
