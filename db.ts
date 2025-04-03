import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// This will store our mock users during development
const mockDB = {
  users: new Map(),
  quotationRequests: [],
  vendorQuotations: [],
  sessions: new Map()
};

// Path to the SQLite database file
const DB_PATH = path.join(process.cwd(), 'database', 'solar_panel.db');

export function getDatabase(env?: any) {
  // If env is provided and has DB, use it (Cloudflare production environment)
  if (env?.DB) {
    console.log('Using provided DB connection from environment');
    return drizzle(env.DB);
  }

  // Try to access D1 database from global context in Cloudflare Workers
  if (typeof globalThis !== 'undefined' && 'DB' in globalThis) {
    console.log('Using DB from globalThis context');
    return drizzle((globalThis as any).DB);
  }
  
  // For development mode, use the local SQLite database
  if (process.env.NODE_ENV === 'development') {
    // Check if the SQLite database file exists
    if (fs.existsSync(DB_PATH)) {
      console.log('Using local SQLite database for development');
      const sqlite = new Database(DB_PATH);
      return drizzleSQLite(sqlite);
    } else {
      console.warn('SQLite database file not found at:', DB_PATH);
      console.log('Falling back to mock DB implementation');
    }
  }
  
  // Fallback to mock database implementation
  console.log('Using mock DB implementation');
  
  // Create a robust mock DB implementation
  return {
    prepare: (query: string) => {
      console.log(`[Mock DB] Query: ${query}`);
      
      return {
        bind: (...params: any[]) => {
          console.log(`[Mock DB] Params:`, params);
          
          // Handle user registration
          if (query.includes('INSERT INTO users')) {
            const userId = params[0];
            const email = params[1];
            const passwordHash = params[2];
            const userType = params[3];
            
            // Store user in mock DB
            mockDB.users.set(email, {
              id: userId,
              email,
              password_hash: passwordHash,
              user_type: userType,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
            return {
              run: async () => ({}),
              first: async () => null,
              all: async () => ({ results: [] })
            };
          }

          // Handle user authentication
          if (query.includes('SELECT * FROM users WHERE email')) {
            const email = params[0];
            
            // Check if user exists in mock DB
            if (mockDB.users.has(email)) {
              return {
                first: async () => mockDB.users.get(email),
                run: async () => ({}),
                all: async () => ({ results: [mockDB.users.get(email)] })
              };
            }
            
            // Demo users for testing if not found in mock DB
            if (email === 'customer@example.com' || email === 'vendor@example.com' || email === 'admin@example.com') {
              const userType = email.includes('customer') ? 'customer' : 
                               email.includes('vendor') ? 'vendor' : 'admin';
              return {
                first: async () => ({
                  id: `${userType}-1`,
                  email,
                  password_hash: '$2a$10$GwCzbCKV7uQbR8JUK1ExZOYmZq3OUHgm1vrkiI3rO/kqZaZrqLw/O', // password123
                  user_type: userType,
                  is_active: true
                }),
                run: async () => ({}),
                all: async () => ({ results: [] })
              };
            }
            
            return {
              first: async () => null,
              run: async () => ({}),
              all: async () => ({ results: [] })
            };
          }

          // Handle session storage
          if (query.includes('INSERT INTO sessions')) {
            const sessionId = params[0];
            const userId = params[1];
            const token = params[2];
            
            // Store session in mock DB
            mockDB.sessions.set(token, {
              id: sessionId,
              user_id: userId,
              token,
              expires_at: params[3],
              created_at: new Date().toISOString()
            });
            
            return {
              run: async () => ({}),
              first: async () => null,
              all: async () => ({ results: [] })
            };
          }
          
          
          // Handle session lookup
          if (query.includes('SELECT * FROM sessions WHERE token')) {
            const token = params[0];
            
            // Check if session exists in mock DB
            if (mockDB.sessions.has(token)) {
              return {
                first: async () => mockDB.sessions.get(token),
                run: async () => ({}),
                all: async () => ({ results: [mockDB.sessions.get(token)] })
              };
            }
            
            // Demo session for testing
            if (token && typeof token === 'string') {
              if (token.includes('vendor')) {
                return {
                  first: async () => ({
                    user_id: 'vendor-1'
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              } else if (token.includes('customer')) {
                return {
                  first: async () => ({
                    user_id: 'customer-1'
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              } else if (token.includes('admin')) {
                return {
                  first: async () => ({
                    user_id: 'admin-1'
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              }
            }
            
            return {
              first: async () => null,
              run: async () => ({}),
              all: async () => ({ results: [] })
            };
          }
          
          // Handle user lookup
          if (query.includes('SELECT id, email, user_type, is_active FROM users WHERE id')) {
            const userId = params[0];
            
            // Find user by ID in mock DB
            for (const user of mockDB.users.values()) {
              if (user.id === userId) {
                return {
                  first: async () => ({
                    id: user.id,
                    email: user.email,
                    user_type: user.user_type,
                    is_active: user.is_active
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              }
            }
            
            // Demo users for testing
            if (userId && typeof userId === 'string') {
              if (userId.includes('vendor')) {
                return {
                  first: async () => ({
                    id: userId,
                    email: 'vendor@example.com',
                    user_type: 'vendor',
                    is_active: true
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              } else if (userId.includes('customer')) {
                return {
                  first: async () => ({
                    id: userId,
                    email: 'customer@example.com',
                    user_type: 'customer',
                    is_active: true
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              } else if (userId.includes('admin')) {
                return {
                  first: async () => ({
                    id: userId,
                    email: 'admin@example.com',
                    user_type: 'admin',
                    is_active: true
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              }
            }
            
            return {
              first: async () => null,
              run: async () => ({}),
              all: async () => ({ results: [] })
            };
          }

          
          // Handle quotation requests by customer
          if (query.includes('SELECT * FROM quotation_requests WHERE customer_id')) {
            return {
              first: async () => null,
              run: async () => ({}),
              all: async () => ({
                results: [
                  {
                    id: 'bOIIZ2xUMaJXkN8UcBYb_',
                    customer_id: 'dev-user-id',
                    address: '123 Sopan Manson',
                    num_electronic_devices: 345,
                    monthly_electricity_bill: 54352,
                    additional_requirements: null,
                    status: 'open',
                    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                  },
                  {
                    id: 'bOIIZ2xUMaJXkN8UcBYb_2',
                    customer_id: 'dev-user-id',
                    address: '456 Solar Street',
                    num_electronic_devices: 12,
                    monthly_electricity_bill: 2500,
                    additional_requirements: 'Need installation within 2 weeks',
                    status: 'in_progress',
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                  }
                ]
              })
            };
          }
          
          // Default response for other queries
          return {
            first: async () => null,
            run: async () => ({}),
            all: async () => ({ results: [] })
          };
        }
      };
    }
  };
}
