"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Eye, CheckCircle, XCircle, Clock, AlertCircle, Plus } from "lucide-react"

interface Requisition {
  id: string
  title: string
  requester: string
  department: string
  amount: number
  status: "pending" | "approved" | "rejected" | "in-review"
  priority: "low" | "medium" | "high" | "urgent"
  dateSubmitted: string
  description: string
  category: string
}

const mockRequisitions: Requisition[] = [
  {
    id: "REQ-001",
    title: "Office Supplies - Q1",
    requester: "Sarah Johnson",
    department: "Marketing",
    amount: 1250.0,
    status: "pending",
    priority: "medium",
    dateSubmitted: "2024-01-15",
    description:
      "Quarterly office supplies including paper, pens, notebooks, and printer cartridges for the marketing team.",
    category: "Office Supplies",
  },
  {
    id: "REQ-002",
    title: "Software Licenses",
    requester: "Mike Chen",
    department: "IT",
    amount: 5000.0,
    status: "approved",
    priority: "high",
    dateSubmitted: "2024-01-14",
    description: "Annual software licenses for design tools and project management software.",
    category: "Software",
  },
  {
    id: "REQ-003",
    title: "Conference Travel",
    requester: "Emily Davis",
    department: "Sales",
    amount: 3200.0,
    status: "in-review",
    priority: "medium",
    dateSubmitted: "2024-01-13",
    description: "Travel expenses for attending the annual sales conference in Chicago.",
    category: "Travel",
  },
  {
    id: "REQ-004",
    title: "Equipment Upgrade",
    requester: "David Wilson",
    department: "Engineering",
    amount: 8500.0,
    status: "rejected",
    priority: "low",
    dateSubmitted: "2024-01-12",
    description: "Upgrade development workstations with new monitors and hardware.",
    category: "Equipment",
  },
  {
    id: "REQ-005",
    title: "Marketing Campaign",
    requester: "Lisa Brown",
    department: "Marketing",
    amount: 15000.0,
    status: "pending",
    priority: "urgent",
    dateSubmitted: "2024-01-11",
    description: "Budget for Q2 digital marketing campaign including social media ads and content creation.",
    category: "Marketing",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "in-review":
      return <Clock className="h-4 w-4 text-blue-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    case "in-review":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function RequisitionTracker() {
  const [requisitions, setRequisitions] = useState<Requisition[]>(mockRequisitions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null)

  const filteredRequisitions = requisitions.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || req.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || req.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  const statusCounts = {
    pending: requisitions.filter((r) => r.status === "pending").length,
    approved: requisitions.filter((r) => r.status === "approved").length,
    rejected: requisitions.filter((r) => r.status === "rejected").length,
    "in-review": requisitions.filter((r) => r.status === "in-review").length,
  }

  const totalAmount = filteredRequisitions.reduce((sum, req) => sum + req.amount, 0)

  const handleStatusChange = (id: string, newStatus: "approved" | "rejected") => {
    setRequisitions((prev) => prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Requisition Tracker</h1>
            <p className="text-gray-600 mt-1">Manage and track purchase requisitions</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Requisition
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Review</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts["in-review"]}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requisitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requisitions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitions ({filteredRequisitions.length})</CardTitle>
            <CardDescription>Manage and track all purchase requisitions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequisitions.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>{req.requester}</TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>${req.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <Badge variant="outline" className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(req.dateSubmitted).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedRequisition(req)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Requisition Details - {req.id}</DialogTitle>
                              <DialogDescription>Review and manage this requisition</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Title</Label>
                                  <p className="text-sm text-gray-600">{req.title}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Amount</Label>
                                  <p className="text-sm text-gray-600">${req.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Requester</Label>
                                  <p className="text-sm text-gray-600">{req.requester}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Department</Label>
                                  <p className="text-sm text-gray-600">{req.department}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Category</Label>
                                  <p className="text-sm text-gray-600">{req.category}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Date Submitted</Label>
                                  <p className="text-sm text-gray-600">
                                    {new Date(req.dateSubmitted).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Current Status:</Label>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(req.status)}
                                  <Badge variant="outline" className={getStatusColor(req.status)}>
                                    {req.status}
                                  </Badge>
                                </div>
                              </div>
                              {req.status === "pending" && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => handleStatusChange(req.id, "approved")}
                                    className="flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleStatusChange(req.id, "rejected")}
                                    className="flex items-center gap-2"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {req.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(req.id, "approved")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusChange(req.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
