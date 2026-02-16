import React from "react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Ring-0",
  description: "Ring-0 Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
