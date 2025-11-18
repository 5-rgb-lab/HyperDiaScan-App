import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function RecentScansCard({ recentScans, getResultColor }: { recentScans: any[]; getResultColor: (r: string) => string; }) {
  if (!recentScans || recentScans.length === 0) return null;

  return (
    <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Activity className="w-5 h-5 text-primary" />Recent Scans</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
        {recentScans.map((scan, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{scan.name}</p>
              <p className="text-xs text-muted-foreground">{scan.time}</p>
            </div>

            <div>
              <span className={`ml-4 ${getResultColor(scan.result)} border-0`}>{scan.result.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </CardContent>
      <CardContent className="pt-0">
        <Link href="/history">
          <Button variant="outline" className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
            See All Scans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
