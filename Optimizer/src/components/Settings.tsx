import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Bell, Shield, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { mockCompany } from './mockData';

export function Settings() {
  const [monthlyLimit, setMonthlyLimit] = useState(mockCompany.monthly_token_limit.toString());
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Configure quotas, billing, and notification preferences
        </p>
      </div>

      <Tabs defaultValue="quotas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotas">Quotas & Limits</TabsTrigger>
          <TabsTrigger value="billing">Billing & Plans</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="quotas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Quotas</CardTitle>
              <CardDescription>
                Set monthly token limits and usage thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-limit">Monthly Token Limit</Label>
                  <Input
                    id="monthly-limit"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    placeholder="50000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Current usage: {mockCompany.tokens_used.toLocaleString()} tokens
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                  <Input
                    id="alert-threshold"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    placeholder="80"
                  />
                  <p className="text-sm text-muted-foreground">
                    Get notified when usage exceeds this percentage
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4>Per-User Limits</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Developer Daily Limit</Label>
                    <Input placeholder="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Daily Limit</Label>
                    <Input placeholder="2000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Guest Daily Limit</Label>
                    <Input placeholder="100" />
                  </div>
                </div>
              </div>
              <Button>Save Quota Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4>Enterprise Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    50,000 tokens per month • Priority support • Advanced analytics
                  </p>
                </div>
                <Badge variant="outline">Current Plan</Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4>Billing Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billing Email</Label>
                    <Input value="billing@techcorp.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Billing Date</Label>
                    <Input value="February 15, 2024" disabled />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline">Download Invoice</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Pricing</CardTitle>
              <CardDescription>
                Current pricing structure for token usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base tokens (0-10,000)</span>
                  <span>$0.002 per token</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional tokens (10,001-50,000)</span>
                  <span>$0.0015 per token</span>
                </div>
                <div className="flex justify-between">
                  <span>Overage (50,001+)</span>
                  <span>$0.003 per token</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Estimated monthly cost</span>
                  <span>$78.45</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive usage alerts and billing notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alerts to your Slack workspace
                  </p>
                </div>
                <Switch
                  checked={slackNotifications}
                  onCheckedChange={setSlackNotifications}
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Notification Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Usage threshold alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Monthly quota exceeded</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Daily usage summaries</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Billing and payment notifications</Label>
                  </div>
                </div>
              </div>
              <Button>
                <Bell className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>
                Manage API keys and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  API keys provide full access to your token tracking data. Keep them secure.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>Production API Key</h4>
                    <p className="text-sm text-muted-foreground">
                      Last used: 2 hours ago
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Regenerate</Button>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4>Development API Key</h4>
                    <p className="text-sm text-muted-foreground">
                      Last used: 1 day ago
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Regenerate</Button>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                </div>
              </div>
              <Button>
                <SettingsIcon className="w-4 h-4 mr-2" />
                Generate New API Key
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Controls</CardTitle>
              <CardDescription>
                Configure role-based permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Admin users can modify quotas</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Users can view their own usage</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Require 2FA for admin actions</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-suspend users exceeding limits</span>
                  <Switch />
                </div>
              </div>
              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}