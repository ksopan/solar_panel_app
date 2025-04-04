import { DrizzleD1Database } from 'drizzle-orm/d1';
import { nanoid } from 'nanoid';
import { hash, compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Types
export type UserType = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  user_type: UserType;
  is_active: boolean;
}

export interface CustomerProfile {
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  is_gmail_registered: boolean;
  profile_complete: boolean;
}

export interface VendorProfile {
  company_name: string;
  owner_name: string;
  company_address: string;
  contact_phone: string;
  description: string;
  services_offered: string;
  profile_complete: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface AdminProfile {
  first_name: string;
  last_name: string;
  role: string;
}

// Authentication functions
export async function registerCustomer(
  db: DrizzleD1Database,
  email: string,
  password: string,
  isGmailRegistered: boolean,
  profile?: Partial<CustomerProfile>
) {
  try {
    // Special handling for development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - simulating customer registration success');
      console.log('Email:', email);
      console.log('Gmail registered:', isGmailRegistered);
      console.log('Profile:', profile);
      
      return { success: true, userId: 'dev-customer-' + Date.now() };
    }
    
    // Create user ID
    const userId = nanoid();
    
    // Hash password if provided (Gmail registration might not have password)
    const passwordHash = password ? await hash(password, 10) : null;
    
    // Begin transaction
    await db.prepare('BEGIN TRANSACTION').run();
    
    try {
      // Insert into users table
      await db.prepare(
        'INSERT INTO users (id, email, password_hash, user_type, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)'
      ).bind(userId, email, passwordHash, 'customer', true).run();
      
      // Insert into customers table
      await db.prepare(
        'INSERT INTO customers (id, first_name, last_name, address, phone_number, is_gmail_registered, profile_complete) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        userId,
        profile?.first_name || null,
        profile?.last_name || null,
        profile?.address || null,
        profile?.phone_number || null,
        isGmailRegistered,
        profile ? true : false
      ).run();
      
      // Commit transaction
      await db.prepare('COMMIT').run();
      
      return { success: true, userId };
    } catch (error) {
      // Rollback on error
      await db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error registering customer:', error);
    return { success: false, message: 'Registration failed' };
  }
}

export async function registerVendor(
  db: DrizzleD1Database,
  email: string,
  password: string,
  isGmailRegistered: boolean,
  profile?: Partial<CustomerProfile>
) {
  try {
    // Special handling for development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - simulating customer registration success');
      console.log('Email:', email);
      console.log('Gmail registered:', isGmailRegistered);
      console.log('Profile:', profile);
      
      return { success: true, userId: 'dev-customer-' + Date.now() };
    }
    
    // Create user ID
    const userId = nanoid();
    
    // Hash password
    const passwordHash = await hash(password, 10);
    
    // Begin transaction
    await db.prepare('BEGIN TRANSACTION').run();
    
    try {
      // Insert into users table
      await db.prepare(
        'INSERT INTO users (id, email, password_hash, user_type, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)'
      ).bind(userId, email, passwordHash, 'vendor', true).run();
      
      // Insert into vendors table
      await db.prepare(
        'INSERT INTO vendors (id, company_name, owner_name, company_address, contact_phone, description, services_offered, profile_complete, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        userId,
        profile?.company_name || null,
        profile?.owner_name || null,
        profile?.company_address || null,
        profile?.contact_phone || null,
        profile?.description || null,
        profile?.services_offered || null,
        profile ? true : false,
        'pending'
      ).run();
      
      // Commit transaction
      await db.prepare('COMMIT').run();
      
      return { success: true, userId };
    } catch (error) {
      // Rollback on error
      await db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error registering vendor:', error);
    return { success: false, message: 'Registration failed' };
  }
}

export async function createAdminUser(
  db: DrizzleD1Database,
  email: string,
  password: string,
  profile: AdminProfile
) {
  try {
    // Check if user already exists
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const existingUser = stmt.get(email);  // `get()` returns first row
    
    
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Create user ID
    const userId = nanoid();
    
    // Hash password
    const passwordHash = await hash(password, 10);
    
    // Begin transaction
    await db.prepare('BEGIN TRANSACTION').run();
    
    try {
      // Insert into users table
      await db.prepare(
        'INSERT INTO users (id, email, password_hash, user_type, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)'
      ).bind(userId, email, passwordHash, 'admin', true).run();
      
      // Insert into admins table
      await db.prepare(
        'INSERT INTO admins (id, first_name, last_name, role) VALUES (?, ?, ?, ?)'
      ).bind(
        userId,
        profile.first_name,
        profile.last_name,
        profile.role
      ).run();
      
      // Commit transaction
      await db.prepare('COMMIT').run();
      
      return { success: true, userId };
    } catch (error) {
      // Rollback on error
      await db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, message: 'Admin creation failed' };
  }
}

export async function login(
  db: DrizzleD1Database,
  email: string,
  password: string
) {
  try {
    console.log(`[LOGIN] Attempt from: ${email} in ${process.env.NODE_ENV}`);

    // Always check the DB — even in development mode
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      console.warn(`[LOGIN] User not found: ${email}`);
      return { success: false, message: 'Invalid email or password' };
    }

    if (!user.is_active) {
      console.warn(`[LOGIN] User is inactive: ${email}`);
      return { success: false, message: 'Account is inactive' };
    }

    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.warn(`[LOGIN] Incorrect password for: ${email}`);
      return { success: false, message: 'Invalid email or password' };
    }

