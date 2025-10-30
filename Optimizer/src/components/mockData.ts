export const mockCompany = {
  id: 1,
  name: "TechCorp Inc.",
  plan_type: "Enterprise",
  monthly_token_limit: 50000,
  tokens_used: 32150
};

export const mockUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@techcorp.com", role: "admin", tokens_used: 8500, cost: 25.50, projects_completed: 12, hours_worked: 160 },
  { id: 2, name: "Bob Smith", email: "bob@techcorp.com", role: "dev", tokens_used: 6200, cost: 18.60, projects_completed: 8, hours_worked: 152 },
  { id: 3, name: "Carol Davis", email: "carol@techcorp.com", role: "dev", tokens_used: 7800, cost: 23.40, projects_completed: 15, hours_worked: 168 },
  { id: 4, name: "David Wilson", email: "david@techcorp.com", role: "dev", tokens_used: 4900, cost: 14.70, projects_completed: 6, hours_worked: 144 },
  { id: 5, name: "Eva Chen", email: "eva@techcorp.com", role: "dev", tokens_used: 4750, cost: 14.25, projects_completed: 10, hours_worked: 156 }
];

export const mockTokenUsage = [
  { date: "2024-01-01", tokens: 1200, department: "Engineering", project: "API Development" },
  { date: "2024-01-02", tokens: 1800, department: "Engineering", project: "Frontend" },
  { date: "2024-01-03", tokens: 950, department: "Engineering", project: "API Development" },
  { date: "2024-01-04", tokens: 2100, department: "Data Science", project: "ML Models" },
  { date: "2024-01-05", tokens: 1650, department: "Engineering", project: "Frontend" },
  { date: "2024-01-06", tokens: 1400, department: "Engineering", project: "Backend" },
  { date: "2024-01-07", tokens: 1900, department: "Data Science", project: "Analytics" },
  { date: "2024-01-08", tokens: 1100, department: "Engineering", project: "API Development" },
  { date: "2024-01-09", tokens: 2200, department: "Engineering", project: "Frontend" },
  { date: "2024-01-10", tokens: 1750, department: "Data Science", project: "ML Models" },
  { date: "2024-01-11", tokens: 1300, department: "Engineering", project: "Backend" },
  { date: "2024-01-12", tokens: 1600, department: "Engineering", project: "API Development" },
  { date: "2024-01-13", tokens: 2000, department: "Data Science", project: "Analytics" },
  { date: "2024-01-14", tokens: 1450, department: "Engineering", project: "Frontend" }
];

export const mockDepartmentUsage = [
  { department: "Engineering", tokens: 18650, percentage: 58 },
  { department: "Data Science", tokens: 10200, percentage: 32 },
  { department: "Product", tokens: 2150, percentage: 7 },
  { department: "Design", tokens: 1150, percentage: 3 }
];

export const mockProjectUsage = [
  { project: "API Development", tokens: 7800 },
  { project: "Frontend", tokens: 6200 },
  { project: "ML Models", tokens: 5900 },
  { project: "Analytics", tokens: 4400 },
  { project: "Backend", tokens: 3700 },
  { project: "Mobile App", tokens: 2150 },
  { project: "Dashboard", tokens: 2000 }
];

export const mockRecentActivity = [
  { user: "Alice Johnson", action: "Generated code completion", tokens: 450, timestamp: "2024-01-14 14:30", cost: 1.35 },
  { user: "Bob Smith", action: "Code review assistance", tokens: 320, timestamp: "2024-01-14 14:15", cost: 0.96 },
  { user: "Carol Davis", action: "Documentation generation", tokens: 280, timestamp: "2024-01-14 13:45", cost: 0.84 },
  { user: "David Wilson", action: "Bug fix suggestion", tokens: 180, timestamp: "2024-01-14 13:20", cost: 0.54 },
  { user: "Eva Chen", action: "Test case generation", tokens: 220, timestamp: "2024-01-14 12:55", cost: 0.66 }
];

export const mockCostEfficiency = [
  { user: "Eva Chen", tokens_per_project: 475, cost_per_project: 1.43, efficiency_score: 95 },
  { user: "Carol Davis", tokens_per_project: 520, cost_per_project: 1.56, efficiency_score: 92 },
  { user: "Bob Smith", tokens_per_project: 775, cost_per_project: 2.33, efficiency_score: 85 },
  { user: "David Wilson", tokens_per_project: 817, cost_per_project: 2.45, efficiency_score: 78 },
  { user: "Alice Johnson", tokens_per_project: 708, cost_per_project: 2.13, efficiency_score: 88 }
];

export const mockMonthlySpending = [
  { month: "Oct", total_cost: 245.80, tokens: 81933 },
  { month: "Nov", total_cost: 198.60, tokens: 66200 },
  { month: "Dec", total_cost: 287.40, tokens: 95800 },
  { month: "Jan", total_cost: 312.75, tokens: 104250 }
];