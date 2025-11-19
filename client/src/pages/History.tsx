import React, { useState, useEffect } from 'react';
import { ScanHistory, RecordDetailsDialog, HistoryAnalytics, HealthTipsCard } from '@/components/health';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory, deleteScanRecord } from '@/lib/firestore';
import { Calendar, Heart, Target, Shield, Star, Activity, PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { subscribeToUserProfile } from '@/lib/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Updated ScanRecord type
interface ScanRecord {
  id: string;
  date: string; // human-readable (Asia/Manila)
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'risky';
  reasoning?: string;
  foodName?: string;
  nutritionData: Record<string, number>; // dynamic nutrients
  imageUrl?: string;
}

export default function History() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Analytics state (moved from Home)
  const [dailyStats, setDailyStats] = useState({
    scansToday: 0,
    safeScans: 0,
    riskyScans: 0,
    totalScans: 0,
  });

  // Health tips state (moved from Home)
  const [currentTip, setCurrentTip] = useState(0);
  const [healthTips, setHealthTips] = useState<Array<{ icon: any; color: string; title: string; content: string }>>(
    []
  );

  // Icons and colors for tips
  const tipStyles = [
    { icon: Heart, color: 'from-red-500 to-pink-500', title: '' },
    { icon: Target, color: 'from-blue-500 to-indigo-500', title: '' },
    { icon: Shield, color: 'from-green-500 to-teal-500', title: '' },
    { icon: Star, color: 'from-yellow-500 to-orange-500', title: '' },
    { icon: Activity, color: 'from-purple-500 to-indigo-500', title: '' },
  ];

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Unknown date';
    let dateObj: Date | null = null;

    if (ts?.toDate && typeof ts.toDate === 'function') dateObj = ts.toDate();
    else if (typeof ts === 'object' && typeof ts.seconds === 'number')
      dateObj = new Date(ts.seconds * 1000);
    else if (typeof ts === 'string') {
      const parsed = new Date(ts);
      dateObj = isNaN(parsed.getTime()) ? null : parsed;
    } else if (ts instanceof Date) dateObj = ts;
    else if (typeof ts === 'number') dateObj = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);

    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid date';

    return dateObj.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const toNumber = (v: any) => {
    if (v === undefined || v === null) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (rawRecords: any[] | null) => {
      try {
        if (!rawRecords || rawRecords.length === 0) {
          setRecords([]);
          setLoading(false);
          return;
        }

        const mapped: ScanRecord[] = rawRecords.map((r: any) => {
          const id = r.id ?? r.docId ?? r._id ?? '';
          const rawTimestamp = r.timestamp ?? r.createdAt ?? r.date ?? r.time ?? null;

          const nutritionRaw = r.nutritionData ?? r.nutrition ?? r.nutrition_info ?? {};
          const nutritionData: Record<string, number> = {};
          for (const [key, value] of Object.entries(nutritionRaw)) {
            const n = toNumber(value);
            if (n !== 0) nutritionData[key] = n;
          }

          const condition = (r.condition ?? r.disease ?? 'diabetes') as 'diabetes' | 'hypertension';

          const rawPrediction =
            typeof r.prediction === 'object' && r.prediction !== null
              ? r.prediction
              : { prediction: r.prediction ?? 'safe' };

          let prediction: ScanRecord['prediction'] = 'safe';
          const predStr = String(rawPrediction.prediction ?? 'safe').toLowerCase();
          if (predStr === 'risky') prediction = 'risky';

          const reasoning = String(rawPrediction.reasoning ?? r.reasoning ?? '').trim();
          const foodName = r.foodName ?? r.name ?? r.label ?? undefined;
          const date = formatTimestamp(rawTimestamp ?? r.createdAt ?? r.timestamp ?? new Date());

          return {
            id,
            date,
            condition,
            prediction,
            foodName,
            reasoning,
            nutritionData,
            imageUrl: r.imageDataUrl ?? r.imageUrl ?? r.image_url ?? (r.image && (r.image.url || r.image.path)) ?? undefined,
          };
        });

        setRecords(mapped);

        // Calculate daily stats
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const scansToday = rawRecords.filter((r) => {
          const timestamp = r.timestamp ?? r.createdAt ?? r.date ?? r.time ?? null;
          return timestamp && new Date(timestamp) >= startOfDay;
        }).length;

        const safeScans = mapped.filter((r) => r.prediction === 'safe').length;
        const riskyScans = mapped.filter((r) => r.prediction === 'risky').length;
        const totalScans = mapped.length;

        setDailyStats({ scansToday, safeScans, riskyScans, totalScans });
      } catch (err) {
        console.error('Error mapping scan history records:', err);
        setRecords([]);
        setDailyStats({ scansToday: 0, safeScans: 0, riskyScans: 0, totalScans: 0 });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  // Subscribe to user profile for tips
  useEffect(() => {
    if (!user) {
      setHealthTips([]);
      return;
    }

    const unsubscribe = subscribeToUserProfile(user.uid, (profile: { tips?: Array<{ content: string }> } | undefined) => {
      if (profile?.tips) {
        const formattedTips = profile.tips.map((tip: { content: string }, index: number) => ({
          ...tipStyles[index % tipStyles.length],
          content: tip.content,
        }));
        setHealthTips(formattedTips);
        if (currentTip >= formattedTips.length) setCurrentTip(0);
      } else {
        setHealthTips([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (healthTips.length > 0 ? (prev + 1) % healthTips.length : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, [healthTips.length]);

  const handleViewDetails = (record: ScanRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteScanRecord(id);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <>
      <RecordDetailsDialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedRecord(null); }} selectedRecord={selectedRecord} />

      {/* Page content */}
      <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
        <div className="text-center space-y-2 p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border mx-2 sm:mx-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Scan History & Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
            Review your past food scans, health assessments, and nutrition analytics
          </p>
        </div>

        {dailyStats.totalScans > 0 && <HistoryAnalytics dailyStats={dailyStats} records={records} />}

        {healthTips.length > 0 && <HealthTipsCard tips={healthTips} />}

        {loading ? (
          <div className="text-center py-12 sm:py-16 text-gray-500 dark:text-gray-400">
            Loading your scan history...
          </div>
        ) : (
          <ScanHistory
            records={records}
            onViewDetails={handleViewDetails}
            onDeleteRecord={handleDeleteRecord}
          />
        )}
      </div>
    </>
  );
}
