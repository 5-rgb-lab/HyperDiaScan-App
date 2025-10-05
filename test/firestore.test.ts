import {
  saveScanRecord,
  getUserScanHistory,
  deleteScanRecord,
  getScanRecordsByCondition,
  subscribeToUserScanHistory,
} from "../client/src/lib/firestore"; // adjust path if needed

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";

  jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})), 
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}));

describe("scanRecords Firestore helpers", () => {
  const fakeUserId = "user123";
  const fakeRecordId = "record123";
  const fakeRecord = { condition: "diabetes", food: "Apple" };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("saves a scan record and returns the doc id", async () => {
  const fakeCollectionRef = {}; 
  (collection as jest.Mock).mockReturnValue(fakeCollectionRef);

  (addDoc as jest.Mock).mockResolvedValueOnce({ id: fakeRecordId });

  const id = await saveScanRecord(fakeUserId, fakeRecord as any);

  expect(collection).toHaveBeenCalledWith(expect.anything(), "scanRecords");
  expect(addDoc).toHaveBeenCalledWith(
    fakeCollectionRef, 
    expect.objectContaining({
      userId: fakeUserId,
      condition: "diabetes",
    })
  );
  expect(id).toBe(fakeRecordId);
    });

  it("fetches user scan history", async () => {
    const docs = [
      { id: "1", data: () => ({ condition: "diabetes" }) },
      { id: "2", data: () => ({ condition: "hypertension" }) },
    ];
    (getDocs as jest.Mock).mockResolvedValueOnce({
      forEach: (cb: any) => docs.forEach(cb),
    });

    const result = await getUserScanHistory(fakeUserId);

    expect(query).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("condition");
  });

  it("deletes a scan record", async () => {
    (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await deleteScanRecord(fakeRecordId);

    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      "scanRecords",
      fakeRecordId
    );
    expect(deleteDoc).toHaveBeenCalled();
  });

  it("fetches scan records by condition", async () => {
    const docs = [{ id: "1", data: () => ({ condition: "diabetes" }) }];
    (getDocs as jest.Mock).mockResolvedValueOnce({
      forEach: (cb: any) => docs.forEach(cb),
    });

    const result = await getScanRecordsByCondition(fakeUserId, "diabetes");

    expect(where).toHaveBeenCalledWith("condition", "==", "diabetes");
    expect(result).toHaveLength(1);
    expect(result[0].condition).toBe("diabetes");
  });

  it("subscribes to user scan history", () => {
    const unsubscribe = jest.fn();
    (onSnapshot as jest.Mock).mockImplementation((_q, cb) => {
      cb({
        forEach: (fn: any) =>
          fn({ id: "1", data: () => ({ condition: "diabetes" }) }),
      });
      return unsubscribe;
    });

    const callback = jest.fn();
    const unsub = subscribeToUserScanHistory(fakeUserId, callback);

    expect(onSnapshot).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith([
      { id: "1", condition: "diabetes" },
    ]);
    expect(unsub).toBe(unsubscribe);
  });
});
