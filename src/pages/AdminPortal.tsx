import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shield, UserCheck, RefreshCw, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function AdminPortal() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getAllPendingUsers, approveUser, login } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      loadPendingUsers()
    }
  }, [isAuthenticated])

  const loadPendingUsers = async () => {
    try {
      const users = await getAllPendingUsers()
      setPendingUsers(users)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending users.",
        variant: "destructive",
      })
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const success = await login(credentials.username, credentials.password)
      
      if (success) {
        setIsAuthenticated(true)
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the Super Admin Portal.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message || "Invalid super admin credentials.",
        variant: "destructive",
      })
    }
  }

  const handleApproveUser = async (userId: string) => {
    setIsSubmitting(true)
    
    try {
      const success = await approveUser(userId)
      
      if (success) {
        toast({
          title: "User Approved",
          description: "User has been successfully approved and can now log in.",
        })
        loadPendingUsers() // Refresh the list
      } else {
        toast({
          title: "Approval Failed",
          description: "Unable to approve user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Approval Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Super Admin Portal
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Secure access for user management
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminUsername" className="text-sm font-medium text-gray-700">
                  Admin Username
                </Label>
                <Input
                  id="adminUsername"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({...prev, username: e.target.value}))}
                  placeholder="Enter admin username"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-sm font-medium text-gray-700">
                  Admin Password
                </Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                    placeholder="Enter admin password"
                    className="w-full pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Shield className="mr-2 h-4 w-4" />
                Access Admin Portal
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Login
                </Link>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Demo Credentials:</strong><br/>
                  Username: super_admin<br/>
                  Password: super_admin
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin Portal</h1>
                <p className="text-sm text-gray-600">User Management - Train Plan Wise</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadPendingUsers}
                className="hover:bg-green-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAuthenticated(false)}
                className="hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending User Approvals</span>
              <Badge variant="secondary">{pendingUsers.length} Pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                <p className="text-gray-600">All user registrations have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{user.fullName}</h4>
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Pending Approval
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Username:</span> {user.username}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {user.email}
                          </div>
                          <div>
                            <span className="font-medium">Registered:</span> {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          onClick={() => handleApproveUser(user.id)}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Approve User
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  )
}