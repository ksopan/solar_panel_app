import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash'),
  user_type: text('user_type', { enum: ['customer', 'vendor', 'admin'] }).notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// Customers table
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  first_name: text('first_name'),
  last_name: text('last_name'),
  address: text('address'),
  phone_number: text('phone_number'),
  is_gmail_registered: integer('is_gmail_registered', { mode: 'boolean' }).notNull().default(false),
  profile_complete: integer('profile_complete', { mode: 'boolean' }).notNull().default(false),
});

// Vendors table
export const vendors = sqliteTable('vendors', {
  id: text('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  company_name: text('company_name'),
  owner_name: text('owner_name'),
  company_address: text('company_address'),
  contact_phone: text('contact_phone'),
  description: text('description'),
  services_offered: text('services_offered'),
  profile_complete: integer('profile_complete', { mode: 'boolean' }).notNull().default(false),
  verification_status: text('verification_status', { enum: ['pending', 'verified', 'rejected'] }).notNull().default('pending'),
});

// Admins table
export const admins = sqliteTable('admins', {
  id: text('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  first_name: text('first_name'),
  last_name: text('last_name'),
  role: text('role'),
});

// Quotation requests table
export const quotationRequests = sqliteTable('quotation_requests', {
  id: text('id').primaryKey(),
  customer_id: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  address: text('address').notNull(),
  num_electronic_devices: integer('num_electronic_devices').notNull(),
  monthly_electricity_bill: real('monthly_electricity_bill').notNull(),
  additional_requirements: text('additional_requirements'),
  status: text('status', { enum: ['open', 'in_progress', 'closed'] }).notNull().default('open'),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// Vendor quotations table
export const vendorQuotations = sqliteTable('vendor_quotations', {
  id: text('id').primaryKey(),
  quotation_request_id: text('quotation_request_id').notNull().references(() => quotationRequests.id, { onDelete: 'cascade' }),
  vendor_id: text('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),
  price: real('price').notNull(),
  installation_timeframe: text('installation_timeframe').notNull(),
  warranty_period: text('warranty_period').notNull(),
  quotation_pdf_url: text('quotation_pdf_url'),
  additional_notes: text('additional_notes'),
  status: text('status', { enum: ['submitted', 'viewed', 'accepted', 'rejected'] }).notNull().default('submitted'),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  notification_type: text('notification_type', { enum: ['new_request', 'new_quotation', 'system'] }).notNull(),
  related_id: text('related_id'),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expires_at: text('expires_at').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// Counters table
export const counters = sqliteTable('counters', {
  name: text('name').primaryKey(),
  value: integer('value').notNull().default(0),
});

// Access logs table
export const accessLogs = sqliteTable('access_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ip: text('ip'),
  path: text('path'),
  accessed_at: text('accessed_at').notNull().default('CURRENT_TIMESTAMP'),
});
