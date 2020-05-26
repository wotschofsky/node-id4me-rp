import { ApplicationResponse } from 'id4me-rp/lib/types';
import { ApplicationStorageAdapter } from 'id4me-rp';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import FileAsync from 'lowdb/adapters/FileAsync';
import lowdb, { LowdbAsync } from 'lowdb';

// Load .env file
dotenv.config();

const APPLICATIONS_COLLECTION = 'id4me-applications';

interface LowdbContent {
  [APPLICATIONS_COLLECTION]: {
    [key: string]: ApplicationResponse;
  };
}

let lowdbInstance: LowdbAsync<LowdbContent> | null = null;
const getLowdbInstance = async (): Promise<LowdbAsync<LowdbContent>> => {
  if (!lowdbInstance) {
    // Initialize
    const adapter = new FileAsync('database.json');
    const db = await lowdb(adapter);

    // Load defaults
    db.defaults({
      [APPLICATIONS_COLLECTION]: {}
    }).write();

    lowdbInstance = db;

    return db;
  }

  return lowdbInstance;
};

export const lowdbStorageAdapter = new ApplicationStorageAdapter(
  async (identifier, data) => {
    const db = await getLowdbInstance();
    db.set(`${APPLICATIONS_COLLECTION}.${identifier}`, data).write();
  },
  async (identifier) => {
    const db = await getLowdbInstance();
    return db.get(`${APPLICATIONS_COLLECTION}.${identifier}`).value();
  },
  async (identifier) => {
    const db = await getLowdbInstance();
    db.unset(`${APPLICATIONS_COLLECTION}.${identifier}`).write();
    return true;
  }
);

// Setup MongoDB
const mongoUrl = process.env.MONGO_URL;
let mongoClient: MongoClient | null = null;
const getMongoInstance = (): Promise<Db> => {
  if (!mongoUrl) {
    throw new Error(`MONGO_URL wasn't passed as environment variable!`);
  }

  return new Promise((resolve, reject) => {
    if (!mongoClient) {
      MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
          reject(err);
        }

        mongoClient = client;

        const db = client.db('id4me-demo');
        resolve(db);
      });
    } else {
      const db = mongoClient.db('id4me-demo');
      resolve(db);
    }
  });
};

// ❗ When using this in production make sure to add an index to the "identifier" field
export const mongoStorageAdapter = new ApplicationStorageAdapter(
  async (identifier, data) => {
    const db = await getMongoInstance();
    const appsCollection = db.collection(APPLICATIONS_COLLECTION);

    appsCollection.insertOne({
      identifier: identifier,
      data: data
    });
  },
  async (identifier): Promise<ApplicationResponse | null> => {
    const db = await getMongoInstance();
    const appsCollection = db.collection(APPLICATIONS_COLLECTION);

    const doc = await appsCollection.findOne({
      identifier: identifier
    });

    if (doc) {
      return doc.data;
    }

    return null;
  },
  async (identifier) => {
    const db = await getMongoInstance();
    const appsCollection = db.collection(APPLICATIONS_COLLECTION);

    const result = await appsCollection.deleteOne({
      identifier: identifier
    });

    // Return true if MongoDB executed deletion successfully
    return result.result.ok === 1;
  }
);
