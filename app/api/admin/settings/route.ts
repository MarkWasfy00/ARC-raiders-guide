import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllSettings,
  updateSetting,
  updateSettings,
  initializeDefaultSettings,
} from "@/lib/services/settings-service";
import { invalidateSettingCache, invalidateAllSettingsCache } from "@/lib/services/settings-cache";

/**
 * GET /api/admin/settings
 * Get all settings grouped by category
 */
export async function GET() {
  try {
    const session = await auth();

    // Check if user is staff (admin or moderator)
    const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
    if (!session?.user?.role || !isStaff) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Initialize default settings if needed
    const { created } = await initializeDefaultSettings();
    if (created > 0) {
      console.log(`Initialized ${created} default settings`);
    }

    const settings = await getAllSettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings
 * Update one or more settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is staff (admin or moderator)
    const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
    if (!session?.user?.role || !isStaff) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Handle single setting update
    if (body.key && body.value !== undefined) {
      const updated = await updateSetting(body.key, String(body.value));
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Setting not found" },
          { status: 404 }
        );
      }

      // Invalidate cache for this setting
      invalidateSettingCache(body.key);

      return NextResponse.json({
        success: true,
        setting: updated,
      });
    }

    // Handle multiple settings update
    if (body.settings && Array.isArray(body.settings)) {
      await updateSettings(
        body.settings.map((s: { key: string; value: unknown }) => ({
          key: s.key,
          value: String(s.value),
        }))
      );

      // Invalidate all cache entries when updating multiple settings
      invalidateAllSettingsCache();

      return NextResponse.json({
        success: true,
        message: `Updated ${body.settings.length} settings`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Initialize default settings
 */
export async function POST() {
  try {
    const session = await auth();

    // Check if user is staff (admin or moderator)
    const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
    if (!session?.user?.role || !isStaff) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await initializeDefaultSettings();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error initializing settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize settings" },
      { status: 500 }
    );
  }
}
