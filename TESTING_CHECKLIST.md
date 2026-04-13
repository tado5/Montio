# TESTING CHECKLIST - Post-Refactoring

**Date:** 2026-04-13  
**Version:** v1.11.0 (Post-Refactoring)

---

## 🧪 TESTING SCOPE

This checklist covers testing after the comprehensive backend and frontend refactoring to ensure all API calls work correctly with the new middleware and apiClient.

---

## ✅ BACKEND API TESTING

### Authentication Endpoints (`/api/auth/*`)

- [ ] **POST /api/auth/register** - New company registration with invite token
- [ ] **POST /api/auth/login** - Login with rate limiting (5 attempts/15min)
  - [ ] Test successful login
  - [ ] Test incorrect password
  - [ ] Test rate limiting after 5 failed attempts
  - [ ] Test 401 auto-logout on invalid token
- [ ] **GET /api/auth/profile** - Get current user profile
- [ ] **PUT /api/auth/profile** - Update profile (name, email, phone)
- [ ] **PUT /api/auth/profile/password** - Change password
- [ ] **PUT /api/auth/avatar** - Upload avatar (multipart/form-data)
- [ ] **DELETE /api/auth/avatar** - Delete avatar
- [ ] **PUT /api/auth/theme** - Toggle theme (dark/light)

### Dashboard Endpoints (`/api/dashboard/*`)

- [ ] **GET /api/dashboard/stats** - Get KPI stats (company admin)
  - [ ] Test with valid company_id from middleware
  - [ ] Test with employee role
- [ ] **GET /api/dashboard/chart/revenue** - Revenue chart (12 months)
- [ ] **GET /api/dashboard/chart/order-types** - Order types chart
- [ ] **GET /api/dashboard/employee** - Employee dashboard data

### Employee Management (`/api/employees/*`)

- [ ] **GET /api/employees** - List all employees
- [ ] **GET /api/employees/:id** - Get single employee
- [ ] **POST /api/employees** - Create new employee
  - [ ] Test email validation
  - [ ] Test with must_change_password flag
- [ ] **PUT /api/employees/:id** - Update employee
  - [ ] Test email validation
  - [ ] Test status changes
- [ ] **DELETE /api/employees/:id** - Deactivate employee (soft delete)
- [ ] **PUT /api/employees/:id/approve** - Approve pending employee
- [ ] **PUT /api/employees/:id/reactivate** - Reactivate inactive employee
- [ ] **DELETE /api/employees/:id/permanent** - Permanent delete (inactive only)
- [ ] **POST /api/employees/:id/resend-credentials** - Resend login credentials
- [ ] **PUT /api/employees/:id/change-password** - First-time password change

### Order Management (`/api/orders/*`)

- [ ] **GET /api/orders/calendar** - Get calendar orders
  - [ ] Test with date range filters
  - [ ] Test with employee filter (company admin)
  - [ ] Test employee viewing only their orders
- [ ] **GET /api/orders/:id** - Get order details

### Company Settings (`/api/company/settings/*`)

- [ ] **GET /api/company/settings** - Get all company settings
  - [ ] Test JSON parsing (billing, financial, contact, invoice)
- [ ] **PUT /api/company/settings/basic** - Update basic info (name, ICO, DIC, address)
- [ ] **PUT /api/company/settings/logo** - Upload company logo (multipart)
- [ ] **PUT /api/company/settings/billing** - Update billing info (IBAN, SWIFT)
- [ ] **PUT /api/company/settings/financial** - Update VAT, margins
- [ ] **PUT /api/company/settings/contact** - Update contact info
- [ ] **PUT /api/company/settings/invoice** - Update invoice settings

### Order Types (`/api/order-types/*`)

- [ ] **GET /api/order-types** - List all order types
  - [ ] Test JSON parsing of checklist
- [ ] **GET /api/order-types/:id** - Get single order type
- [ ] **POST /api/order-types** - Create new order type
- [ ] **PUT /api/order-types/:id** - Update order type
- [ ] **DELETE /api/order-types/:id** - Delete order type (if not used)

### Notifications (`/api/notifications/*`)

- [ ] **GET /api/notifications/unread-count** - Get unread count
- [ ] **GET /api/notifications?limit=5** - Get recent notifications
- [ ] **PUT /api/notifications/:id/read** - Mark as read
- [ ] **PUT /api/notifications/mark-all-read** - Mark all as read

---

## 🎨 FRONTEND COMPONENT TESTING

### Context Providers

- [ ] **AuthContext** - Test login/logout with apiClient
  - [ ] Token automatically added to requests
  - [ ] Automatic logout on 401 response
  - [ ] Error messages use `error.userMessage`
