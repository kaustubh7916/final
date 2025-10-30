import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react';
import { mockRecentActivity } from './mockData'; // keep mock for activity
import { fetchMetrics } from '../lib/api'; // (new utility)

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics().then(setStats).catch(e => setError(e.message));
  }, []);

  // Fallback values if backend does not provide
  const monthlyTokenLimit = 50000;
  // Prefer backend field if available
  const tokensUsed = (stats && (stats.tokens_used || stats.llm_calls)) ?? 0;
  const usagePercentage = monthlyTokenLimit ? (tokensUsed / monthlyTokenLimit) * 100 : 0;
  const remainingTokens = monthlyTokenLimit - tokensUsed;
  const activeUsers = stats?.active_users || 5; // as per backend if available
  const avgTokensPerUser = activeUsers ? Math.round(tokensUsed / activeUsers) : 0;
  const planType = "Enterprise";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">
          {error ? `Error: ${error}` : "Welcome to token management dashboard"}
        </p>
      </div>
      {/* Alert for high usage */}
      {usagePercentage > 80 && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-destructive">High token usage detected</p>
              <p className="text-sm text-muted-foreground">
                You've used {usagePercentage.toFixed(1)}% of your monthly quota
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tokens Used</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{tokensUsed.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <Progress value={usagePercentage} className="flex-1 mr-2" />
              <span className="text-sm text-muted-foreground">
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Remaining Tokens</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{remainingTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Out of {monthlyTokenLimit.toLocaleString()} monthly limit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {avgTokensPerUser.toLocaleString()} avg tokens per user
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Plan Type</CardTitle>
            <Badge variant="outline">{planType}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{planType}</div>
            <p className="text-xs text-muted-foreground">
              Monthly billing cycle
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest token usage across your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{activity.user}</span>
                    <Badge variant="secondary">{activity.action}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                </div>
                <div className="text-right">
                  <p>{activity.tokens} tokens</p>
                  <p className="text-sm text-muted-foreground">{`$${activity.cost.toFixed(2)}`}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}