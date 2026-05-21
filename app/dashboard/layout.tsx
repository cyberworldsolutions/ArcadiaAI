import { supabase } from "../lib/supabase";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return <>{children}</>;
}
