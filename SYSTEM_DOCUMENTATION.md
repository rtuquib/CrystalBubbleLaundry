# CrystalBubble Laundry Management System

## Overview

The CrystalBubble Laundry Management System is a comprehensive web-based application designed to manage all aspects of a laundry business, including customer management, order processing, payment handling, inventory tracking, and business analytics.

## System Architecture

### Backend (Laravel)
- **Framework**: Laravel 13.0 with PHP 8.3
- **Database**: Structured relational database with normalized schema
- **Authentication**: Laravel Sanctum with role-based access control
- **Frontend Integration**: Inertia.js for seamless SPA experience

### Frontend (Vue.js)
- **Framework**: Vue.js 3 with Composition API
- **Styling**: TailwindCSS 4.2.2
- **Routing**: Vue Router 5.0.4
- **Build Tool**: Vite 8.0.1

## Core Modules

### 1. Customer Management Module

**Features:**
- Customer registration with unique customer codes (CB-CUST-XXXXX)
- Complete profile management (contact info, preferences, service history)
- Advanced search functionality (name, code, email, phone)
- Customer status management (active/inactive)
- Service preferences tracking (scent, detergent)

**Database Schema:**
```sql
customers table:
- id, customer_code, full_name, contact_number
- address, email, gender, preferred_scent
- preferred_detergent, notes, status
- timestamps
```

**Key Controllers:**
- `CustomerController` - Full CRUD operations
- Search and filtering capabilities
- Order history integration

### 2. Order Processing Module

**Features:**
- Complete order creation workflow
- Multi-item support with individual service selection
- Service types: Wash, Dry, Fold, Iron
- Dynamic pricing calculation (base per kg + service fees)
- Order status tracking through all stages
- Pickup scheduling integration

**Order Status Workflow:**
1. Received
2. Processing
3. Washing
4. Drying
5. Folding
6. Quality Check
7. Ready for Pickup
8. Completed

**Database Schema:**
```sql
laundry_orders table:
- id, customer_id, order_code, service_type
- preferred_scent, preferred_detergent, amount
- pickup_schedule, status, received_at, completed_at
- created_by, updated_by, notes, timestamps

order_items table:
- id, laundry_order_id, item_description
- quantity, weight, wash, dry, fold, iron
- line_amount, timestamps

order_status_histories table:
- id, laundry_order_id, status, user_id
- note, created_at
```

**Key Controllers:**
- `LaundryOrderController` - Order lifecycle management
- `OrderPricingService` - Dynamic pricing calculations
- `OrderStatusService` - Status transitions with inventory integration

### 3. Payment Processing Module

**Features:**
- Transaction recording with official receipts
- Multiple payment methods (Cash, Digital)
- Automatic receipt numbering (RCP-YYYYMMDD-XXXX)
- Payment status tracking (pending, partial, paid)
- Change amount calculation
- Payment history and analytics

**Database Schema:**
```sql
payments table:
- id, laundry_order_id, customer_id, receipt_number
- payment_method, payment_status, amount_paid
- change_amount, reference_number, paid_at
- recorded_by, timestamps
```

**Key Controllers:**
- `PaymentController` - Payment processing and receipt generation
- Integration with order balance calculations
- Payment method filtering and reporting

### 4. Inventory Management Module

**Features:**
- Real-time inventory tracking
- Category management (detergent, softener, packaging, other)
- Low-stock alerts with reorder levels
- Stock movement tracking (stock in/out)
- Usage analytics and reporting

**Database Schema:**
```sql
inventory_items table:
- id, item_name, category, unit
- quantity, reorder_level, status, timestamps

inventory_movements table:
- id, inventory_item_id, type, quantity
- notes, user_id, timestamps
```

**Key Controllers:**
- `InventoryItemController` - Item management and stock movements
- `InventoryStockService` - Stock calculations and order deduction
- Low-stock alerting system

### 5. Admin System & Reports

**Features:**
- Comprehensive dashboard with business metrics
- Daily sales summaries
- Monthly revenue statistics
- Customer analytics and spending patterns
- Order volume reports by status
- Service popularity insights
- Payment method analysis
- Inventory usage reports

**Report Types:**
- Daily Sales Reports
- Monthly Revenue Analytics
- Customer Spending Analysis
- Order Volume by Status
- Service Popularity Statistics
- Payment Method Breakdown
- Inventory Usage Tracking

**Key Controllers:**
- `ReportController` - Comprehensive reporting system
- `AdminDashboardController` - Business overview
- `ActivityLogController` - System activity tracking

