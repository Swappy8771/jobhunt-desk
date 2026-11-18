import { NextResponse } from "next/server";
import { ObjectId, type WithId, type Document } from "mongodb";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) => NextResponse.json({ message }, { status });

// Mongo `_id` -> plain `id` string for the browser
export function toPlain<T>(doc: WithId<Document>): T {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest } as T;
}

export function parseId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Wrap a handler so unexpected errors become a clean 500 instead of a crash page
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error(err);
      return fail("Server error. Check the database connection.", 500);
    }
  };
}
