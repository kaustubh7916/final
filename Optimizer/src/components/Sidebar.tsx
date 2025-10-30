import { BarChart3, Users, Settings, Home, Zap, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'optimization', label: 'Prompt Optimization', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
      <div className="flex items-center gap-2 mb-8">
        <Zap className="w-8 h-8 text-sidebar-primary" />
        <h1 className="text-sidebar-foreground">TokenTracker</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}