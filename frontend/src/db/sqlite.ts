import initSqlJs, { type Database } from "sql.js";

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = initializeDatabase();
  dbInstance = await initPromise;
  return dbInstance;
}

async function initializeDatabase(): Promise<Database> {
  const SQL = await initSqlJs({
    locateFile: () => "/sql-wasm.wasm",
  });

  // Try to load existing DB from localStorage
  const savedDb = localStorage.getItem("pharma_db");
  let db: Database;

  if (savedDb) {
    const buf = Uint8Array.from(atob(savedDb), (c) => c.charCodeAt(0));
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  return db;
}

export function saveDatabase(db: Database): void {
  try {
    const data = db.export();
    const binary = String.fromCharCode(...data);
    localStorage.setItem("pharma_db", btoa(binary));
  } catch (e) {
    console.error("Failed to save database:", e);
  }
}

export function runMigration(db: Database, sql: string): void {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      db.run(statement);
    } catch (e) {
      console.error("Migration statement failed:", statement, e);
    }
  }

  saveDatabase(db);
}
