import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Search, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { mockUsers, mockCompany } from './mockData';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserUsagePercentage = (userTokens: number) => {
    return (userTokens / mockCompany.monthly_token_limit) * 100;
  };

  const getUserCostEfficiency = (user: any) => {
    return user.projects_completed / user.cost;
  };

  const getProductivityScore = (user: any) => {
    return (user.projects_completed / user.hours_worked) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground">
            Manage users and monitor their token usage
          </p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Add a new user to your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter user's name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter user's email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Developer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddUserOpen(false)}>
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table with Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {filteredUsers.length} of {mockUsers.length} users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tokens Used</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const usagePercentage = getUserUsagePercentage(user.tokens_used);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.tokens_used.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={usagePercentage} className="w-20" />
                            <span className="text-sm text-muted-foreground">
                              {usagePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Reset
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis by User</CardTitle>
              <CardDescription>
                Monthly cost breakdown and highest spenders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tokens Used</TableHead>
                    <TableHead>Monthly Cost</TableHead>
                    <TableHead>Cost per Token</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Cost per Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers
                    .sort((a, b) => b.cost - a.cost)
                    .map((user, index) => {
                      const costPerToken = user.cost / user.tokens_used;
                      const costPerProject = user.cost / user.projects_completed;
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && <Badge variant="destructive">Highest Cost</Badge>}
                              <div>
                                <p>{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.role}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.tokens_used.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {user.cost.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>${costPerToken.toFixed(4)}</TableCell>
                          <TableCell>{user.projects_completed}</TableCell>
                          <TableCell>${costPerProject.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency">
          <Card>
            <CardHeader>
              <CardTitle>User Efficiency Metrics</CardTitle>
              <CardDescription>
                Cost efficiency and productivity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Projects/Hour</TableHead>
                    <TableHead>Cost Efficiency</TableHead>
                    <TableHead>Productivity Score</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers
                    .sort((a, b) => getUserCostEfficiency(b) - getUserCostEfficiency(a))
                    .map((user, index) => {
                      const costEfficiency = getUserCostEfficiency(user);
                      const projectsPerHour = user.projects_completed / user.hours_worked;
                      const productivityScore = getProductivityScore(user);
                      const getRating = (score: number) => {
                        if (score >= 7) return { label: 'Excellent', variant: 'default' as const };
                        if (score >= 5) return { label: 'Good', variant: 'secondary' as const };
                        if (score >= 3) return { label: 'Average', variant: 'outline' as const };
                        return { label: 'Needs Improvement', variant: 'destructive' as const };
                      };
                      const rating = getRating(productivityScore);
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && <Badge variant="default">Most Efficient</Badge>}
                              <div>
                                <p>{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.role}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {user.hours_worked}h
                            </div>
                          </TableCell>
                          <TableCell>{projectsPerHour.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              {costEfficiency.toFixed(2)} projects/$
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={productivityScore} className="w-16" />
                              <span className="text-sm">{productivityScore.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={rating.variant}>{rating.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}