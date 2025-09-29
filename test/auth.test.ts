import { 
  signInWithEmail,
  signUpWithEmail,
  signOut,
  createUserProfile,
  updateUserProfile,
  getUserProfile,
} from "../client/src/lib/auth"; // adjust path if needed
import { auth, db } from "../client/src/lib/firebase";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("../client/src/lib/firebase", () => ({
  auth: {},
  db: {},
}));

describe("Auth Helpers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("signs in with email and password", async () => {
    const fakeUser = { uid: "123" };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: fakeUser });

    const user = await signInWithEmail("test@example.com", 1234);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "test@example.com", "password");
    expect(user).toEqual(fakeUser);
  });

  it("signs up with email, password, and name", async () => {
    const fakeUser = { uid: "123", displayName: null };
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: fakeUser });
    (updateProfile as jest.Mock).mockResolvedValueOnce(undefined);
    (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });

    const user = await signUpWithEmail("new@example.com", "pass123", "Test User");

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, "new@example.com", "pass123");
    expect(updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: "Test User" });
    expect(setDoc).toHaveBeenCalled();
    expect(user).toEqual(fakeUser);
  });

  it("signs out the user", async () => {
    (firebaseSignOut as jest.Mock).mockResolvedValueOnce(undefined);

    await signOut();

    expect(firebaseSignOut).toHaveBeenCalledWith(auth);
  });

  it("creates a user profile if not exists", async () => {
    const fakeUser = { uid: "abc", displayName: "Tester", email: "t@e.com" };
    (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
    (doc as jest.Mock).mockReturnValue("userRef");

    await createUserProfile(fakeUser as any);

    expect(setDoc).toHaveBeenCalledWith("userRef", expect.objectContaining({
      name: "Tester",
      email: "t@e.com",
    }));
  });

  it("updates a user profile", async () => {
    (doc as jest.Mock).mockReturnValue("userRef");

    await updateUserProfile("123", { primaryCondition: "hypertension" });

    expect(setDoc).toHaveBeenCalledWith("userRef", expect.objectContaining({
      primaryCondition: "hypertension",
    }), { merge: true });
  });

  it("returns user profile if exists", async () => {
    (doc as jest.Mock).mockReturnValue("userRef");
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ name: "Tester", email: "t@e.com", primaryCondition: "diabetes" }),
    });

    const profile = await getUserProfile("123");

    expect(profile).toEqual({ name: "Tester", email: "t@e.com", primaryCondition: "diabetes" });
  });

  it("returns null if user profile does not exist", async () => {
    (doc as jest.Mock).mockReturnValue("userRef");
    (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });

    const profile = await getUserProfile("456");

    expect(profile).toBeNull();
  });
});
