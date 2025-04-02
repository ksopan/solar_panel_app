# Component Structure for Solar Panel Vendor Selection App

## Shared Components
- **Layout**: Main layout wrapper with navigation and footer
- **Navbar**: Navigation bar with conditional rendering based on user type
- **Footer**: Site footer with links and information
- **AuthForm**: Reusable authentication form for login/registration
- **Button**: Reusable button component with different styles
- **Card**: Reusable card component for displaying information
- **Modal**: Reusable modal component for pop-ups
- **Notification**: Component for displaying notifications
- **LoadingSpinner**: Loading indicator
- **ErrorBoundary**: Error handling component
- **FileUpload**: Component for handling file uploads (PDF)

## Page Components

### Authentication Pages
- **LoginPage**: Login page for all users
- **CustomerRegisterPage**: Registration page for customers
- **VendorRegisterPage**: Registration page for vendors
- **ForgotPasswordPage**: Password recovery page

### Customer Pages
- **CustomerDashboard**: Main dashboard for customers
- **QuotationRequestForm**: Form for customers to request quotations
- **QuotationsList**: List of received quotations
- **QuotationDetail**: Detailed view of a specific quotation
- **QuotationComparison**: Dashboard for comparing multiple quotations
- **CustomerProfile**: Profile management for customers

### Vendor Pages
- **VendorDashboard**: Main dashboard for vendors
- **RequestsList**: List of quotation requests from customers
- **QuotationForm**: Form for vendors to submit quotations
- **VendorQuotations**: List of submitted quotations
- **VendorProfile**: Profile management for vendors

### Admin Pages
- **AdminDashboard**: Main dashboard for admins
- **UserManagement**: Page for managing users
- **QuotationManagement**: Page for overseeing quotations
- **SystemSettings**: Page for system configuration

## API Routes Structure

### Authentication Routes
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/logout`
- `/api/auth/reset-password`

### User Routes
- `/api/users/profile`
- `/api/users/update`
- `/api/users/:id` (admin only)

### Customer Routes
- `/api/customers/quotation-requests`
- `/api/customers/quotation-requests/:id`
- `/api/customers/quotations`

### Vendor Routes
- `/api/vendors/requests`
- `/api/vendors/quotations`
- `/api/vendors/quotations/:id`

### Admin Routes
- `/api/admin/users`
- `/api/admin/quotations`
- `/api/admin/statistics`

### Notification Routes
- `/api/notifications`
- `/api/notifications/mark-read`

## State Management
- Use React Context API for global state management
- Create separate contexts for:
  - Authentication state
  - User profile data
  - Notifications
  - Theme/UI preferences