- [ ] **ThemeContext** - Test theme toggle saves to backend

### Pages

- [ ] **ProfilePage.jsx**
  - [ ] Load profile data
  - [ ] Edit profile (name, email, phone)
  - [ ] Change password
  - [ ] Upload/delete avatar
  - [ ] Test error handling
- [ ] **EmployeeDashboard.jsx**
  - [ ] Load employee stats and assigned orders
  - [ ] Test with employee role
- [ ] **CompanyAdminDashboard.jsx**
  - [ ] Load company stats
  - [ ] Load revenue chart
  - [ ] Load order types chart
- [ ] **SuperAdminDashboard.jsx**
  - [ ] Load all companies
  - [ ] Create new company
  - [ ] Deactivate company
- [ ] **NotificationsPage.jsx**
  - [ ] Load notifications
  - [ ] Mark as read
  - [ ] Mark all as read

### Components

- [ ] **EmployeesManager.jsx**
  - [ ] List employees
  - [ ] Create employee
  - [ ] Edit employee
  - [ ] Approve pending employee
  - [ ] Deactivate employee
  - [ ] Reactivate employee
  - [ ] Delete permanently (inactive, no orders)
  - [ ] Resend credentials
- [ ] **CompanySettingsManager.jsx**
  - [ ] Load all settings sections
  - [ ] Update basic info
  - [ ] Upload logo
  - [ ] Update billing info
  - [ ] Update financial settings
  - [ ] Update contact info
  - [ ] Update invoice settings
- [ ] **OrderTypesManager.jsx**
  - [ ] List order types
  - [ ] Create order type with checklist
  - [ ] Edit order type
  - [ ] Delete order type
- [ ] **NotificationBell.jsx**
  - [ ] Show unread count badge
  - [ ] Load recent notifications
  - [ ] Mark individual as read
  - [ ] Mark all as read
- [ ] **AvatarUpload.jsx**
  - [ ] Upload avatar (multipart)
  - [ ] Preview before upload
  - [ ] Delete avatar
  - [ ] Show DiceBear fallback
- [ ] **Calendar.jsx**
  - [ ] Load orders for calendar
  - [ ] Filter by date range
  - [ ] Filter by employee (company admin)
- [ ] **PasswordChangeModal.jsx**
  - [ ] First-time password change (employees)
  - [ ] Password validation

### Onboarding Components

- [ ] **Step1BasicInfo.jsx** - Company basic info
- [ ] **Step2LogoBilling.jsx** - Logo upload and billing
- [ ] **Step3OrderTypes.jsx** - Order types setup
- [ ] **Step5Complete.jsx** - Final registration and auto-login

---

## 🔒 SECURITY TESTING

- [ ] **CORS** - Test cross-origin requests
  - [ ] Development: All origins allowed
  - [ ] Production: Only whitelisted origins
- [ ] **Rate Limiting** - Test login rate limiter
  - [ ] 5 attempts allowed within 15 minutes
  - [ ] 6th attempt blocked with 429 response
  - [ ] X-RateLimit headers present
- [ ] **Authentication** - Test token handling
  - [ ] Token automatically added to all requests
  - [ ] Expired token triggers 401 and auto-logout
  - [ ] Redirect to /login on logout
- [ ] **Authorization** - Test role-based access
  - [ ] Company admin cannot access superadmin routes
  - [ ] Employee cannot access admin routes
  - [ ] Employee can only see their own data
- [ ] **Input Validation** - Test email validation
  - [ ] Invalid email format rejected
  - [ ] Valid email accepted

---

## 🚀 PERFORMANCE TESTING

- [ ] **Database Queries** - Verify ensureCompanyId middleware
  - [ ] No duplicate company_id lookups per request
  - [ ] Should see 50+ fewer queries than before
- [ ] **Error Handling** - Verify asyncHandler
  - [ ] Errors caught and formatted correctly
  - [ ] No unhandled promise rejections
  - [ ] Consistent error messages
- [ ] **Frontend** - Verify apiClient
  - [ ] No manual token handling in components
  - [ ] Consistent error message display
  - [ ] Automatic 401 handling works

---

## 🐛 ERROR SCENARIOS

- [ ] **Network errors** - Disconnect network mid-request
  - [ ] User-friendly error message shown
  - [ ] No app crash
- [ ] **Invalid data** - Send malformed data to API
  - [ ] Validation errors returned
  - [ ] No 500 errors
- [ ] **Expired session** - Use expired token
  - [ ] Automatic redirect to login
  - [ ] Token and user cleared from localStorage
