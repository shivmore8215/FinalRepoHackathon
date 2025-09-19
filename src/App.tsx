import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import AdminPortal from '@/pages/AdminPortal'
import SuperAdminApproval from '@/pages/SuperAdminApproval'
import NotFound from '@/pages/NotFound'
import './App.css'

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/admin/approvals" element={
              <ProtectedRoute>
                <SuperAdminApproval />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </div>
      </AuthProvider>
    </TooltipProvider>
  )
}

export default App