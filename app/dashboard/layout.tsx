import React from "react";
import { redirect } from "next/navigation";
import { getSupabase } from '@/app/lib/supabase';
const supabase = getSupabase();

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div>
      {/* your layout markup */}
      {children}
    </div>
  );
}