    // Simulate session token in dev mode
    const sessionToken =
      process.env.NODE_ENV === 'development'
        ? `dev-session-${user.user_type}-${Date.now()}`
        : nanoid(64);

    // Only insert session into DB in production
    if (process.env.NODE_ENV !== 'development') {
      const sessionId = nanoid();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db
        .prepare(
          'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
        )
        .bind(sessionId, user.id, sessionToken, expiresAt.toISOString())
        .run();
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        is_active: user.is_active
      },
      sessionToken
    };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Login failed' };
  }
}


export async function logout(db: DrizzleD1Database, sessionToken: string) {
  try {
    // Delete session from database
    await db.prepare(
      'DELETE FROM sessions WHERE token = ?'
    ).bind(sessionToken).run();
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, message: 'Logout failed' };
  }
}

export async function getCurrentUser(db: DrizzleD1Database, sessionToken: string): Promise<User | null> {
  try {
    // Special handling for development mode
    if (process.env.NODE_ENV === 'development' && sessionToken.startsWith('dev-session-')) {
      // In development, simulate a valid user session
      // Extract user type from the session token if available
      let userType: UserType = 'customer';
      if (sessionToken.includes('vendor')) {
        userType = 'vendor';
      } else if (sessionToken.includes('admin')) {
        userType = 'admin';
      }
      
      return {
        id: 'dev-user-id',
        email: 'dev@example.com',
        user_type: userType,
        is_active: true
      };
    }
    
    // Original code for production environment
    // Get session from database
    const session = await db.prepare(
      'SELECT * FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP'
    ).bind(sessionToken).first<{
      user_id: string;
    }>();
    
    if (!session) {
      return null;
    }
    
    // Get user from database
    const user = await db.prepare(
      'SELECT id, email, user_type, is_active FROM users WHERE id = ?'
    ).bind(session.user_id).first<{
      id: string;
      email: string;
      user_type: UserType;
      is_active: boolean;
    }>();
    
    if (!user || !user.is_active) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper functions for server components
// Replace the getSessionToken function in src/lib/auth.ts with this

// Updated implementation:
export function getSessionToken(): string | undefined {
  try {
    const cookieStore = cookies(); // ✅ `cookies()` is synchronous
    const cookie = cookieStore.get('session_token');

    console.log("Cookie found:", cookie?.value ? "Yes" : "No");

    return cookie?.value;
  } catch (error) {
    console.error("Error getting session token:", error);
    return undefined;
  }
}


export async function requireAuth(db: DrizzleD1Database, allowedTypes?: UserType[]): Promise<User> {
  try {
    const sessionToken = getSessionToken(); // ✅ no need to await now

    console.log("Session token in requireAuth:", sessionToken ? "Present" : "Missing");

    if (!sessionToken || typeof sessionToken !== 'string') {
      console.log("No session token, redirecting to login");
      redirect('/login');
    }

    // Handle development mode token
    if (process.env.NODE_ENV === 'development' && sessionToken.startsWith('dev-session-')) {
      console.log("Using development session token");

      let userType: UserType = 'customer';
      if (sessionToken.includes('vendor')) {
        userType = 'vendor';
      } else if (sessionToken.includes('admin')) {
        userType = 'admin';
      }

      const devUser: User = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        user_type: userType,
        is_active: true,
      };

      if (allowedTypes && !allowedTypes.includes(devUser.user_type)) {
        console.log("User type not allowed:", devUser.user_type, "Allowed types:", allowedTypes);
        redirect('/unauthorized');
      }

      return devUser;
    }

    // Get user from DB in production
    const user = await getCurrentUser(db, sessionToken);

    if (!user) {
      console.log("No user found for session token");
      redirect('/login');
    }

    if (allowedTypes && !allowedTypes.includes(user.user_type)) {
      console.log("User type not allowed:", user.user_type, "Allowed types:", allowedTypes);
      redirect('/unauthorized');
    }

    return user;
  } catch (error) {
    console.error("Error in requireAuth:", error);
    redirect('/login');
  }
}



export async function getCustomerProfile(db: DrizzleD1Database, userId: string): Promise<CustomerProfile | null> {
  try {
    const profile = await db.prepare(
      'SELECT * FROM customers WHERE id = ?'
    ).bind(userId).first<CustomerProfile>();
    
    return profile;
  } catch (error) {
    console.error('Error getting customer profile:', error);
    return null;
  }
}

export async function getVendorProfile(db: DrizzleD1Database, userId: string): Promise<VendorProfile | null> {
  try {
    const profile = await db.prepare(
      'SELECT * FROM vendors WHERE id = ?'
    ).bind(userId).first<VendorProfile>();
    
    return profile;
  } catch (error) {
    console.error('Error getting vendor profile:', error);
    return null;
  }
}

export async function getAdminProfile(db: DrizzleD1Database, userId: string): Promise<AdminProfile | null> {
  try {
    const profile = await db.prepare(
      'SELECT * FROM admins WHERE id = ?'
    ).bind(userId).first<AdminProfile>();
    
    return profile;
  } catch (error) {
    console.error('Error getting admin profile:', error);
    return null;
  }
}
