import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold">Admin</h1>
      {children}
    </div>
  );
}
