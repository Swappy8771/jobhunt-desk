import { MongoClient, type Db } from "mongodb";

// Reuse one client across hot reloads (dev) and warm serverless invocations (Vercel)
const globalForMongo = globalThis as unknown as { _mongo?: Promise<MongoClient> };

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  globalForMongo._mongo ??= new MongoClient(uri, { maxPoolSize: 5 }).connect();
  const client = await globalForMongo._mongo;
  return client.db(process.env.MONGODB_DB || "jobhunt");
}
