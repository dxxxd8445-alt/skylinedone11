import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/admin-auth";

export async function GET() {
  try {
    const authContext = await getAuthContext();
    
    return NextResponse.json({
      success: true,
      authenticated: !!authContext,
      context: authContext,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      authenticated: false
    }, { status: 500 });
  }
}