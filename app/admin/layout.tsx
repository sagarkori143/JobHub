import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - JobHub',
  description: 'Administrative dashboard for managing JobHub platform',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
