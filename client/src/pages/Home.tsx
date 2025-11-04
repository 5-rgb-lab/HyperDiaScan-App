import React, { useState, useEffect } from 'react';
import {
  Camera,
  History,
  Shield,
  User,
  TrendingUp,
  Activity,
  Heart,
  Target,
  Star,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory } from '@/lib/firestore';

export default function Home() {
  const { user, userProfile } = useAuth();
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState({
    scansToday: 0,
    safeScans: 0,
    riskyScans: 0,
    totalScans: 0,
  });
  const [dailyProgress, setDailyProgress] = useState(0);

  // Fetch + listen to Firestore user data
  useEffect(() => {
    if (!user) {
      setRecentScans([]);
      setDailyStats({ scansToday: 0, safeScans: 0, riskyScans: 0, totalScans: 0 });
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (rawRecords: any[] | null) => {
      if (!rawRecords || rawRecords.length === 0) {
        setRecentScans([]);
        setDailyStats({ scansToday: 0, safeScans: 0, riskyScans: 0, totalScans: 0 });
        return;
      }

      // Sort and slice for recent scans
      const sorted = rawRecords
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3);

      const mapped = sorted.map((r) => ({
        name: r.foodName || 'Unknown Food',
        // Normalize stored prediction to a user-friendly display string
        // r.prediction may be a string like 'Safe'|'Risky' or an object { prediction: 'Safe', reasoning }
        result: (() => {
          const raw = typeof r.prediction === 'string' ? r.prediction : r.prediction?.prediction || 'unknown';
          if (!raw) return 'unknown';
          const low = String(raw).toLowerCase();
          if (low === 'safe') return 'Safe for Consumption';
          if (low === 'risky') return 'Not Recommended';
          // fallback: capitalize
          return String(raw);
        })(),
        time: new Date(r.timestamp).toLocaleString(),
      }));

      setRecentScans(mapped);

      // --- Daily Summary Calculations ---
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const scansToday = rawRecords.filter((r) => new Date(r.timestamp) >= startOfDay).length;
      const safeScans = rawRecords.filter((r) => {
        const val = String(r.prediction?.prediction || r.prediction || '').toLowerCase();
        return val === 'safe';
      }).length;
      const riskyScans = rawRecords.filter((r) => {
        const val = String(r.prediction?.prediction || r.prediction || '').toLowerCase();
        return val === 'risky';
      }).length;
      const totalScans = rawRecords.length;

      setDailyStats({ scansToday, safeScans, riskyScans, totalScans });

      // Progress: percentage of scans today vs total
      const progress = totalScans > 0 ? Math.min((scansToday / totalScans) * 100, 100) : 0;
      setDailyProgress(progress);
    });

    return unsubscribe;
  }, [user]);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Safe for Consumption':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Not Recommended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Health tips rotation
  const [currentTip, setCurrentTip] = useState(0);
  
  // Icons and colors for tips
  const tipStyles = [
    { icon: Heart, color: 'from-red-500 to-pink-500', title: '' },
    { icon: Target, color: 'from-blue-500 to-indigo-500', title: '' },
    { icon: Shield, color: 'from-green-500 to-teal-500', title: '' },
    { icon: Star, color: 'from-yellow-500 to-orange-500', title: '' },
    { icon: Activity, color: 'from-purple-500 to-indigo-500', title: '' },
  ];

  // Get tips from user profile or use defaults
  const healthTips = userProfile?.tips?.map((tip, index) => ({
    ...tipStyles[index % tipStyles.length],
    content: tip.content,
  })) || [];

  const quickActions = [
    { icon: Camera, title: 'Scan Food', href: '/scanner', color: 'from-blue-500 to-cyan-500' },
    { icon: History, title: 'View History', href: '/history', color: 'from-purple-500 to-pink-500' },
    { icon: User, title: 'Update Profile', href: '/profile', color: 'from-green-500 to-emerald-500' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [healthTips.length]);

  return (
    <div className="space-y-6">

      <div className="text-center space-y-2 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-profile-title">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">
          Track your health journey with smart food analysis
        </p>
      </div>

      {/* Daily Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Daily Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dailyStats.scansToday}</div>
              <div className="text-sm text-muted-foreground">Scans Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dailyStats.safeScans}</div>
              <div className="text-sm text-muted-foreground">Safe Foods</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{dailyStats.riskyScans}</div>
              <div className="text-sm text-muted-foreground">Risky Foods</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dailyStats.totalScans}</div>
              <div className="text-sm text-muted-foreground">Total Scans</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{action.title}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Health Insights & Tips */}
      {healthTips.length > 0 && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${healthTips[currentTip].color} shadow-lg flex-shrink-0`}
              >
                {React.createElement(healthTips[currentTip].icon, { className: 'w-6 h-6 text-white' })}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">{healthTips[currentTip].title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {healthTips[currentTip].content}
                </p>
              </div>
            </div>
            {healthTips.length > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                {healthTips.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTip ? 'bg-blue-500 w-6' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentTip(index)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentScans.length > 0 && (
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentScans.map((scan, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{scan.name}</p>
                  <p className="text-xs text-muted-foreground">{scan.time}</p>
                  {/* Optional truncated reasoning */}
                  {scan.reasoning && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {scan.reasoning}
                    </p>
                  )}
                </div>

                <Badge
                  variant="secondary"
                  className={`${getResultColor(scan.result)} border-0 ml-4 flex-shrink-0`}
                >
                  {scan.result.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>

          <CardContent className="pt-0">
            <Link href="/history">
              <Button
                variant="outline"
                className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
              >
                See All Scans
                <History className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
