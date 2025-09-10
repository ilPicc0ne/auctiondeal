// Node.js environment declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
    DATABASE_URL?: string;
    CRON_SECRET?: string;
  }
}