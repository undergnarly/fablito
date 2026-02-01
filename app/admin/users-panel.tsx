"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Coins,
  Mail,
  User as UserIcon,
  Shield,
  UserX,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Eye
} from "lucide-react"

interface User {
  id: string
  name: string
  email?: string
  coins: number
  isAnonymous: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type FilterType = "all" | "registered" | "anonymous"

const USERS_PER_PAGE = 20

export default function UsersPanel() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<FilterType>("all")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    coins: 500,
  })

  // Calculate stats
  const stats = useMemo(() => {
    const registered = users.filter(u => !u.isAnonymous).length
    const anonymous = users.filter(u => u.isAnonymous).length
    return { registered, anonymous, total: users.length }
  }, [users])

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    let result = users
    if (filter === "registered") {
      result = users.filter(u => !u.isAnonymous)
    } else if (filter === "anonymous") {
      result = users.filter(u => u.isAnonymous)
    }
    return result
  }, [users, filter])

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE
    return filteredUsers.slice(start, start + USERS_PER_PAGE)
  }, [filteredUsers, currentPage])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  // Helper for fetch with retry on network errors
  const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options)
        return response
      } catch (error) {
        console.log(`Fetch attempt ${i + 1} failed, retrying...`)
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    throw new Error("Failed to fetch after retries")
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetchWithRetry("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create user")
      }

      toast({
        title: "Success",
        description: "User created successfully",
      })
      setCreateDialogOpen(false)
      setFormData({ name: "", email: "", password: "", coins: 500 })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          name: formData.name,
          email: formData.email || undefined,
          coins: formData.coins,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user")
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      })
      setEditDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete user")

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleResetCoins = async (user: User) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          coins: 500,
        }),
      })

      if (!response.ok) throw new Error("Failed to reset coins")

      toast({
        title: "Success",
        description: `Coins reset to 500 for ${user.name}`,
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset coins",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email || "",
      password: "",
      coins: user.coins,
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.registered}</p>
                <p className="text-xs text-muted-foreground">Registered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Eye className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.anonymous}</p>
                <p className="text-xs text-muted-foreground">Unique Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users ({stats.total})</SelectItem>
              <SelectItem value="registered">Registered ({stats.registered})</SelectItem>
              <SelectItem value="anonymous">Anonymous ({stats.anonymous})</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} users
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => {
            setFormData({ name: "", email: "", password: "", coins: 500 })
            setCreateDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {filter !== "all" ? "Try changing the filter." : "Create your first user to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {paginatedUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.isAnonymous ? "bg-gray-100" : "bg-primary/10"
                    }`}>
                      {user.isAnonymous ? (
                        <UserX className="h-5 w-5 text-gray-500" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {user.isAnonymous && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Anonymous
                          </span>
                        )}
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Created: {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-700">{user.coins}</span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetCoins(user)}
                        title="Reset coins to 500"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredUsers.length} users)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coins">Initial Coins</Label>
              <Input
                id="coins"
                type="number"
                value={formData.coins}
                onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={!formData.name}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave empty to keep current"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-coins">Coins</Label>
              <Input
                id="edit-coins"
                type="number"
                value={formData.coins}
                onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