- [ ] **Rate limited** - Exceed rate limit
  - [ ] 429 response with retry-after time
  - [ ] User-friendly message displayed

---

## 📊 REGRESSION TESTING

Test existing features to ensure refactoring didn't break anything:

- [ ] User registration and invite flow
- [ ] Login/logout flow
- [ ] Dashboard statistics accuracy
- [ ] Employee lifecycle (create → approve → active → deactivate → delete)
- [ ] Order calendar view
- [ ] Company settings updates
- [ ] Notification system
- [ ] Theme switching
- [ ] Avatar upload/delete
- [ ] Password change
- [ ] Onboarding wizard

---

## ✅ ACCEPTANCE CRITERIA

**Backend:**
- ✅ All routes use asyncHandler (no try-catch boilerplate)
- ✅ All routes use ensureCompanyId where applicable
- ✅ No duplicate company_id database queries
- ✅ Rate limiting works on login endpoint
- ✅ CORS configured with origin whitelist
- ✅ Input validation on all relevant endpoints

**Frontend:**
- ✅ All components use apiClient instead of axios
- ✅ No manual token handling in components
- ✅ Automatic 401 handling and logout
- ✅ Consistent error messages (error.userMessage)
- ✅ No axios imports except in apiClient.js

**General:**
- ✅ No console errors in browser
- ✅ No 500 errors in backend logs
- ✅ All existing features work as before
- ✅ Performance improved (fewer DB queries)

---

## 🎯 TEST EXECUTION PLAN

1. **Manual Testing** (Priority: HIGH)
   - Test all authentication flows
   - Test CRUD operations on main entities
   - Test error scenarios

2. **Automated Testing** (Priority: MEDIUM)
   - Unit tests for utilities (validation, error handling)
   - Integration tests for API endpoints
   - E2E tests for critical flows

3. **Load Testing** (Priority: LOW)
   - Test rate limiting under load
   - Test concurrent user sessions
   - Monitor database query count

---

## ⚠️ UNTESTED AREAS - REQUIRES ATTENTION

### 📊 Test Coverage Status (Updated: 2026-04-13)

**Overall Backend API Coverage:** 40% (16/40 endpoints tested)

### 🔴 UNTESTED BACKEND ENDPOINTS (24 endpoints)

#### Employee Management (`/api/employees/*`) - 0/10 tested
**Reason:** Requires company admin credentials with valid company_id

- [ ] **POST /api/employees** - Create new employee
  - Test with valid data
  - Test email validation
  - Test must_change_password flag
  - Test duplicate email handling

- [ ] **PUT /api/employees/:id** - Update employee
  - Test profile updates
  - Test status changes
  - Test email validation

- [ ] **DELETE /api/employees/:id** - Deactivate employee (soft delete)
  - Test soft delete (sets status to 'inactive')
  - Test cascade effects on orders

- [ ] **PUT /api/employees/:id/approve** - Approve pending employee
  - Test approval flow
  - Test notification creation

- [ ] **PUT /api/employees/:id/reactivate** - Reactivate inactive employee
  - Test reactivation
  - Test permission checks

- [ ] **DELETE /api/employees/:id/permanent** - Permanent delete
  - Test hard delete (only for inactive)
  - Test protection: cannot delete with active orders

- [ ] **POST /api/employees/:id/resend-credentials** - Resend login credentials
  - Test email sending
  - Test password reset token

- [ ] **PUT /api/employees/:id/change-password** - First-time password change
  - Test must_change_password workflow
  - Test password strength validation

- [ ] **GET /api/employees/:id** - Get single employee details
  - Test with valid ID
  - Test with invalid ID
  - Test company isolation

- [ ] **GET /api/employees** - List all employees (already tested as 401)
  - Need to test with company admin token

#### Order Management (`/api/orders/*`) - 1/2 tested
**Reason:** Requires company admin credentials

- [x] **GET /api/orders/calendar** - Tested (returns 401 as expected)
- [ ] **GET /api/orders/calendar** - Need to test with company admin token
  - Test date range filtering
  - Test employee filtering (company admin sees all)
  - Test employee role (sees only their orders)

- [ ] **GET /api/orders/:id** - Get order details
  - Test with valid order ID
  - Test company isolation
  - Test employee access (only assigned orders)

#### Company Settings (`/api/company/settings/*`) - 0/6 tested
**Reason:** Requires company admin credentials

- [ ] **GET /api/company/settings** - Get all settings
  - Test JSON parsing (billing, financial, contact, invoice)
  - Test with valid company_id

- [ ] **PUT /api/company/settings/basic** - Update basic info
  - Test with valid data (name, ICO, DIC, address)
  - Test Slovak ICO validation
  - Test Slovak DIC validation

