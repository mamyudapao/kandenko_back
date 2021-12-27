import { MongoClient, Db } from "mongodb";

type DBInfo = {
  url: string;
  dbName: string;
};

export const connectDB = async (
  client: MongoClient,
  dbName: string
): Promise<Db> => {
  await client.connect();
  const db = client.db(dbName);
  return db;
};
