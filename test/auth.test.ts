import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  createUserProfile,
  updateUserProfile,
  getUserProfile,
  onAuthChange,
} from "../client/src/lib/auth";
import { auth, db } from "../client/src/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { describe, it, expect, vi, beforeEach } from "vitest";

// --------------------
// 🔹 Mock Firebase modules
// --------------------
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock("../client/src/lib/firebase", () => ({
  auth: {},
  db: {},
}));

// --------------------
// Helper: valid mock profile
// --------------------
const validProfile = {
  name: "Tester",
  email: "t@e.com",
  age: 25,
  primaryCondition: "diabetes",
  primaryMedical: { diabetesType: "Type 2", hypertensionType: "None" },
  diabetesStatus: { latestHbA1c: 5.8, hypoglycemiaFrequency: "Rare" },
  hypertensionStatus: { currentBP: { systolic: 120, diastolic: 80 } },
  treatmentManagement: {
    diabetesManagement: { insulinUse: false, insulinType: "Short-acting", insulinTiming: "Before Meals" },
    hypertensionManagement: { antihypertensiveMeds: [], medicationTiming: "Morning" },
  },
  nutrientTargets: { dailyCalorieTarget: 2000, dailyCarbLimit: 200, dailySodiumLimit: 2300, dailySatFatLimit: 20 },
  demographics: { biologicalSex: "Male", heightCm: 170, weightKg: 70, activityLevel: "Sedentary" },
};

