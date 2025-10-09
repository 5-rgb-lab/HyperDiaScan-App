import { db } from './firebase';
import type { ActivityType, ActivityLog } from '@shared/schema';

export class ActivityLogger {
  private static logsCollection = 'activityLogs';

  static async logActivity(
    userId: string,
    userEmail: string,
    activityType: ActivityType,
    details?: Record<string, any>,
    riskResult?: 'safe' | 'moderate' | 'risky',
    condition?: 'diabetes' | 'hypertension'
  ): Promise<void> {
    try {
      const logsRef = db.collection(this.logsCollection);
      
      await logsRef.add({
        userId,
        userEmail,
        activityType,
        timestamp: new Date().toISOString(),
        details: details || {},
        riskResult: riskResult || null,
        condition: condition || null,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  }

  static async getRecentLogs(limitCount: number = 50): Promise<ActivityLog[]> {
    try {
      const logsRef = db.collection(this.logsCollection);
      const snapshot = await logsRef
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityLog[];
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      return [];
    }
  }

  static async getUserLogs(userId: string, limitCount: number = 100): Promise<ActivityLog[]> {
    try {
      const logsRef = db.collection(this.logsCollection);
      const snapshot = await logsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityLog[];
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return [];
    }
  }

  static async searchLogs(
    searchEmail?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ActivityLog[]> {
    try {
      const logsRef = db.collection(this.logsCollection);
      let query = logsRef.orderBy('createdAt', 'desc');

      if (searchEmail) {
        query = logsRef.where('userEmail', '==', searchEmail).orderBy('createdAt', 'desc') as any;
      }

      const snapshot = await query.get();
      let logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityLog[];

      // Filter by date range if provided
      if (startDate || endDate) {
        logs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          if (startDate && logDate < startDate) return false;
          if (endDate && logDate > endDate) return false;
          return true;
        });
      }

      return logs;
    } catch (error) {
      console.error('Error searching logs:', error);
      return [];
    }
  }

  static async deleteLog(logId: string): Promise<void> {
    try {
      const logRef = db.collection(this.logsCollection).doc(logId);
      await logRef.delete();
    } catch (error) {
      console.error('Error deleting log:', error);
      throw error;
    }
  }

  static async getUserCount(): Promise<number> {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();
      return snapshot.size;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }

  static async getScanCount(): Promise<number> {
    try {
      const scansRef = db.collection('scans');
      const snapshot = await scansRef.get();
      return snapshot.size;
    } catch (error) {
      console.error('Error getting scan count:', error);
      return 0;
    }
  }

  static async getUsersByCondition(): Promise<{ diabetes: number; hypertension: number }> {
    try {
      const usersRef = db.collection('users');
      const allUsers = await usersRef.get();
      
      const diabetesCount = allUsers.docs.filter(
        doc => doc.data().primaryCondition === 'diabetes'
      ).length;
      
      const hypertensionCount = allUsers.docs.filter(
        doc => doc.data().primaryCondition === 'hypertension'
      ).length;

      return { diabetes: diabetesCount, hypertension: hypertensionCount };
    } catch (error) {
      console.error('Error getting users by condition:', error);
      return { diabetes: 0, hypertension: 0 };
    }
  }
}
