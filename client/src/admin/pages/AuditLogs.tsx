import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuditLogList from '@/admin/components/AuditLogList';
import { Activity, FileText, Clock, Shield } from 'lucide-react';

export default function AuditLogs() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Audit Logs
          </h2>
        </div>
        <p className="text-muted-foreground">Track and monitor all system activities and user actions</p>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <AuditLogList />
        </CardContent>
      </Card>
    </div>
  );
}