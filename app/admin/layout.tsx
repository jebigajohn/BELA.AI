import React from 'react'

// Admin layout - just passes children through
// The global Sidebar handles admin navigation
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
