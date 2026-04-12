import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Database } from "sql.js";
import { getDatabase, runMigration, saveDatabase } from "./sqlite";
import { MIGRATIONS, SCHEMA_VERSION } from "./migrations";

interface DatabaseContextValue {
  db: Database | null;
  isReady: boolean;
  error: string | null;
  save: () => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
  error: null,
  save: () => {},
});

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const database = await getDatabase();
        if (cancelled) return;

        // Check current schema version
        let currentVersion = 0;
        try {
          const result = database.exec("SELECT value FROM sync_meta WHERE key = 'schema_version'");
          if (result.length > 0 && result[0].values.length > 0) {
            currentVersion = parseInt(result[0].values[0][0] as string, 10);
          }
        } catch {
          // Table doesn't exist yet, version is 0
        }

        // Run pending migrations
        for (let v = currentVersion + 1; v <= SCHEMA_VERSION; v++) {
          if (MIGRATIONS[v]) {
            console.log(`Running migration v${v}...`);
            runMigration(database, MIGRATIONS[v]);
          }
        }

        setDb(database);
        setIsReady(true);
        console.log("📦 SQLite database ready (v" + SCHEMA_VERSION + ")");
      } catch (e) {
        console.error("Failed to initialize database:", e);
        setError(e instanceof Error ? e.message : "Database initialization failed");
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const save = () => {
    if (db) saveDatabase(db);
  };

  return (
    <DatabaseContext.Provider value={{ db, isReady, error, save }}>
      {children}
    </DatabaseContext.Provider>
  );
}
