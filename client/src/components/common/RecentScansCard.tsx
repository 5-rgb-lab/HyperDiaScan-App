import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

export default function RecentScansCard({ recentScans, getResultColor }: { recentScans: any[]; getResultColor: (r: string) => string; }) {
  if (!recentScans || recentScans.length === 0) return null;

  const getModernBadgeStyle = (result: string) => {
    if (result === 'Safe for Consumption') {
      return 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md';
    }
    return 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md';
  };

  return (
    <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 via-purple-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
            Recent Scans
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {recentScans.map((scan, index) => (
          <div key={index} className="group relative overflow-hidden p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate mb-1">{scan.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {scan.time}
                </p>
              </div>
              <Badge className={`${getModernBadgeStyle(scan.result)} px-3 py-1 font-medium whitespace-nowrap`}>
                {scan.result === 'Safe for Consumption' ? '✅ Safe' : '⚠️ Risky'}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
      <CardContent className="pt-0 pb-4">
        <Link href="/history">
          <Button className="w-full h-11 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold">
            See All Scans
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
