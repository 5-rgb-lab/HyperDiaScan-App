import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminUsers } from '@/admin/hooks/useAdminUsers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MoreVertical, 
  Search, 
  UserCog,
  Ban,
  CheckCircle,
  AlertCircle,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserDetailsModal, UserDetails } from '@/admin/components/UserDetailsModal';
import { format, subDays, isAfter, isBefore } from 'date-fns';

type SortField = 'name' | 'email' | 'lastActive' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function Users() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { users, isLoading, toggleUserStatus } = useAdminUsers();

  const parseDateValue = (val: any): Date | null => {
    if (!val) return null;
    if (val?.toDate && typeof val.toDate === 'function') return val.toDate();
    if (val?.seconds) return new Date(val.seconds * 1000);
    if (typeof val === 'string') return new Date(val);
    if (val instanceof Date) return val;
    return null;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user as UserDetails);
    setModalOpen(true);
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter((user) => {
      const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.active) ||
        (statusFilter === 'inactive' && !user.active);

      let matchesDate = true;
      if (dateFilter !== 'all' && (user as any).createdAt) {
        const createdAtRaw = (user as any).createdAt;
        let userDate: Date;
        
        // Handle Firestore Timestamp objects
        if (createdAtRaw?.toDate && typeof createdAtRaw.toDate === 'function') {
          userDate = createdAtRaw.toDate();
        } else if (createdAtRaw?.seconds) {
          userDate = new Date(createdAtRaw.seconds * 1000);
        } else if (typeof createdAtRaw === 'string') {
          userDate = new Date(createdAtRaw);
        } else if (createdAtRaw instanceof Date) {
          userDate = createdAtRaw;
        } else {
          return true; // Skip filtering if can't parse date
        }
        
        const now = new Date();
        
        switch (dateFilter) {
          case '7days':
            matchesDate = isAfter(userDate, subDays(now, 7));
            break;
          case '30days':
            matchesDate = isAfter(userDate, subDays(now, 30));
            break;
          case '90days':
            matchesDate = isAfter(userDate, subDays(now, 90));
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });

    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'createdAt') {
        const parseTimestamp = (val: any) => {
          if (!val) return 0;
          if (val?.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
          if (val?.seconds) return val.seconds * 1000;
          if (typeof val === 'string') return new Date(val).getTime();
          if (val instanceof Date) return val.getTime();
          return 0;
        };
        aValue = parseTimestamp((a as any)[sortField]);
        bValue = parseTimestamp((b as any)[sortField]);
      } else if (sortField === 'lastActive') {
        const parseTimestamp = (val: any) => {
          if (!val) return 0;
          if (val?.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
          if (val?.seconds) return val.seconds * 1000;
          if (typeof val === 'string') return new Date(val).getTime();
          if (val instanceof Date) return val.getTime();
          return 0;
        };
        aValue = parseTimestamp(a[sortField]);
        bValue = parseTimestamp(b[sortField]);
      } else {
        aValue = a[sortField]?.toString().toLowerCase() || '';
        bValue = b[sortField]?.toString().toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [users, search, statusFilter, dateFilter, sortField, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, endIndex);
  }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const activeUsers = users.filter(u => u.active).length;
  const inactiveUsers = users.filter(u => !u.active).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Users
          </h2>
          <p className="text-muted-foreground mt-1">Manage and monitor all registered users</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Users
            </CardTitle>
            <UsersIcon className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {users.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Active Users
            </CardTitle>
            <UserCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {activeUsers}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Inactive Users
            </CardTitle>
            <UserX className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {inactiveUsers}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Deactivated accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              User List
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Joined Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                  <TableHead className="font-semibold">
                    <button onClick={() => handleSort('name')} className="flex items-center hover:text-blue-600">
                      Name <SortIcon field="name" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button onClick={() => handleSort('email')} className="flex items-center hover:text-blue-600">
                      Email <SortIcon field="email" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Primary Condition</TableHead>
                  <TableHead className="font-semibold">
                    <button onClick={() => handleSort('createdAt')} className="flex items-center hover:text-blue-600">
                      Registered <SortIcon field="createdAt" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button onClick={() => handleSort('lastActive')} className="flex items-center hover:text-blue-600">
                      Last Active <SortIcon field="lastActive" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.active ? "default" : "secondary"}
                          className={user.active ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {user.active ? 
                            <CheckCircle className="w-3 h-3 mr-1" /> : 
                            <AlertCircle className="w-3 h-3 mr-1" />
                          }
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {user.primaryCondition || 'Not Set'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {(() => {
                          const d = parseDateValue((user as any).createdAt);
                          return d ? format(d, 'MMM d, yyyy') : '—';
                        })()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {(() => {
                          const la = parseDateValue((user as any).lastActive);
                          return la ? format(la, 'MMM d, yyyy h:mm a') : 'Never';
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewDetails(user)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleStatusToggle(user.id, user.active)}
                            >
                              {user.active ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4 text-red-600" />
                                  <span className="text-red-600">Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  <span className="text-green-600">Activate</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredAndSortedUsers.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <UserDetailsModal 
        user={selectedUser}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}