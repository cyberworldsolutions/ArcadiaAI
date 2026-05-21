import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from '@/app/lib/supabase';
const supabase = getSupabase();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("/");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(error);
    return NextResponse.redirect("/auth?error=1");
  }

  return NextResponse.redirect("/dashboard");
}
