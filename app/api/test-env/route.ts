import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasStorrikKey: !!process.env.STORRIK_SECRET_KEY,
    hasStorrikWebhook: !!process.env.STORRIK_WEBHOOK_SECRET,
    storrikKeyLength: process.env.STORRIK_SECRET_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allStorrikVars: Object.keys(process.env).filter(k => k.includes('STORRIK')),
  });
}
