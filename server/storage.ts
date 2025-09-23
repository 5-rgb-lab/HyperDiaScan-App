import { type UserProfile, type InsertUserProfile, type ScanRecord } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getScanRecords(userId: string): Promise<ScanRecord[]>;
  saveScanRecord(record: ScanRecord): Promise<ScanRecord>;
}

export class MemStorage implements IStorage {
  private userProfiles: Map<string, UserProfile>;
  private scanRecords: Map<string, ScanRecord[]>;

  constructor() {
    this.userProfiles = new Map();
    this.scanRecords = new Map();
  }

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const profile: UserProfile = { ...insertProfile };
    this.userProfiles.set(insertProfile.email, profile);
    return profile;
  }

  async getScanRecords(userId: string): Promise<ScanRecord[]> {
    return this.scanRecords.get(userId) || [];
  }

  async saveScanRecord(record: ScanRecord): Promise<ScanRecord> {
    const userRecords = this.scanRecords.get(record.userId) || [];
    userRecords.push(record);
    this.scanRecords.set(record.userId, userRecords);
    return record;
  }
}

export const storage = new MemStorage();