// --------------------
// Test Suite
// --------------------
describe("Auth Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1️⃣ SIGN-IN
  it("signs in successfully", async () => {
    const fakeUser = { uid: "123" };
    (signInWithEmailAndPassword as any).mockResolvedValueOnce({ user: fakeUser });
    const user = await signInWithEmail("test@example.com", "password");
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "test@example.com", "password");
    expect(user).toEqual(fakeUser);
  });

  // 2️⃣
  it("throws if sign-in fails", async () => {
    (signInWithEmailAndPassword as any).mockRejectedValueOnce(new Error("Invalid credentials"));
    await expect(signInWithEmail("wrong@test.com", "bad")).rejects.toThrow("Invalid credentials");
  });

  // 3️⃣
  it("throws if email is missing", async () => {
    await expect(signInWithEmail("", "password")).rejects.toThrow();
  });

  // 4️⃣
  it("throws if password is missing", async () => {
    await expect(signInWithEmail("test@example.com", "")).rejects.toThrow();
  });

  // 5️⃣ SIGN-UP
  it("signs up successfully and creates profile", async () => {
    const fakeUser = { uid: "abc", displayName: null };
    (createUserWithEmailAndPassword as any).mockResolvedValueOnce({ user: fakeUser });
    (updateProfile as any).mockResolvedValueOnce(undefined);
    (getDoc as any).mockResolvedValueOnce({ exists: () => false });
    (setDoc as any).mockResolvedValueOnce(undefined);
    const user = await signUpWithEmail("new@example.com", "pass123", "New User");
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, "new@example.com", "pass123");
    expect(updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: "New User" });
    expect(setDoc).toHaveBeenCalled();
    expect(user).toEqual(fakeUser);
  });

  // 6️⃣
  it("throws if sign-up fails", async () => {
    (createUserWithEmailAndPassword as any).mockRejectedValueOnce(new Error("Email in use"));
    await expect(signUpWithEmail("used@example.com", "pass", "User")).rejects.toThrow("Email in use");
  });

  // 7️⃣
  it("handles updateProfile failure gracefully", async () => {
    const fakeUser = { uid: "xyz", displayName: null };
    (createUserWithEmailAndPassword as any).mockResolvedValueOnce({ user: fakeUser });
    (updateProfile as any).mockRejectedValueOnce(new Error("Profile update failed"));
    await expect(signUpWithEmail("x@e.com", "123456", "Fail User")).rejects.toThrow("Profile update failed");
  });

  // 8️⃣ SIGN-OUT
  it("signs out successfully", async () => {
    (firebaseSignOut as any).mockResolvedValueOnce(undefined);
    await signOut();
    expect(firebaseSignOut).toHaveBeenCalledWith(auth);
  });

  // 9️⃣
  it("throws on sign-out failure", async () => {
    (firebaseSignOut as any).mockRejectedValueOnce(new Error("Network error"));
    await expect(signOut()).rejects.toThrow("Network error");
  });

  // 🔟 CREATE PROFILE
  it("creates user profile if not exists", async () => {
    const fakeUser = { uid: "1", displayName: "Tester", email: "t@e.com" };
    (getDoc as any).mockResolvedValueOnce({ exists: () => false });
    (doc as any).mockReturnValue("userRef");
    (setDoc as any).mockResolvedValueOnce(undefined);
    await createUserProfile(fakeUser as any);
    expect(setDoc).toHaveBeenCalledWith(
      "userRef",
      expect.objectContaining({
        name: "Tester",
        email: "t@e.com",
        uid: "1",
      })
    );
  });

  // 11️⃣
  it("skips profile creation if already exists", async () => {
    (getDoc as any).mockResolvedValueOnce({ exists: () => true });
    await createUserProfile({ uid: "exists", displayName: "Skip", email: "s@e.com" } as any);
    expect(setDoc).not.toHaveBeenCalled();
  });

  // 12️⃣ UPDATE PROFILE
  it("updates existing profile successfully", async () => {
    (doc as any).mockReturnValue("userRef");
    (getDoc as any)
      .mockResolvedValueOnce({ exists: () => true, data: () => validProfile })
      .mockResolvedValueOnce({ exists: () => true, data: () => validProfile });
    (setDoc as any).mockResolvedValueOnce(undefined);
    const result = await updateUserProfile("123", { ...validProfile, name: "Updated" } as any);
    expect(setDoc).toHaveBeenCalledWith("userRef", expect.any(Object), { merge: true });
    expect(result).toEqual(validProfile);
  });

  // 13️⃣
  it("creates default profile if user not found", async () => {
    (doc as any).mockReturnValue("userRef");
    (getDoc as any)
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({ exists: () => true, data: () => validProfile });
    (setDoc as any).mockResolvedValueOnce(undefined);
    const result = await updateUserProfile("nope", validProfile as any);
    expect(result).toEqual(validProfile);
  });

  // 14️⃣
  it("throws if updateUserProfile fails", async () => {
    (doc as any).mockReturnValue("userRef");
    (getDoc as any).mockResolvedValueOnce({ exists: () => true, data: () => validProfile }); // ✅ ensure exists()
    (setDoc as any).mockRejectedValueOnce(new Error("Permission denied"));
    await expect(updateUserProfile("err", validProfile as any)).rejects.toThrow("Permission denied");
  });


  // 15️⃣ GET PROFILE
  it("returns user profile if exists", async () => {
    (doc as any).mockReturnValue("userRef");
    (getDoc as any).mockResolvedValueOnce({ exists: () => true, data: () => validProfile });
    const profile = await getUserProfile("123");
    expect(profile).toEqual(validProfile);
  });

  // 16️⃣
  it("returns null if profile does not exist", async () => {
    (doc as any).mockReturnValue("userRef");
    (getDoc as any).mockResolvedValueOnce({ exists: () => false });
    const profile = await getUserProfile("none");
    expect(profile).toBeNull();
  });

  // 17️⃣
  it("throws if getUserProfile encounters error", async () => {
    (doc as any).mockReturnValue("userRef");
    (getDoc as any).mockRejectedValueOnce(new Error("Read failed"));
    await expect(getUserProfile("123")).rejects.toThrow("Read failed");
  });

  // 18️⃣ AUTH CHANGE
  it("registers an auth change listener", () => {
    const callback = vi.fn();
    (onAuthStateChanged as any).mockReturnValueOnce(() => {});
    onAuthChange(callback);
    expect(onAuthStateChanged).toHaveBeenCalledWith(auth, callback);
  });

  // 19️⃣
  it("calls callback on auth state change", () => {
    const callback = vi.fn();
    (onAuthStateChanged as any).mockImplementation((_a: any, cb: any) => cb({ uid: "123" }));
    onAuthChange(callback);
    expect(callback).toHaveBeenCalledWith({ uid: "123" });
  });

  // 20️⃣
  it("handles null user in auth change", () => {
    const callback = vi.fn();
    (onAuthStateChanged as any).mockImplementation((_a: any, cb: any) => cb(null));
    onAuthChange(callback);
    expect(callback).toHaveBeenCalledWith(null);
  });
});