- [ ] **PUT /api/company/settings/logo** - Upload company logo
  - Test multipart upload
  - Test file type validation (images only)
  - Test file size limit (2MB)
  - Test image processing with sharp

- [ ] **PUT /api/company/settings/billing** - Update billing info
  - Test IBAN validation
  - Test SWIFT code format
  - Test JSON storage

- [ ] **PUT /api/company/settings/financial** - Update VAT, margins
  - Test VAT percentage (0-100)
  - Test margin percentages
  - Test JSON storage

- [ ] **PUT /api/company/settings/contact** - Update contact info
  - Test phone validation (Slovak format)
  - Test email validation

- [ ] **PUT /api/company/settings/invoice** - Update invoice settings
  - Test invoice prefix/numbering
  - Test JSON storage

#### Order Types (`/api/order-types/*`) - 0/4 tested
**Reason:** Requires company admin credentials

- [ ] **GET /api/order-types** - List all order types
  - Test JSON parsing of checklist field
  - Test company isolation

- [ ] **GET /api/order-types/:id** - Get single order type
  - Test with valid ID
  - Test company isolation

- [ ] **POST /api/order-types** - Create new order type
  - Test with valid data
  - Test checklist JSON validation
  - Test required fields

- [ ] **PUT /api/order-types/:id** - Update order type
  - Test updates
  - Test checklist modifications

- [ ] **DELETE /api/order-types/:id** - Delete order type
  - Test deletion
  - Test protection: cannot delete if used in orders

#### Notification Endpoints (`/api/notifications/*`) - 2/4 tested
- [x] **GET /api/notifications/unread-count** - Tested ✅
- [x] **GET /api/notifications?limit=5** - Tested ✅
- [ ] **PUT /api/notifications/:id/read** - Mark as read
  - Need functional test with real notification

- [ ] **PUT /api/notifications/mark-all-read** - Mark all as read
  - Test bulk update
  - Test return value

#### Authentication Endpoints (`/api/auth/*`) - 8/10 tested
- [x] **POST /api/auth/login** - Fully tested ✅
- [x] **GET /api/auth/profile** - Tested ✅
- [x] **PUT /api/auth/profile** - Tested ✅
- [x] **PUT /api/auth/theme** - Tested ✅
- [ ] **POST /api/auth/register** - Not tested
  - Test with valid invite token
  - Test email validation
  - Test password hashing
  - Test company assignment

- [ ] **PUT /api/auth/profile/password** - Not fully tested
  - Test with correct old password
  - Test with wrong old password
  - Test password strength validation

- [ ] **PUT /api/auth/avatar** - Not tested
  - Test multipart upload
  - Test file type validation (images only)
  - Test file size limit (2MB)
  - Test image processing with sharp
  - Test DiceBear fallback

- [ ] **DELETE /api/auth/avatar** - Not tested
  - Test file deletion from filesystem
  - Test database update

#### Dashboard Endpoints (`/api/dashboard/*`) - 3/4 tested
- [x] **GET /api/dashboard/stats** - Tested ✅
- [x] **GET /api/dashboard/chart/revenue** - Tested ✅
- [x] **GET /api/dashboard/employee** - Tested ✅
- [ ] **GET /api/dashboard/chart/order-types** - Not explicitly tested
  - Need to verify with company admin

---

### 🔴 UNTESTED FRONTEND AREAS

#### Components Not Fully Tested
- [ ] **AvatarUpload.jsx** - Upload flow not tested
  - File selection
  - Preview functionality
  - Upload success/error handling
  - Delete functionality

- [ ] **Calendar.jsx** - Order calendar functionality
  - Date navigation
  - Order display
  - Filtering by employee
  - Click to view order details

- [ ] **EmployeesManager.jsx** - CRUD operations not tested
  - Create employee modal
  - Edit employee modal
  - Approve pending employee
  - Deactivate/reactivate
  - Delete permanently
  - Resend credentials

- [ ] **CompanySettingsManager.jsx** - Settings management not tested
  - All settings tabs (basic, billing, financial, contact, invoice)
  - Logo upload
  - Form validation
  - Save/cancel functionality

- [ ] **OrderTypesManager.jsx** - Order types management not tested
  - Create order type with checklist
  - Edit order type
  - Delete order type (with protection)

- [ ] **OnboardingWizard.jsx** - Complete flow not tested
  - Step 1: Basic info
  - Step 2: Logo & billing
  - Step 3: Order types
  - Step 4: Review
  - Step 5: Complete & auto-login

- [ ] **PasswordChangeModal.jsx** - Password change flow not tested
  - First-time password change (employees)
  - Current password validation
  - New password strength

