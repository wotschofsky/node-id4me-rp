import { ApplicationResponse } from 'id4me-rp/lib/types';
import { ApplicationStorageAdapter } from 'id4me-rp';
import FileAsync from 'lowdb/adapters/FileAsync';
import lowdb, { LowdbAsync } from 'lowdb';

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
