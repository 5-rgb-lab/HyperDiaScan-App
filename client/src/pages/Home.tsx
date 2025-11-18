import React, { useState, useEffect } from 'react';
import { Camera, History, User } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory } from '@/lib/firestore';
import { HomeHero, MedicalDisclaimer, QuickActions, RecentScansCard } from '@/components/common';

export default function Home() {
  const { user, userProfile } = useAuth();
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Fetch + listen to Firestore user data
  useEffect(() => {
    if (!user) {
      setRecentScans([]);
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (rawRecords: any[] | null) => {
      if (!rawRecords || rawRecords.length === 0) {
        setRecentScans([]);
        return;
      }

      // Sort and slice for recent scans
      const sorted = rawRecords
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3);

      const mapped = sorted.map((r) => ({
        name: r.foodName || 'Unknown Food',
        result: (() => {
          const raw = typeof r.prediction === 'string' ? r.prediction : r.prediction?.prediction || 'unknown';
          if (!raw) return 'unknown';
          const low = String(raw).toLowerCase();
          if (low === 'safe') return 'Safe for Consumption';
          if (low === 'risky') return 'Not Recommended';
          return String(raw);
        })(),
        time: new Date(r.timestamp).toLocaleString(),
      }));

      setRecentScans(mapped);
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

  const quickActions = [
    { icon: Camera, title: 'Scan Food', href: '/scanner', color: 'from-blue-500 to-cyan-500' },
    { icon: History, title: 'View History & Analytics', href: '/history', color: 'from-purple-500 to-pink-500' },
    { icon: User, title: 'Update Profile', href: '/profile', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <HomeHero userProfile={userProfile} />

      <MedicalDisclaimer />

      <QuickActions actions={quickActions} />

      <RecentScansCard recentScans={recentScans} getResultColor={getResultColor} />
    </div>
  );
}
