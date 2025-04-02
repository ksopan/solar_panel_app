import { drizzle } from 'drizzle-orm/d1';

export function getDatabase(env: any) {
  return drizzle(env.DB);
}
