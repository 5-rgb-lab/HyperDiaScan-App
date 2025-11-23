import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Enhanced audit action types for better categorization
export type AuditCategory = 
  | 'auth'        // Authentication related actions
  | 'profile'     // Profile management
  | 'health'      // Health data and analysis
  | 'scan'        // Food scanning and analysis
  | 'system';     // System-level actions

export type AuditAction = 
  // Auth actions
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.password_reset'
  
  // Profile actions
  | 'profile.create'
  | 'profile.update'
  | 'profile.delete'
  
  // Health actions
  | 'health.tip_generated'
  | 'health.condition_updated'
  
  // Scan actions
  | 'scan.food'        // New: Log all scan actions
  | 'scan.created'
  | 'scan.analyzed'
  | 'scan.saved'
  | 'scan.deleted'
  
  // History actions
  | 'history.saved'    // New: When scan is saved to history
  | 'history.deleted'  // New: When history item is deleted
  | 'history.viewed'
  
  // System actions
  | 'system.error'
  | 'system.warning';

export type AuditSeverity = 'info' | 'warning' | 'error';

export interface AuditLogEntry {
  userId: string;
  category: AuditCategory;
  action: AuditAction;
  description: string;
  timestamp: any; // Firebase Timestamp
  status: 'success' | 'error';
  severity: AuditSeverity;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
    details?: Record<string, any>;
    error?: string;
  };
}

export async function createAuditLog(entry: Omit<AuditLogEntry, 'timestamp' | 'severity'> & { severity?: AuditSeverity }) {
  try {
    const auditLogRef = collection(db, 'auditLogs');
    
    // Set default severity based on status
    const severity = entry.severity || (entry.status === 'error' ? 'error' : 'info');

    // Add browser metadata
    const metadata = {
      ...entry.metadata,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(), // ISO string for easier querying
    };

    await addDoc(auditLogRef, {
      ...entry,
      severity,
      metadata,
      timestamp: serverTimestamp()
    });

    return true;
  } catch (error) {
    // Silently fail if audit logs fail (don't block user actions)
    // This could happen if Firestore rules don't permit audit log writes
    console.warn('Audit log write failed (non-critical):', error);
    return false;
  }
}

/**
 * Helper function to create auth-related audit logs
 */
export function createAuthAuditLog(userId: string, action: Extract<AuditAction, 'user.login' | 'user.logout' | 'user.register' | 'user.password_reset'>, description: string, status: 'success' | 'error' = 'success', metadata?: Record<string, any>) {
  return createAuditLog({
    userId,
    category: 'auth',
    action,
    description,
    status,
    metadata: {
      details: metadata
    }
  });
}

/**
 * Helper function to create scan-related audit logs
 */
export function createScanAuditLog(userId: string, action: Extract<AuditAction, 'scan.food' | 'scan.created' | 'scan.analyzed' | 'scan.saved' | 'scan.deleted'>, description: string, status: 'success' | 'error' = 'success', metadata?: Record<string, any>) {
  return createAuditLog({
    userId,
    category: 'scan',
    action,
    description,
    status,
    metadata: {
      details: metadata
    }
  });
}

/**
 * Helper function to create history-related audit logs
 */
export function createHistoryAuditLog(userId: string, action: Extract<AuditAction, 'history.saved' | 'history.deleted' | 'history.viewed'>, description: string, status: 'success' | 'error' = 'success', metadata?: Record<string, any>) {
  return createAuditLog({
    userId,
    category: 'scan',
    action,
    description,
    status,
    metadata: {
      details: metadata
    }
  });
}

/**
 * Helper function to create profile-related audit logs
 */
export function createProfileAuditLog(userId: string, action: Extract<AuditAction, 'profile.create' | 'profile.update' | 'profile.delete'>, description: string, status: 'success' | 'error' = 'success', metadata?: Record<string, any>) {
  return createAuditLog({
    userId,
    category: 'profile',
    action,
    description,
    status,
    metadata: {
      details: metadata
    }
  });
}