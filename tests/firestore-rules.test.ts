/**
 * Security tests for firestore.rules, run against the local emulator (never production):
 *
 *   npm run test:rules
 */
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

let env: RulesTestEnvironment;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-cms-rules",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "admins/admin-uid"), { email: "admin@example.com" });
    await setDoc(doc(db, "hero/main"), { name: "I am Nisha Krishnan" });
    await setDoc(doc(db, "statistics/stat-1"), { value: "24", title: "YEARS IN MEDIA", order: 1, active: true });
    await setDoc(doc(db, "cmsDrafts/hero"), { data: { name: "Draft" }, dirty: true });
    await setDoc(doc(db, "insightDrafts/a1"), { article: { title: "Draft article" } });
    await setDoc(doc(db, "mediaLibrary/m1"), { url: "https://res.cloudinary.com/x/image/upload/a.jpg" });
    await setDoc(doc(db, "insights/live"), { title: "Live", slug: "live", published: true });
    await setDoc(doc(db, "insights/hidden"), { title: "Hidden", slug: "hidden", published: false });
  });
});

const visitor = () => env.unauthenticatedContext().firestore();
const user = () => env.authenticatedContext("user-uid", { email: "someone@example.com" }).firestore();
const admin = () => env.authenticatedContext("admin-uid", { email: "admin@example.com" }).firestore();

describe("public visitors", () => {
  test("can read published site content", async () => {
    await assertSucceeds(getDoc(doc(visitor(), "hero/main")));
    await assertSucceeds(getDocs(collection(visitor(), "statistics")));
  });
  test("cannot write site content", async () => {
    await assertFails(setDoc(doc(visitor(), "hero/main"), { name: "Hacked" }));
    await assertFails(deleteDoc(doc(visitor(), "statistics/stat-1")));
  });
  test("cannot read drafts, the media library or admin records", async () => {
    await assertFails(getDoc(doc(visitor(), "cmsDrafts/hero")));
    await assertFails(getDoc(doc(visitor(), "insightDrafts/a1")));
    await assertFails(getDocs(collection(visitor(), "mediaLibrary")));
    await assertFails(getDoc(doc(visitor(), "admins/admin-uid")));
  });
  test("see published articles only", async () => {
    await assertSucceeds(getDoc(doc(visitor(), "insights/live")));
    await assertFails(getDoc(doc(visitor(), "insights/hidden")));
    await assertSucceeds(getDocs(query(collection(visitor(), "insights"), where("published", "==", true))));
    await assertFails(getDocs(collection(visitor(), "insights")));
  });
  test("cannot read unknown collections", async () => {
    await assertFails(getDoc(doc(visitor(), "secrets/x")));
  });
});

describe("signed-in users without the admin role", () => {
  test("cannot write content or drafts", async () => {
    await assertFails(setDoc(doc(user(), "hero/main"), { name: "Hacked" }));
    await assertFails(setDoc(doc(user(), "cmsDrafts/hero"), { data: {} }));
    await assertFails(setDoc(doc(user(), "insights/new"), { published: true }));
    await assertFails(setDoc(doc(user(), "mediaLibrary/m2"), { url: "x" }));
  });
  test("cannot read drafts or unpublished articles", async () => {
    await assertFails(getDoc(doc(user(), "cmsDrafts/hero")));
    await assertFails(getDoc(doc(user(), "insights/hidden")));
  });
  test("cannot grant themselves the admin role", async () => {
    await assertFails(setDoc(doc(user(), "admins/user-uid"), { email: "someone@example.com" }));
  });
  test("can check only their own role", async () => {
    await assertSucceeds(getDoc(doc(user(), "admins/user-uid")));
    await assertFails(getDoc(doc(user(), "admins/admin-uid")));
  });
});

describe("administrators", () => {
  test("can edit drafts and publish content", async () => {
    await assertSucceeds(setDoc(doc(admin(), "cmsDrafts/hero"), { data: { name: "New" }, dirty: true }));
    await assertSucceeds(setDoc(doc(admin(), "hero/main"), { name: "New" }));
    await assertSucceeds(setDoc(doc(admin(), "statistics/_meta"), { publishedAt: "now" }));
    await assertSucceeds(deleteDoc(doc(admin(), "statistics/stat-1")));
  });
  test("can manage articles, including unpublished ones", async () => {
    await assertSucceeds(getDoc(doc(admin(), "insights/hidden")));
    await assertSucceeds(getDocs(collection(admin(), "insights")));
    await assertSucceeds(setDoc(doc(admin(), "insightDrafts/a2"), { article: { title: "x" } }));
    await assertSucceeds(setDoc(doc(admin(), "insights/a2"), { title: "x", published: true }));
  });
  test("can use the media library", async () => {
    await assertSucceeds(getDocs(collection(admin(), "mediaLibrary")));
    await assertSucceeds(setDoc(doc(admin(), "mediaLibrary/m2"), { url: "x" }));
  });
  test("cannot change admin roles or write unknown collections", async () => {
    await assertFails(setDoc(doc(admin(), "admins/user-uid"), { email: "someone@example.com" }));
    await assertFails(deleteDoc(doc(admin(), "admins/admin-uid")));
    await assertFails(setDoc(doc(admin(), "secrets/x"), { a: 1 }));
  });
});
