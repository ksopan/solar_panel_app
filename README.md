# Solar Panel Vendor Selection Application

A web application to help customers select the best solar panel installation company for their home or business.

## Overview

This application connects customers looking to install solar panels with vendors who provide solar panel installation services. It features a quotation system where customers can request quotes from multiple vendors and compare them using analytical tools to make informed decisions.

## Features

### For Customers
- Register via manual registration or Gmail
- Submit detailed quotation requests with property and energy information
- View quotations from multiple vendors
- Compare quotations with visual analytics (price, warranty, etc.)
- Receive notifications when vendors submit quotations

### For Vendors
- Register and create a company profile
- View quotation requests from customers
- Submit detailed quotations with pricing and specifications
- Upload PDF documents with detailed proposals
- Track quotation status (submitted, viewed, accepted, rejected)

### For Administrators
- Manage user accounts (customers and vendors)
- Oversee all quotation requests and submissions
- Monitor system performance and activity
- Verify vendor accounts

## Technology Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Custom JWT-based authentication with Gmail integration
- **File Storage**: Mock storage system (would use AWS S3 or similar in production)
- **Visualization**: Recharts for data visualization

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- pnpm package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/solar-panel-app.git
cd solar-panel-app
```

2. Install dependencies
```bash
pnpm install
```

3. Set up the database
```bash
wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

4. Start the development server
```bash
pnpm dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

### Production Deployment

To deploy the application to production:

```bash
pnpm build
```

Then deploy the application using your preferred hosting provider. The application is compatible with Cloudflare Pages, Vercel, or any other Next.js-compatible hosting service.

## User Guide

### Customer Guide

1. **Registration**
   - Sign up using the registration form or Gmail
   - Complete your profile with personal and property information

2. **Requesting Quotations**
   - Navigate to the "Request Quotation" page
   - Fill in details about your property and energy needs
   - Submit the request to notify vendors

3. **Viewing and Comparing Quotations**
   - Check your dashboard for notifications about new quotations
   - View individual quotations with pricing and specifications
   - Use the comparison tool to analyze multiple quotations
   - Download detailed PDF proposals from vendors

### Vendor Guide

1. **Registration**
   - Sign up using the vendor registration form
   - Complete your company profile with business details

2. **Managing Quotation Requests**
   - View open quotation requests from customers
   - Access detailed information about each request

3. **Submitting Quotations**
   - Fill in the quotation form with pricing and specifications
   - Upload a detailed PDF proposal (optional)
   - Submit the quotation to notify the customer

### Administrator Guide

1. **User Management**
   - View and manage customer accounts
   - Verify and manage vendor accounts

2. **Quotation Oversight**
   - Monitor all quotation requests and submissions
   - View detailed information about each request and quotation

3. **System Management**
   - Monitor system performance and activity
   - Manage system settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Next.js team for the excellent framework
- Tailwind CSS for the styling utilities
- Recharts for the visualization components
- Cloudflare for the database and hosting infrastructure
# solar_panel_app
