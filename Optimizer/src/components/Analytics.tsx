import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { mockTokenUsage, mockDepartmentUsage, mockProjectUsage, mockUsers, mockCostEfficiency, mockMonthlySpending } from './mockData';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function Analytics() {
  // Aggregate daily usage
  const dailyUsage = mockTokenUsage.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      existing.tokens += curr.tokens;
    } else {
      acc.push({ date: curr.date, tokens: curr.tokens });
    }
    return acc;
  }, [] as { date: string; tokens: number }[]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-md">
          <p className="text-sm">{formatDate(label)}</p>
          <p className="text-sm text-chart-1">
            Tokens: {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Analytics</h1>
        <p className="text-muted-foreground">
          Track token usage patterns and trends across your organization
        </p>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Daily Usage</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="cost-efficiency">Cost Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Token Usage</CardTitle>
              <CardDescription>
                Token consumption over the last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Usage</CardTitle>
                <CardDescription>
                  Token distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockDepartmentUsage}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="tokens"
                      label={({ department, percentage }) => `${department}: ${percentage}%`}
                    >
                      {mockDepartmentUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value.toLocaleString() + ' tokens', 'Usage']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Breakdown</CardTitle>
                <CardDescription>
                  Detailed usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDepartmentUsage.map((dept, index) => (
                    <div key={dept.department} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{dept.department}</span>
                      </div>
                      <div className="text-right">
                        <p>{dept.tokens.toLocaleString()} tokens</p>
                        <Badge variant="outline">{dept.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Usage</CardTitle>
              <CardDescription>
                Token consumption by project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockProjectUsage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="project" 
                    type="category" 
                    width={120}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString() + ' tokens', 'Usage']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="tokens" 
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-efficiency" className="space-y-4">
          {/* Cost Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Monthly Cost</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">${mockUsers.reduce((sum, user) => sum + user.cost, 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Avg Cost per User</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">${(mockUsers.reduce((sum, user) => sum + user.cost, 0) / mockUsers.length).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Per user this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Most Efficient User</CardTitle>
                <Award className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{mockCostEfficiency[0].user.split(' ')[0]}</div>
                <p className="text-xs text-muted-foreground">
                  {mockCostEfficiency[0].efficiency_score}% efficiency score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Cost per Token</CardTitle>
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">$0.003</div>
                <p className="text-xs text-muted-foreground">
                  Average across all users
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Cost Ranking */}
            <Card>
              <CardHeader>
                <CardTitle>User Cost Analysis</CardTitle>
                <CardDescription>
                  Token usage and cost breakdown by user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers
                      .sort((a, b) => b.cost - a.cost)
                      .map((user) => {
                        const efficiency = mockCostEfficiency.find(e => e.user === user.name);
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p>{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.role}</p>
                              </div>
                            </TableCell>
                            <TableCell>{user.tokens_used.toLocaleString()}</TableCell>
                            <TableCell>${user.cost.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={efficiency?.efficiency_score || 0} className="w-16" />
                                <span className="text-sm">{efficiency?.efficiency_score || 0}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cost Efficiency Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency Ranking</CardTitle>
                <CardDescription>
                  Users ranked by cost per project completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCostEfficiency.map((user, index) => (
                    <div key={user.user} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? 'default' : 'outline'}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p>{user.user}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.tokens_per_project} tokens/project
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>${user.cost_per_project.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">per project</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Spending Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>
                Cost and token usage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={mockMonthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    yAxisId="cost"
                    orientation="left"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis 
                    yAxisId="tokens"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'total_cost' ? `${value.toFixed(2)}` : `${value.toLocaleString()} tokens`,
                      name === 'total_cost' ? 'Cost' : 'Tokens'
                    ]}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    yAxisId="cost"
                    dataKey="total_cost" 
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="tokens"
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}