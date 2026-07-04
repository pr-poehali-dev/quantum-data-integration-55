import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import AppLayout from '@/components/AppLayout'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/auth" replace />
  return <AppLayout>{children}</AppLayout>
}
