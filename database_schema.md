# Database Schema for Solar Panel Vendor Selection App

## User Models

### 1. User (Base Model)
- id: UUID (Primary Key)
- email: String (Unique)
- password_hash: String
- user_type: Enum ["customer", "vendor", "admin"]
- created_at: DateTime
- updated_at: DateTime
- is_active: Boolean

### 2. Customer (Extends User)
- first_name: String
- last_name: String
- address: String
- phone_number: String
- is_gmail_registered: Boolean
- profile_complete: Boolean

### 3. Vendor (Extends User)
- company_name: String
- owner_name: String
- company_address: String
- contact_phone: String
- description: Text
- services_offered: Text
- profile_complete: Boolean
- verification_status: Enum ["pending", "verified", "rejected"]

### 4. Admin (Extends User)
- first_name: String
- last_name: String
- role: String

## Quotation Models

### 5. QuotationRequest
- id: UUID (Primary Key)
- customer_id: UUID (Foreign Key -> Customer)
- address: String
- num_electronic_devices: Integer
- monthly_electricity_bill: Decimal
- additional_requirements: Text
- status: Enum ["open", "in_progress", "closed"]
- created_at: DateTime
- updated_at: DateTime

### 6. VendorQuotation
- id: UUID (Primary Key)
- quotation_request_id: UUID (Foreign Key -> QuotationRequest)
- vendor_id: UUID (Foreign Key -> Vendor)
- price: Decimal
- installation_timeframe: String
- warranty_period: String
- quotation_pdf_url: String
- additional_notes: Text
- status: Enum ["submitted", "viewed", "accepted", "rejected"]
- created_at: DateTime
- updated_at: DateTime

## Notification Models

### 7. Notification
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> User)
- title: String
- message: Text
- is_read: Boolean
- notification_type: Enum ["new_request", "new_quotation", "system"]
- related_id: UUID (optional, can reference a quotation or request)
- created_at: DateTime

## Session Models

### 8. Session
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> User)
- token: String
- expires_at: DateTime
- created_at: DateTime