### 6. Order Status Management System

**Features:**
- Real-time order status updates
- Complete workflow stage tracking
- Status change history with user attribution
- Automated inventory deduction on completion
- Status transition validation

**Status Workflow:**
- Each status transition is logged with timestamp and user
- Inventory automatically deducted when order marked "Completed"
- Full audit trail for order lifecycle

## User Roles & Permissions

### Admin Role
- Full system access
- Staff management
- Customer management
- Complete order management
- Inventory oversight
- Comprehensive reporting
- System configuration

### Staff Role
- Customer management
- Order processing
- Payment recording
- Inventory operations
- Basic reporting
- Order status management

### Customer Role
- Profile management
- Order placement
- Order tracking
- Payment history
- Service preferences

## Pricing Structure

### Base Pricing
- **Base Rate**: PHP 25.00 per kilogram
- **Service Fees**:
  - Wash: PHP 60.00
  - Dry: PHP 50.00
  - Fold: PHP 45.00
  - Iron: PHP 55.00

### Pricing Formula
```
Line Total = (Weight × Base Rate × Quantity) + Service Fees
Order Total = Sum of all line items
```

## Technical Implementation Details

### Database Relationships
- Customer has many Laundry Orders
- Laundry Order has many Order Items
- Laundry Order has many Payments
- Laundry Order has many Status Histories
- Inventory Item has many Movements

### Services & Business Logic
- `OrderPricingService`: Calculates order and line item totals
- `OrderStatusService`: Manages status transitions with inventory integration
- `InventoryStockService`: Handles stock movements and order deduction
- `ActivityLogger`: Comprehensive system activity logging

### Security Features
- Role-based access control
- Input validation and sanitization
- Database transaction integrity
- Audit trail for all major operations

## Frontend Architecture

### Layout Structure
- **AdminLayout**: Administrative interface with full system access
- **StaffLayout**: Operational interface for daily operations
- **CustomerLayout**: Customer-facing interface for self-service

### Key Components
- Dashboard components for each role
- Order management interfaces
- Customer relationship management
- Inventory tracking interfaces
- Payment processing forms
- Comprehensive reporting views

### User Experience Features
- Responsive design for all screen sizes
- Real-time status updates
- Search and filtering capabilities
- Intuitive navigation
- Modern UI with TailwindCSS

## Installation & Setup

### Prerequisites
- PHP 8.3+
- Node.js 18+
- Composer
- Database (MySQL/PostgreSQL/SQLite)

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

### Frontend Setup
```bash
cd root
npm install
npm run dev
```

### Database Seeding
```bash
php artisan db:seed
```

## API Endpoints

### Customer Management
- GET/POST `/customers` - List/Create customers
- GET/PUT/PATCH/DELETE `/customers/{id}` - Customer operations
- Search functionality via query parameters

### Order Management
- GET/POST `/orders` - List/Create orders
- GET/PUT/PATCH/DELETE `/orders/{id}` - Order operations
- POST `/orders/{id}/status` - Status updates

### Payment Processing
- GET `/payments` - Payment history
- GET/POST `/payments/create` - Payment recording
- Receipt generation and management

### Inventory Management
- GET/POST `/inventory` - Item management
- GET/PUT `/inventory/{id}` - Item updates
- POST `/inventory/{id}/movement` - Stock movements

### Reporting
- GET `/reports` - Comprehensive analytics
- Filterable by date ranges, status, payment methods

## System Monitoring & Maintenance

### Activity Logging
- All major operations are logged
- User attribution for all actions
- Comprehensive audit trail

### Performance Considerations
- Database indexing on frequently queried fields
- Pagination for large datasets
- Optimized queries with proper relationships

### Backup Strategy
- Regular database backups
- Configuration backups
- Asset backup procedures

## Future Enhancements

### Planned Features
- Mobile application development
- SMS/email notifications
- Advanced analytics dashboard
- API integrations for payment gateways
- Multi-location support
- Loyalty program integration

### Scalability Considerations
- Queue system for background processing
- Caching strategies for performance
- Load balancing preparation
- Database optimization for growth

## Support & Documentation

### Technical Support
- Comprehensive error logging
- User activity tracking
- System health monitoring
- Performance metrics

### User Documentation
- Role-specific user guides
- Training materials
- FAQ sections
- Video tutorials (planned)

---

**System Version**: 1.0.0
**Last Updated**: April 2026
**Framework Versions**: Laravel 13.0, Vue.js 3.5.30
**Database**: Normalized relational schema with enforced integrity