#### Pages Not Fully Tested
- [ ] **CompanyAdminDashboard.jsx** - Need company admin session
  - Stats display
  - Charts rendering
  - Order list

- [ ] **EmployeeDashboard.jsx** - Need employee session
  - Employee stats
  - Assigned orders
  - Order filters

- [ ] **SuperAdminDashboard.jsx** - Partially tested
  - Company list ✅
  - Create company (not tested)
  - Deactivate company (not tested)

---

### 🔴 UNTESTED CODE PATHS

#### Backend Middleware
- [x] **verifyToken** - Tested ✅
- [x] **asyncHandler** - Tested ✅
- [x] **ensureCompanyId** - Tested indirectly ✅
- [ ] **ensureEmployeeId** - Not tested
  - Need to test employee-specific routes

- [x] **loginRateLimiter** - Tested ✅
- [ ] **apiRateLimiter** - Not tested
  - Need to test on API routes (100 req/15min)

- [ ] **requireRole** - Partially tested
  - Tested denial ✅
  - Not tested with correct roles

#### Backend Utilities
- [x] **isValidEmail** - Tested ✅
- [ ] **isStrongPassword** - Not tested
  - Min 8 characters
  - Uppercase, lowercase, number requirements

- [ ] **sanitizeString** - Not tested
  - XSS protection

- [ ] **isValidPhone** - Not tested
  - Slovak phone format (+421...)

- [ ] **isValidICO** - Not tested
  - Slovak company ID (8 digits)

- [ ] **isValidDIC** - Not tested
  - Slovak tax ID (10 digits)

- [ ] **isValidIBAN** - Not tested
  - IBAN validation algorithm

- [ ] **parseJSON** - Partially tested
  - Used in settings routes
  - Need explicit error handling test

- [ ] **validateRequired** - Not tested
  - Express middleware for required fields

- [ ] **safeFileOperation** - Not tested
  - Filesystem error handling

#### Frontend apiClient
- [x] **Request Interceptor** - Tested (token injection) ✅
- [x] **Response Interceptor** - Tested (401 handling) ✅
- [ ] **Response Interceptor** - Not fully tested
  - 429 rate limit handling
  - Network error messages
  - Generic error messages

---

### 📝 RECOMMENDED NEXT STEPS

#### Priority 1: Critical Functionality (Need Company Admin Access)
1. Create test company admin user with valid company_id
2. Test all employee CRUD operations
3. Test company settings management
4. Test order types management
5. Test order calendar with real data

#### Priority 2: Authentication & Upload Features
1. Test avatar upload/delete with real files
2. Test company logo upload with real files
3. Test password change flow (old → new)
4. Test registration with invite token

#### Priority 3: Validation Utilities
1. Unit tests for Slovak-specific validators (ICO, DIC, phone, IBAN)
2. Unit tests for password strength
3. Unit tests for XSS sanitization
4. Unit tests for JSON parsing edge cases

#### Priority 4: Frontend Component Testing
1. Manual testing of all CRUD forms
2. File upload flows (avatar, logo)
3. Onboarding wizard complete flow
4. Error message display consistency

#### Priority 5: Load & Performance Testing
1. Rate limiting under concurrent load
2. Database query count verification with ensureCompanyId
3. Response time benchmarks
4. Memory leak testing

---

### 🛠️ TEST SETUP REQUIREMENTS

**To complete remaining tests, you need:**

1. **Company Admin User**
   ```sql
   -- Create test company
   INSERT INTO companies (name, ico, dic, address, city, postal_code, invite_token, status)
   VALUES ('Test Company', '12345678', '1234567890', 'Test St. 123', 'Bratislava', '81101', 'test-token-123', 'active');
   
   -- Create company admin user
   INSERT INTO users (email, password_hash, role, company_id, name, position, theme)
   VALUES ('companyadmin@test.sk', '$2a$10$...', 'companyadmin', 1, 'Test Admin', 'CEO', 'dark');
   ```

2. **Test Data**
   - At least 2-3 employees in different statuses (active, pending, inactive)
   - At least 5-10 orders with various dates
   - At least 3-4 order types
   - Sample notifications

3. **Test Files**
   - Test images for avatar upload (< 2MB, valid formats: jpg, png, gif)
   - Test images for logo upload (< 2MB)
   - Invalid files for negative testing

4. **Environment**
   - Test database with realistic data
   - SMTP configured for email testing (or mock)
   - Sufficient disk space for uploads

---

**Last Updated:** 2026-04-13  
**Status:** 40% Tested - 60% Remaining  
**Next Action:** Set up company admin test user and complete endpoint testing
