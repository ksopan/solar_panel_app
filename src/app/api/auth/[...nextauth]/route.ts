import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/db";
import { users, customers } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Configure NextAuth
export const authOptions = {
  providers: [
    // Google Provider for customer sign-in
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
      // Only allow customers to sign in with Google
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          user_type: "customer",
          is_gmail_registered: true,
        };
      },
    }),
    
    // Credentials Provider for all user types
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        user_type: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = getDatabase();
        
        // Find user by email
        const result = await db.prepare("SELECT * FROM users WHERE email = ?")
          .bind(credentials.email)
          .first();
        
        if (!result) {
          return null;
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          result.password_hash
        );
        
        if (!isPasswordValid) {
          return null;
        }
        
        return {
          id: result.id,
          email: result.email,
          user_type: result.user_type,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For Google sign-in, create or update user in database
        if (account.provider === "google") {
          const db = getDatabase();
          
          // Check if user already exists
          const existingUser = await db.prepare("SELECT * FROM users WHERE email = ?")
            .bind(user.email)
            .first();
          
          if (!existingUser) {
            // Create new user
            const userId = nanoid();
            
            // Insert into users table
            await db.prepare("INSERT INTO users (id, email, password_hash, user_type, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)")
              .bind(userId, user.email, null, "customer")
              .run();
            
            // Insert into customers table
            await db.prepare("INSERT INTO customers (id, first_name, last_name, is_gmail_registered) VALUES (?, ?, ?, 1)")
              .bind(userId, user.name?.split(' ')[0] || '', user.name?.split(' ')[1] || '')
              .run();
            
            token.id = userId;
          } else {
            token.id = existingUser.id;
          }
        } else {
          token.id = user.id;
        }
        
        token.email = user.email;
        token.user_type = user.user_type;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.user_type = token.user_type;
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-for-development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
