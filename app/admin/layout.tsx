import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthProvider } from "@/components/admin/AdminAuth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { absolute: "Site admin" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Private admin dashboard. Everything below renders in the browser after sign-in; access to
 * data is enforced by firestore.rules and by requireAdmin() in each server action.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminAuthProvider>
      {/* The admin reads the URL (active nav item, article id) at runtime; nothing here is prerendered content. */}
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </AdminAuthProvider>
  );
}
