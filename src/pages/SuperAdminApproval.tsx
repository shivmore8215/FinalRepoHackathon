import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Shield, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  ArrowLeft, 
  Clock, 
  Mail, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface PendingUser {
  id: string
  username: string
  email: string
  fullName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function SuperAdminApproval() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const { user, getAllPendingUsers, approveUser, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is super admin
    if (!user || user.role !== 'super_admin') {
      navigate('/login')
      return
    }
    
    loadPendingUsers()
  }, [user, navigate])

  useEffect(() => {
    // Filter users based on search term
    if (!searchTerm) {
      setFilteredUsers(pendingUsers)
    } else {
      const filtered = pendingUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, pendingUsers])

  const loadPendingUsers = async () => {
    setIsLoading(true)
    try {
      const users = await getAllPendingUsers()
      setPendingUsers(users)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending users.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (userId: string, userFullName: string) => {
    setIsSubmitting(true)
    
    try {
      const success = await approveUser(userId)
      
      if (success) {
        toast({
          title: "User Approved",
          description: `${userFullName} has been successfully approved and can now log in.`,
        })
        loadPendingUsers() // Refresh the list
        setIsDialogOpen(false)
        setSelectedUser(null)
      } else {
        toast({
          title: "Approval Failed",
          description: "Unable to approve user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Approval Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectUser = async (userId: string, userFullName: string) => {
    // For now, we'll just show a message. You can implement reject functionality later
    toast({
      title: "Feature Coming Soon",
      description: "User rejection functionality will be implemented in the next update.",
      variant: "default",
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
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

  const openUserDialog = (user: PendingUser) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You need super admin privileges to access this page.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
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
                <h1 className="text-xl font-bold text-gray-900">Super Admin - User Approval</h1>
                <p className="text-sm text-gray-600">Manage user registrations - Train Plan Wise</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.fullName}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadPendingUsers}
                disabled={isLoading}
                className="hover:bg-green-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
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
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">Pending Approvals</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {filteredUsers.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>User Registration Requests</span>
              {searchTerm && (
                <span className="text-sm font-normal text-gray-600">
                  Showing {filteredUsers.length} of {pendingUsers.length} users
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading pending users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                {pendingUsers.length === 0 ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600">No pending user registrations at this time.</p>
                  </>
                ) : (
                  <>
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-600">No users match your search criteria.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{user.fullName}</h4>
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Pending Approval
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-700">Username:</span>
                            <span className="text-gray-600">{user.username}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-600">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-700">Registered:</span>
                            <span className="text-gray-600">{formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex space-x-2">
                        <Button
                          onClick={() => openUserDialog(user)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50"
                        >
                          Review
                        </Button>
                        <Button
                          onClick={() => handleApproveUser(user.id, user.fullName)}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review User Registration</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.fullName}</h3>
                  <Badge variant="outline" className="text-amber-600 border-amber-300 mt-1">
                    Pending Approval
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Username</Label>
                    <p className="text-gray-600">{selectedUser.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                    <p className="text-gray-600">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => handleApproveUser(selectedUser.id, selectedUser.fullName)}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Approving...' : 'Approve User'}
                  </Button>
                  <Button
                    onClick={() => handleRejectUser(selectedUser.id, selectedUser.fullName)}
                    variant="outline"
                    className="flex-1 hover:bg-red-50 hover:border-red-300"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}