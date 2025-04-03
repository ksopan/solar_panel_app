import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      user_type,
      // Customer fields
      firstName, 
      lastName, 
      address, 
      phoneNumber,
      // Vendor fields
      companyName,
      ownerName,
      companyAddress,
      contactPhone,
      description,
      servicesOffered
    } = body;

    // Validate required fields
    if (!email || !password || !user_type) {
      return NextResponse.json(
        { message: "Email, password, and user type are required" },
        { status: 400 }
      );
    }

    // Validate user type
    if (!["customer", "vendor"].includes(user_type)) {
      return NextResponse.json(
        { message: "Invalid user type" },
        { status: 400 }
      );
    }

    // Additional validation based on user type
    if (user_type === "customer" && (!firstName || !lastName)) {
      return NextResponse.json(
        { message: "First name and last name are required for customers" },
        { status: 400 }
      );
    }

    if (user_type === "vendor" && (!companyName || !ownerName || !companyAddress || !contactPhone)) {
      return NextResponse.json(
        { message: "Company name, owner name, company address, and contact phone are required for vendors" },
        { status: 400 }
      );
    }

    const db = getDatabase(request.env);

    // Check if user already exists
    const existingUser = await db.prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique ID
    const userId = nanoid();

    // Begin transaction
    try {
      // Insert into users table
      await db.prepare(
        "INSERT INTO users (id, email, password_hash, user_type, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)"
      )
        .bind(userId, email, hashedPassword, user_type)
        .run();

      // Insert into specific user type table
      if (user_type === "customer") {
        await db.prepare(
          "INSERT INTO customers (id, first_name, last_name, address, phone_number, is_gmail_registered, profile_complete) VALUES (?, ?, ?, ?, ?, 0, ?)"
        )
          .bind(
            userId, 
            firstName, 
            lastName, 
            address || null, 
            phoneNumber || null,
            firstName && lastName && address && phoneNumber ? 1 : 0
          )
          .run();
      } else if (user_type === "vendor") {
        await db.prepare(
          "INSERT INTO vendors (id, company_name, owner_name, company_address, contact_phone, description, services_offered, profile_complete, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
        )
          .bind(
            userId,
            companyName,
            ownerName,
            companyAddress,
            contactPhone,
            description || null,
            servicesOffered || null,
            companyName && ownerName && companyAddress && contactPhone ? 1 : 0
          )
          .run();
      }

      return NextResponse.json(
        { 
          message: "User registered successfully",
          user: {
            id: userId,
            email,
            user_type
          }
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        { message: "Error creating user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}