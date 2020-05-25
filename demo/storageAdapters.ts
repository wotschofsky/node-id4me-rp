import { ApplicationResponse } from 'id4me-rp/lib/types';
import { ApplicationStorageAdapter } from 'id4me-rp';
import FileSync from 'lowdb/adapters/FileSync';
import lowdb, { LowdbSync } from 'lowdb';

const APPLICATIONS_COLLECTION = 'id4me-applications';

interface LowdbContent {
  [APPLICATIONS_COLLECTION]: {
    [key: string]: ApplicationResponse;
  };
}

let lowdbInstance: LowdbSync<LowdbContent> | null = null;
const getLowdbInstance = (): LowdbSync<LowdbContent> => {
  if (!lowdbInstance) {
    // Initialize
    const adapter = new FileSync('database.json');
    const db = lowdb(adapter);

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
    const db = getLowdbInstance();
    db.set(`${APPLICATIONS_COLLECTION}.${identifier}`, data).write();
  },
  async (identifier) => {
    const db = getLowdbInstance();
    return db.get(`${APPLICATIONS_COLLECTION}.${identifier}`).value();
  },
  async (identifier) => {
    const db = getLowdbInstance();
    db.unset(`${APPLICATIONS_COLLECTION}.${identifier}`).write();
    return true;
  }
);
