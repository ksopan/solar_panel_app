import { drizzle } from 'drizzle-orm/d1';

export function getDatabase(env?: any) {
  // If env is provided and has DB, use it
  if (env?.DB) {
    console.log('Using provided DB connection from environment');
    return drizzle(env.DB);
  }

  // Try to access D1 database from global context in Cloudflare Workers
  if (typeof globalThis !== 'undefined' && 'DB' in globalThis) {
    console.log('Using DB from globalThis context');
    return drizzle((globalThis as any).DB);
  }
  
  // For development mode, check if running with wrangler local dev
  if (process.env.NODE_ENV === 'development') {
    try {
      // Try to access wrangler bindings
      const ctx = (global as any).__D1_BINDINGS__;
      if (ctx?.DB) {
        console.log('Using D1 from local wrangler bindings');
        return drizzle(ctx.DB);
      }
    } catch (e) {
      console.log('No wrangler D1 bindings available:', e);
    }

    // Fall back to a proper mock DB implementation
    console.log('Falling back to mock DB implementation');
    
    // Load mock data if available
    let mockUsers: any[] = [];
    let mockCustomers: any[] = [];
    let mockVendors: any[] = [];
    let mockQuotationRequests: any[] = [];
    let mockVendorQuotations: any[] = [];
    let mockNotifications: any[] = [];
    let mockSessions: any[] = [];
    
    try {
      // Try to load real data from local D1 database
      const sqlite3 = require('sqlite3');
      const db = new sqlite3.Database('./.wrangler/state/v3/d1/DB/db.sqlite');
      
      console.log('Attempting to load data from local SQLite database');
      
      // This is just an attempt - it may not work in all environments
      // If it fails, we'll just use empty mock data
    } catch (e) {
      console.log('Failed to load from SQLite, using empty mock data');
    }
    
    // Create a robust mock DB implementation
    return {
      prepare: (query: string) => {
        console.log(`[Mock DB] Query: ${query}`);
        
        return {
          bind: (...params: any[]) => {
            console.log(`[Mock DB] Params:`, params);
            
            // Handle user authentication
            if (query.includes('SELECT * FROM users WHERE email')) {
              const email = params[0];
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
            }
            
            // Handle session lookup
            if (query.includes('SELECT * FROM sessions WHERE token')) {
              const token = params[0];
              if (token && typeof token === 'string') {
                const userType = token.includes('customer') ? 'customer' : 
                                token.includes('vendor') ? 'vendor' : 'admin';
                return {
                  first: async () => ({
                    user_id: `${userType}-1`
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              }
            }
            
            // Handle user lookup
            if (query.includes('SELECT id, email, user_type, is_active FROM users WHERE id')) {
              const userId = params[0];
              if (userId && typeof userId === 'string') {
                const userType = userId.includes('customer') ? 'customer' : 
                                userId.includes('vendor') ? 'vendor' : 'admin';
                return {
                  first: async () => ({
                    id: userId,
                    email: `${userType}@example.com`,
                    user_type: userType,
                    is_active: true
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              }
            }
            
            // Handle quotation requests by customer
            if (query.includes('SELECT * FROM quotation_requests WHERE customer_id')) {
              return {
                first: async () => null,
                run: async () => ({}),
                all: async () => ({
                  results: [
                    {
                      id: 'request-1',
                      customer_id: 'customer-1',
                      address: '123 Main St',
                      num_electronic_devices: 10,
                      monthly_electricity_bill: 150.50,
                      additional_requirements: 'Need installation before summer',
                      status: 'open',
                      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                      id: 'request-2',
                      customer_id: 'customer-1',
                      address: '123 Main St',
                      num_electronic_devices: 8,
                      monthly_electricity_bill: 125.75,
                      additional_requirements: 'Interested in battery storage options',
                      status: 'in_progress',
                      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                    }
                  ]
                })
              };
            }
            
            // Handle quotation request by ID
            if (query.includes('SELECT * FROM quotation_requests WHERE id')) {
              const requestId = params[0];
              if (requestId === 'request-1') {
                return {
                  first: async () => ({
                    id: 'request-1',
                    customer_id: 'customer-1',
                    address: '123 Main St',
                    num_electronic_devices: 10,
                    monthly_electricity_bill: 150.50,
                    additional_requirements: 'Need installation before summer',
                    status: 'open',
                    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              } else if (requestId === 'request-2') {
                return {
                  first: async () => ({
                    id: 'request-2',
                    customer_id: 'customer-1',
                    address: '123 Main St',
                    num_electronic_devices: 8,
                    monthly_electricity_bill: 125.75,
                    additional_requirements: 'Interested in battery storage options',
                    status: 'in_progress',
                    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                  }),
                  run: async () => ({}),
                  all: async () => ({ results: [] })
                };
              }
            }
            
            // Handle vendor quotations for a request
            if (query.includes('vendor_quotations') && query.includes('quotation_request_id')) {
              const requestId = params[0];
              if (requestId === 'request-2') {
                return {
                  first: async () => null,
                  run: async () => ({}),
                  all: async () => ({
                    results: [
                      {
                        id: 'quotation-1',
                        quotation_request_id: 'request-2',
                        vendor_id: 'vendor-1',
                        company_name: 'Solar Solutions Inc',
                        price: 12500.00,
                        installation_timeframe: '3-4 weeks',
                        warranty_period: '10 years',
                        additional_notes: 'Includes premium panels with 22% efficiency',
                        status: 'submitted',
                        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'quotation-2',
                        quotation_request_id: 'request-2',
                        vendor_id: 'vendor-2',
                        company_name: 'EcoSolar Inc',
                        price: 11200.00,
                        installation_timeframe: '2-3 weeks',
                        warranty_period: '8 years',
                        additional_notes: 'Special discount for early installation',
                        status: 'submitted',
                        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                      }
                    ]
                  })
                };
              }
            }
            
            // Handle notifications count
            if (query.includes('COUNT(*) as count FROM notifications')) {
              return {
                first: async () => ({ count: 2 }),
                run: async () => ({}),
                all: async () => ({ results: [{ count: 2 }] })
              };
            }
            
            // Default behavior for unknown queries
            return {
              first: async () => null,
              run: async () => ({}),
              all: async () => ({ results: [] })
            };
          },
          run: async () => ({}),
          first: async () => null,
          all: async () => ({ results: [] })
        };
      }
    };
  }
  
  // If we get here, we couldn't find a database connection
  console.error('Database connection not available - using minimal mock');
  
  // Return a minimal mock DB to prevent crashes
  return {
    prepare: () => ({
      bind: () => ({
        first: async () => null,
        run: async () => ({}),
        all: async () => ({ results: [] }),
      }),
      run: async () => ({}),
      first: async () => null,
      all: async () => ({ results: [] }),
    }),
  };
}

// import { drizzle } from 'drizzle-orm/d1';

// export function getDatabase(env?: any) {
//   // If env is provided and has DB, use it
//   if (env?.DB) {
//     return drizzle(env.DB);
//   }
  
//   // For development mode when running with Next.js dev server
//   if (process.env.NODE_ENV === 'development') {
//     console.log('Running in development mode with mock DB connection');
    
//     // Create a minimal mock DB implementation that allows registration to work
//     return {
//       prepare: (query: string) => {
//         return {
//           bind: (...params: any[]) => {
//             return {
//               first: async () => null, // No existing user found, so registration can proceed
//               run: async () => ({}),   // Successful database operation
//               all: async () => ({ results: [] }),
//             };
//           },
//           run: async () => ({}),
//           first: async () => null,
//           all: async () => ({ results: [] }),
//         };
//       },
//     };
//   }
  
//   console.error('Database connection not available');
//   // Return a mock DB instead of throwing to prevent application crashes
//   return {
//     prepare: () => ({
//       bind: () => ({
//         first: async () => null,
//         run: async () => ({}),
//         all: async () => ({ results: [] }),
//       }),
//       run: async () => ({}),
//       first: async () => null,
//       all: async () => ({ results: [] }),
//     }),
//   };
// }