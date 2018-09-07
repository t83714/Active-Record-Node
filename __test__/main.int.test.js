const { prepareTestDB, removeTestDB } = require("./prepareTestDB");
const { CSearcher, CActiveRecord, setDB } = require("../src/index.js");

let db;

beforeAll(async () => {
    db = await prepareTestDB();
});

afterAll(async () => {
    removeTestDB(db);
});

test("Set database connection using setDB function", async () => {
    setDB(db);
    const record = new CActiveRecord("people"); //--- if db not set properly, a exception will be thrown.
    const s = new CSearcher("people"); //--- if db not set properly, a exception will be thrown.
});

test("CActiveRecord: Set value should be able to retrieved", async () => {
    const record = new CActiveRecord("people");
    record["firstName"] = "Jim";
    expect(record["firstName"]).toBe("Jim");
});

test("CActiveRecord: Call commit method should return an auto-generated integer ID: 1", async () => {
    const record = new CActiveRecord("people");
    record["firstName"] = "Jim";
    record["lastName"] = "Will";
    const newId = await record.commit();
    expect(newId).toBe(1);
});

test("CActiveRecord: Set value should be able to retrieved", async () => {
    const s = new CSearcher("people");
    s["id"] = 1;
    expect(s["id"]).toBe(1);
});

test("CSearcher: Should be able to locate the created record by ID:1", async () => {
    const s = new CSearcher("people");
    s["id"] = 1;
    const rows = await s.fetchResult();
    expect(rows).toEqual([
        {
            id: 1,
            firstName: "Jim",
            lastName: "Will"
        }
    ]);
});

test("CActiveRecord: commit method call will save all changes to database", async () => {
    let s = new CSearcher("people");
    s["id"] = 1;
    let rows = await s.fetchResult();

    rows[0]["firstName"] = "Tom";
    rows[0]["lastName"] = "Green";
    await rows[0].commit();

    s = new CSearcher("people");
    s["id"] = 1;
    rows = await s.fetchResult();

    expect(rows).toEqual([
        {
            id: 1,
            firstName: "Tom",
            lastName: "Green"
        }
    ]);
});

test("CActiveRecord: Call delete will remove the record from database", async () => {
    let s = new CSearcher("people");
    s["id"] = 1;
    let rows = await s.fetchResult();

    await rows[0].delete();

    s = new CSearcher("people");
    s["id"] = 1;
    rows = await s.fetchResult();
    expect(rows.length).toBe(0);
});
