import React from "react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Skyline Cheats",
  description: "Skyline Cheats Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
