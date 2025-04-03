# Solar Panel Vendor Selection App

A web application to help customers select the best solar panel installation company for their home or business.

## Features Implemented

- **Local SQLite Database**: Set up for development with proper schema and migrations
- **User Authentication System**: 
  - Regular email/password authentication for all user types
  - Google/Gmail sign-up functionality for customers
  - Session management and protected routes
- **User Registration**:
  - Customer registration with personal details
  - Vendor registration with company information
- **Quotation System**:
  - Customers can submit quotation requests with installation details
  - Vendors can view open requests and submit quotations
  - Customers can view received quotations
- **Dashboard Interfaces**:
  - Customer dashboard to manage quotation requests and view vendor responses
  - Vendor dashboard to view open requests and track submitted quotations

## Technology Stack

- **Frontend**: Next.js 15 with React 18
- **UI Components**: Shadcn UI components
- **Authentication**: NextAuth.js with Google provider
- **Database**: SQLite (local development), Cloudflare D1 (production)
- **ORM**: Drizzle ORM
- **Deployment**: Cloudflare Workers (configured but not deployed)

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- SQLite3

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/ksopan/solar_panel_app.git
   cd solar_panel_app
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or with pnpm:
   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-for-development
   
   # For Google authentication (required for Gmail sign-up)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. Initialize the database:
   ```
   mkdir -p database
   sqlite3 database/solar_panel.db < migrations/0003_full_schema.sql
   ```

5. Start the development server:
   ```
   npm run dev
   ```
   or with pnpm:
   ```
   pnpm dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Cloudflare Deployment

To deploy the application to Cloudflare:

1. Set up a Cloudflare account and create a D1 database

2. Update the `wrangler.toml` file with your database details:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "your-database-name"
   database_id = "your-database-id"
   ```

3. Build and deploy the application:
   ```
   npm run build:worker
   npx wrangler deploy
   ```

## User Guide

### Customer Flow

1. Register as a customer (with email/password or Google sign-in)
2. Navigate to the customer dashboard
3. Click "Request New Quotation" to submit details for a solar panel installation
4. View received quotations from vendors
5. Compare quotations and select the best vendor

### Vendor Flow

1. Register as a vendor (email/password only)
2. Navigate to the vendor dashboard
3. View open quotation requests from customers
4. Submit quotations with pricing and installation details
5. Track the status of submitted quotations

## Implementation Details

### Database Structure

The application uses a relational database with the following main tables:
- `users`: Base table for all user types
- `customers`: Extended information for customer users
- `vendors`: Extended information for vendor users
- `quotation_requests`: Customer requests for solar panel installations
- `vendor_quotations`: Vendor responses to quotation requests
- `notifications`: System notifications for users
- `sessions`: Authentication sessions

### Authentication System

- JWT-based authentication using NextAuth.js
- Google OAuth integration for customer sign-up
- Role-based access control (customer, vendor, admin)

### API Endpoints

- `/api/auth/[...nextauth]`: Authentication endpoints
- `/api/auth/register`: User registration
- `/api/quotations/request`: Submit quotation requests
- `/api/quotations/customer`: Get customer's quotation requests
- `/api/quotations/open`: Get open quotation requests for vendors
- `/api/quotations/vendor`: Get vendor's submitted quotations
- `/api/quotations/submit`: Submit vendor quotations

## Future Enhancements

- File upload functionality for quotation PDFs
- Email notifications for new quotations and requests
- Advanced dashboard analytics for comparing quotations
- Admin interface for managing users and quotations
- Mobile-responsive design improvements

## Troubleshooting

- If you encounter database connection issues, ensure the SQLite database file exists at `database/solar_panel.db`
- For authentication issues, verify your environment variables are correctly set
- For Google sign-in problems, make sure your Google OAuth credentials are properly configured

## License

This project is licensed under the MIT License - see the LICENSE file for details.
