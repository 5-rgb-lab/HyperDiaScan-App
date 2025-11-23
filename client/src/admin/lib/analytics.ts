import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfMonth, startOfWeek, endOfWeek, endOfMonth, subMonths, subWeeks, format } from 'date-fns';

export interface ScanAnalytics {
  totalScans: number;
  diabetesScans: number;
  hypertensionScans: number;
  safeScans: number;
  riskyScans: number;
  weeklyTrend: { label: string; diabetes: number; hypertension: number; }[];
  monthlyTrend: { label: string; diabetes: number; hypertension: number; }[];
  mostActiveUsers: { userId: string; userName: string; scanCount: number; }[];
}

export async function getScanAnalytics(): Promise<ScanAnalytics> {
  try {
    const scansRef = collection(db, 'scanRecords');
    const scansSnapshot = await getDocs(scansRef);
    
    const scans = scansSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      let timestamp: Date;
      
      // Handle Firestore Timestamp objects
      if (data.timestamp?.toDate && typeof data.timestamp.toDate === 'function') {
        timestamp = data.timestamp.toDate();
      } else if (data.timestamp?.seconds) {
        timestamp = new Date(data.timestamp.seconds * 1000);
      } else if (typeof data.timestamp === 'string') {
        timestamp = new Date(data.timestamp);
      } else if (data.timestamp instanceof Date) {
        timestamp = data.timestamp;
      } else {
        timestamp = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        timestamp
      };
    });

    const totalScans = scans.length;
    const diabetesScans = scans.filter(s => s.condition === 'diabetes').length;
    const hypertensionScans = scans.filter(s => s.condition === 'hypertension').length;
    const safeScans = scans.filter(s => s.prediction?.prediction === 'Safe').length;
    const riskyScans = scans.filter(s => s.prediction?.prediction === 'Risky').length;

    // Weekly trend for last 8 weeks
    const weeklyTrend = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i));
      const weekEnd = endOfWeek(subWeeks(new Date(), i));
      
      const weekScans = scans.filter(s => 
        s.timestamp >= weekStart && s.timestamp <= weekEnd
      );
      
      weeklyTrend.push({
        label: format(weekStart, 'MMM dd'),
        diabetes: weekScans.filter(s => s.condition === 'diabetes').length,
        hypertension: weekScans.filter(s => s.condition === 'hypertension').length,
      });
    }

    // Monthly trend for last 6 months
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      const monthScans = scans.filter(s => 
        s.timestamp >= monthStart && s.timestamp <= monthEnd
      );
      
      monthlyTrend.push({
        label: format(monthStart, 'MMM yyyy'),
        diabetes: monthScans.filter(s => s.condition === 'diabetes').length,
        hypertension: monthScans.filter(s => s.condition === 'hypertension').length,
      });
    }

    // Most active users (top 5)
    const userScanCounts = scans.reduce((acc, scan) => {
      acc[scan.userId] = (acc[scan.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const usersMap = new Map(
      usersSnapshot.docs.map(doc => [doc.id, doc.data().name || doc.data().email || 'Unknown'])
    );

    const mostActiveUsers = Object.entries(userScanCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([userId, scanCount]) => ({
        userId,
        userName: usersMap.get(userId) || 'Unknown',
        scanCount: scanCount as number,
      }));

    return {
      totalScans,
      diabetesScans,
      hypertensionScans,
      safeScans,
      riskyScans,
      weeklyTrend,
      monthlyTrend,
      mostActiveUsers,
    };
  } catch (error) {
    console.error('Error fetching scan analytics:', error);
    return {
      totalScans: 0,
      diabetesScans: 0,
      hypertensionScans: 0,
      safeScans: 0,
      riskyScans: 0,
      weeklyTrend: [],
      monthlyTrend: [],
      mostActiveUsers: [],
    };
  }
}
