import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to maintenance page, admin panel, and static assets
  if (
    pathname === "/maintenance" ||
    pathname.startsWith("/mgmt-x9k2m7") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return await updateSession(request);
  }

  try {
    // Check maintenance mode from database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();

    if (!error && data) {
      let maintenanceMode = false;
      
      try {
        // Try to parse as JSON
        maintenanceMode = JSON.parse(data.value);
      } catch (e) {
        // If not JSON, check if it's a boolean string
        maintenanceMode = data.value === true || data.value === "true";
      }

      if (maintenanceMode) {
        // Redirect to maintenance page
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  } catch (error) {
    console.error("Proxy error checking maintenance mode:", error);
    // On error, allow access (fail open)
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
