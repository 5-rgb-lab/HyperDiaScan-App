import React, { useState, useEffect } from 'react';
import { Camera, History, Zap, Shield, Clock, User, TrendingUp, Activity, Heart, Target, Star } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Page component for the home page
export default function Home() {
  const [recentScans] = useState([
    { name: 'Greek Yogurt', result: 'safe', time: '2 hours ago' },
    { name: 'Frozen Pizza', result: 'risky', time: 'Yesterday' },
    { name: 'Apple', result: 'safe', time: 'Today' },
  ]);

  const [currentTip, setCurrentTip] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(65);

  const healthTips = [
    {
      icon: Heart,
      title: 'Heart Health Tip',
      content: 'Choose foods low in saturated fats and trans fats. Opt for lean proteins like fish, poultry, and legumes.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Blood Sugar Management',
      content: 'Pair carbohydrates with protein or healthy fats to help stabilize blood sugar levels throughout the day.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Sodium Awareness',
      content: 'Read nutrition labels carefully. Aim for less than 2,300mg of sodium per day to support healthy blood pressure.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Star,
      title: 'Portion Control',
      content: 'Use smaller plates and bowls to naturally reduce portion sizes while still feeling satisfied with your meals.',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const quickActions = [
    { icon: Camera, title: 'Scan Food', href: '/scanner', color: 'from-blue-500 to-cyan-500' },
    { icon: History, title: 'View History', href: '/history', color: 'from-purple-500 to-pink-500' },
    { icon: User, title: 'Update Profile', href: '/profile', color: 'from-green-500 to-emerald-500' },
  ];

  const dailyStats = {
    scansToday: 3,
    safeScans: 2,
    riskyScans: 1,
    weeklyGoal: 10
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'safe': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'risky': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Rotate health tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [healthTips.length]);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4 py-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent" data-testid="text-hero-title">
            Welcome Back!
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your health journey with smart food analysis
          </p>
        </div>
      </div>

      {/* Daily Summary Card */}
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
              <div className="text-2xl font-bold text-purple-600">{dailyStats.weeklyGoal}</div>
              <div className="text-sm text-muted-foreground">Weekly Goal</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Weekly Goal</span>
              <span>{dailyProgress}%</span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
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

      {/* Health Insights & Tips - Rotating */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${healthTips[currentTip].color} shadow-lg flex-shrink-0`}>
              {React.createElement(healthTips[currentTip].icon, { className: "w-6 h-6 text-white" })}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                {healthTips[currentTip].title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {healthTips[currentTip].content}
              </p>
            </div>
          </div>
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
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentScans.length > 0 && (
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                  <div>
                    <p className="font-medium text-foreground" data-testid={`text-recent-scan-${index}`}>
                      {scan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{scan.time}</p>
                  </div>
                  <Badge variant="secondary" className={`${getResultColor(scan.result)} border-0`}>
                    {scan.result.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/history">
              <Button variant="outline" className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300" data-testid="button-see-all-scans">
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