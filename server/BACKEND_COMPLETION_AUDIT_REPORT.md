# Backend Completion Audit Report

**Project**: Cravings (Full-Stack Food Ordering & Delivery Platform)  
**Scope**: Backend / Server-Side Architecture (`server/`)  
**Audit Date**: August 2026  
**Auditor**: Antigravity DeepMind Agentic Audit Engine  

---

## 1. Executive Summary

A comprehensive, end-to-end backend audit was conducted across the entire Cravings server codebase (`d:\cravings_original\server`). The audit traced all **Models**, **Controllers**, **Routers**, **Middleware**, **Authentication/Authorization pipelines**, **Database relationships**, **Payment systems**, **Cloudinary integration**, **Email/OTP workflows**, and **Seeders**.

### High-Level Summary:
* **Total Endpoints Implemented**: 40 API routes across 9 router files.
* **Core Strengths**: Strong JWT cookie-based session management, robust Razorpay HMAC-SHA256 signature verification, clean Mongoose schema architectures, extensive Cloudinary asset upload pipelines, and a structured Admin and Rider dispatch ecosystem.
* **Key Deficiencies & Blockers**:
  1. **Restaurant Kitchen Order Workflow is completely missing**: There are no controllers or routes for restaurant managers to view incoming orders or advance order statuses from `accepted` ➔ `preparing` ➔ `ready`.
  2. **Security Vulnerabilities Identified**:
     * Password hash leakage in `GetRestaurantDetails` ([public.controller.js](file:///d:/cravings_original/server/src/controller/public.controller.js#L46-L51)), `LoginUser` ([auth.controller.js](file:///d:/cravings_original/server/src/controller/auth.controller.js#L90-L93)), and `EditUserProfile` ([common.controller.js](file:///d:/cravings_original/server/src/controller/common.controller.js#L50-L53)).
     * Profile hijacking flaw in `EditUserProfile` ([common.controller.js](file:///d:/cravings_original/server/src/controller/common.controller.js#L18)) querying `email` from `req.body` rather than `req.user._id`.
  3. **Schema & Runtime Discrepancies**:
     * `Order.cancellationReason` assigned in Admin controller is missing from [order.model.js](file:///d:/cravings_original/server/src/models/order.model.js) schema (dropped by Mongoose strict mode).
     * `RestaurantUpdateMenuItem` is implemented in [restaurant.controller.js](file:///d:/cravings_original/server/src/controller/restaurant.controller.js#L654) but not registered in [restaurant.route.js](file:///d:/cravings_original/server/src/router/restaurant.route.js).
     * Cookie casing mismatch in `LogoutUser` (`"Oreo"` vs `"oreo"`).
     * Missing `CustomerAuthProtect` role guard on customer & order routes.

---

## 2. Backend Architecture

### Architectural Component Communication Graph

```mermaid
flowchart TD
    Client([Web / Mobile Client]) -->|HTTP / Cookies| Express[Express Server - index.js :5000]
    
    subgraph Middleware Layer
        Express --> Cors[CORS & CookieParser]
        Cors --> Morgan[Morgan Logger]
        Morgan --> RouterDispatcher[Route Matcher]
        
        RouterDispatcher --> AP[AuthProtect - Any User]
        RouterDispatcher --> OAP[OTPAuthProtect - Kitkat Cookie]
        RouterDispatcher --> ResAP[RestaurantAuthProtect - Manager]
        RouterDispatcher --> RidAP[RiderAuthProtect - Rider]
        RouterDispatcher --> AdmAP[AdminAuthProtect - Superuser]
    end

    subgraph Controller Subsystems
        AP --> CommonCtrl[common.controller.js]
        AP --> CustCtrl[customer.controller.js]
        AP --> OrderCtrl[order.controller.js]
        AP --> PayCtrl[payment.controller.js]
        
        OAP --> AuthCtrlOTP[auth.controller.js :ResetPassword]
        RouterDispatcher --> AuthCtrlPublic[auth.controller.js / public.controller.js]
        
        ResAP --> RestCtrl[restaurant.controller.js]
        RidAP --> RiderCtrl[rider.controller.js]
        AdmAP --> AdminCtrl[admin.controller.js]
    end

    subgraph External Services & Storage
        AuthCtrlPublic --> Nodemailer[(Nodemailer / Gmail SMTP)]
        CommonCtrl & RestCtrl & RiderCtrl --> Cloudinary[(Cloudinary CDN v2)]
        PayCtrl --> Razorpay[(Razorpay Gateway API)]
        
        CustCtrl & OrderCtrl & AdminCtrl & RestCtrl & RiderCtrl --> Mongo[(MongoDB Database via Mongoose)]
    end
```

### Component Inventory
* **Server Entry Point**: [index.js](file:///d:/cravings_original/server/index.js) (Express 5.2.1, Morgan, CORS, CookieParser).
* **Database Connection**: [dbConnection.config.js](file:///d:/cravings_original/server/src/config/dbConnection.config.js) (Mongoose 9.7.3).
* **Cloud Storage**: [cloudinary.config.js](file:///d:/cravings_original/server/src/config/cloudinary.config.js), [image.service.js](file:///d:/cravings_original/server/src/utils/image.service.js).
* **Mailing Engine**: [email.config.js](file:///d:/cravings_original/server/src/config/email.config.js), [email.service.js](file:///d:/cravings_original/server/src/utils/email.service.js).
* **Payment Gateway**: [payment.controller.js](file:///d:/cravings_original/server/src/controller/payment.controller.js) (Razorpay 2.9.8 + Crypto HMAC-SHA256).
* **Seeders**: [seed.js](file:///d:/cravings_original/server/src/seeders/seed.js), [admin.seed.js](file:///d:/cravings_original/server/src/seeders/admin.seed.js), [user.seed.js](file:///d:/cravings_original/server/src/seeders/user.seed.js).

---

## 3. Backend Folder/Module Analysis

```
d:/cravings_original/server/
├── index.js                     # Root express bootstrap, router mounting & global error handler
├── package.json                 # Dependencies & scripts
├── .env                         # Environmental secrets
├── src/
│   ├── config/
│   │   ├── cloudinary.config.js # Cloudinary SDK configuration
│   │   ├── dbConnection.config.js # MongoDB connection handler
│   │   └── email.config.js      # Nodemailer Gmail transport
│   ├── controller/
│   │   ├── admin.controller.js  # Admin supervision, dispatch & audit controllers (17 methods)
│   │   ├── auth.controller.js   # User registration, login, logout & OTP flows
│   │   ├── common.controller.js # Profile edit & password update
│   │   ├── customer.controller.js# Address book CRUD & order lookup
│   │   ├── order.controller.js  # Order calculation & checkout creation
│   │   ├── payment.controller.js# Razorpay order generation & signature validation
│   │   ├── public.controller.js # Contact form & public restaurant lookup
│   │   ├── restaurant.controller.js # Restaurant profile, legal, images & menu management
│   │   └── rider.controller.js  # Rider profile, documents, location, earnings & order lifecycle
│   ├── middleware/
│   │   └── auth.middelware.js   # JWT guards (AuthProtect, OTPAuthProtect, RestaurantAuthProtect, RiderAuthProtect, AdminAuthProtect)
│   ├── models/
│   │   ├── admin.model.js       # Admin schema
│   │   ├── contact.model.js     # Contact inquiries schema
│   │   ├── customer.model.js    # Customer profile & embedded addressBook schema
│   │   ├── menu.model.js        # Restaurant menu catalog & subdocument items
│   │   ├── order.model.js       # Order, billDetails, drop address & paymentDetails schema
│   │   ├── otp.model.js         # Password reset OTP storage schema
│   │   ├── restaurant.model.js  # Restaurant details, legal KYC, bank & location schema
│   │   ├── rider.model.js       # Rider KYC documents, vehicle, bank & coordinates schema
│   │   └── user.model.js        # Base user credentials, photo & userType enum
│   ├── router/
│   │   ├── admin.route.js       # /admin routes (17 routes)
│   │   ├── auth.route.js        # /auth routes (6 routes)
│   │   ├── common.route.js      # /common routes (2 routes)
│   │   ├── customer.route.js    # /customer routes (5 routes)
│   │   ├── order.route.js       # /order routes (1 route)
│   │   ├── payment.route.js     # /payment routes (2 routes)
│   │   ├── public.route.js      # /public routes (3 routes)
│   │   ├── restaurant.route.js  # /restaurant routes (13 routes)
│   │   └── rider.route.js       # /rider routes (12 routes)
│   ├── seeders/
│   │   ├── admin.seed.js        # Seeds default root admin user
│   │   ├── seed.js              # Master seeder runner
│   │   └── user.seed.js         # Seeds default customer, rider, and restaurant users
│   └── utils/
│       ├── auth.service.js      # JWT cookie generators (oreo, kitkat)
│       ├── email.service.js     # HTML email template builder
│       └── image.service.js     # Cloudinary buffer upload/destroy utilities
```

---

## 4. Model Audit

| Model | Collection | Primary Relationships | Status | Issues Identified | Recommendations |
|---|---|---|---|---|---|
| **User** | `users` | Base identity for all roles | **PARTIAL** | Password hash exposed in default queries. | Add pre-find middleware or use `.select("-password")` universally. |
| **Admin** | `admins` | `adminId` ➔ `user` (1:1) | **COMPLETE** | Model exists but is bypassed by controllers relying purely on `req.user.userType === "admin"`. | Retain as metadata profile or extend for multi-admin roles. |
| **Customer** | `customers` | `customerId` ➔ `user` (1:1), `orders` (1:N) | **PARTIAL** | `customerId` lacks `unique: true` index, risking duplicate profiles. | Add `unique: true` constraint on `customerId`. |
| **Restaurant** | `restaurants` | `managerId` ➔ `user` (1:1), `menu` (1:1), `orders` (1:N) | **PARTIAL** | 1. `managerId` lacks `unique: true`.<br>2. Subdocument fields in `legal`, `documents`, `financialDetails` are marked `required: true`, which blocks incremental profile creation if raw `.create` is invoked.<br>3. Field `restaurantType` used in controller but missing from schema. | Add `unique: true` on `managerId`; add `restaurantType: { type: String }` to schema. |
| **Rider** | `riders` | `riderId` ➔ `user` (1:1), `orders` (1:N) | **COMPLETE** | `riderId` is unique; schema fields match controllers cleanly. | Add geospatial 2dsphere index on coordinates for spatial proximity queries. |
| **Menu** | `menus` | `restaurantId` ➔ `restaurant` (1:1) | **PARTIAL** | Field `isNew` in `menuItems` is a reserved Mongoose property keyword (`[MONGOOSE] Warning: isNew is a reserved schema pathname`). | Rename `isNew` to `isNewItem` or `isNewlyAdded`. |
| **Order** | `orders` | `restaurantId` ➔ `restaurant`, `customerId` ➔ `customer`, `riderId` ➔ `rider` | **PARTIAL** | 1. `itemPrice` and `quantity` in `orderItems` are typed as `String` instead of `Number`.<br>2. `cancellationReason` is assigned in `UpdateOrderStatus` but missing from schema definition (omitted on save). | Update `itemPrice`/`quantity` to `Number`; add `cancellationReason: { type: String, default: "" }` to `orderSchema`. |
| **OTP** | `otps` | Stored by `email` | **PARTIAL** | No MongoDB TTL index on `expiresAt`. Expired OTPs accumulate indefinitely until manually overwritten. | Add `{ expireAfterSeconds: 0 }` index on `expiresAt`. |
| **Contact** | `contacts` | Standalone inquiries | **COMPLETE** | Simple, valid contact submission schema. | Ready for production. |

---

## 5. Controller Audit

| # | Controller Function | File | Intended Role | Route | Auth Middleware | Status | Audit Findings & Deficiencies |
|---|---|---|---|---|---|---|---|
| 1 | `RegisterUser` | `auth.controller.js` | Public | `POST /auth/register` | None | **COMPLETE** | Validates required fields, checks email uniqueness, hashes password, saves default placeholder avatar. |
| 2 | `LoginUser` | `auth.controller.js` | Public | `POST /auth/login` | None | **INCORRECT** | **Security Leak**: Returns `data: existingUser` including raw bcrypt password hash. `catch` block calls `next()` instead of `next(error)`. |
| 3 | `LogoutUser` | `auth.controller.js` | Public | `GET /auth/logout` | None | **INCORRECT** | **Bug**: Calls `res.clearCookie("Oreo")` (capitalized) instead of `"oreo"` (lowercase), failing to clear session on case-sensitive engines. `catch` calls `next()`. |
| 4 | `SendOtp` | `auth.controller.js` | Public | `POST /auth/send-otp` | None | **COMPLETE** | Generates 6-digit OTP, hashes it, replaces existing OTP, dispatches HTML email. |
| 5 | `VerifyOtp` | `auth.controller.js` | Public | `POST /auth/verify-otp` | None | **COMPLETE** | Verifies bcrypt OTP hash, deletes record, issues `kitkat` cookie. |
| 6 | `ResetPassword` | `auth.controller.js` | Verified OTP | `POST /auth/reset-password` | `OTPAuthProtect` | **COMPLETE** | Hashes new password and updates user document. |
| 7 | `EditUserProfile` | `common.controller.js` | Logged In | `PUT /common/edit-profile` | `AuthProtect` | **CRITICAL** | **Account Takeover Risk**: Queries `User.findOne({ email })` using `req.body.email` rather than `req.user._id`. Leaks password hash in response. `catch` calls `next()`. |
| 8 | `UpdateUserPassword` | `common.controller.js` | Logged In | `PATCH /common/change-password` | `AuthProtect` | **PARTIALLY COMPLETE** | Verifies old password correctly. Contains an arbitrary `setTimeout(3000)` artificial delay. `catch` calls `next()`. |
| 9 | `ContactUsForm` | `public.controller.js` | Public | `POST /public/contact-us` | None | **COMPLETE** | Validates and persists contact inquiries. |
| 10 | `GetAllRestaurants` | `public.controller.js` | Public | `GET /public/restaurants` | None | **INCORRECT** | Queries `Restaurant.find()` without `{ status: "active" }` or `{ isOpen: true }` filter, exposing banned/inactive restaurants to consumers. |
| 11 | `GetRestaurantDetails` | `public.controller.js` | Public | `GET /public/restaurant-detail/:restaurantId` | None | **CRITICAL** | **Critical Security Leak**: Populates `managerId` without `.select("-password")`, exposing manager password hash to unauthenticated visitors. Returns 404 if menu document is missing. |
| 12 | `AddAddress` | `customer.controller.js` | Customer | `POST /customer/address-book` | `AuthProtect` | **COMPLETE** | Upserts customer profile and appends/resets default address. |
| 13 | `UpdateAddress` | `customer.controller.js` | Customer | `PUT /customer/address-book/:addressId` | `AuthProtect` | **COMPLETE** | Updates address subdocument by ID safely. |
| 14 | `DeleteAddress` | `customer.controller.js` | Customer | `DELETE /customer/address-book/:addressId` | `AuthProtect` | **COMPLETE** | Deletes address subdocument. |
| 15 | `GetAddressBook` | `customer.controller.js` | Customer | `GET /customer/address-book` | `AuthProtect` | **COMPLETE** | Retrieves customer address array. |
| 16 | `GetAllOrders` | `customer.controller.js` | Customer | `GET /customer/all-orders` | `AuthProtect` | **PARTIALLY COMPLETE** | Retrieves customer orders but lacks pagination and restaurant/item population. |
| 17 | `CreateOrder` | `order.controller.js` | Customer | `POST /order/create-order/:restaurantId` | `AuthProtect` | **COMPLETE** | Enforces `userType === "customer"`, validates item IDs against `Menu`, computes tax/fees, generates pending order. |
| 18 | `CreateRazorpayOrder` | `payment.controller.js` | Customer | `POST /payment/create-order` | `AuthProtect` | **COMPLETE** | Converts amount to paise, creates gateway order, binds `razorpayOrderId`. |
| 19 | `VerifyRazorpayPayment` | `payment.controller.js` | Customer | `POST /payment/verify` | `AuthProtect` | **COMPLETE** | Validates HMAC-SHA256 signature, transitions order to `orderStatus = "accepted"` and `paymentStatus = "completed"`. |
| 20 | `RestaurantUpdateInfo` | `restaurant.controller.js` | Restaurant | `PUT /restaurant/update-restaurant-info` | `RestaurantAuthProtect` | **COMPLETE** | Upserts restaurant info; uses `restaurantType` which is omitted by schema. |
| 21 | `RestaurantGetData` | `restaurant.controller.js` | Restaurant | `GET /restaurant/get-restaurant-data` | `RestaurantAuthProtect` | **PARTIALLY COMPLETE** | Redundantly checks `req.query.id === currentUser._id.toString()`. Should query `managerId: currentUser._id` directly. |
| 22 | `OpenRestaurant` | `restaurant.controller.js` | Restaurant | `PATCH /restaurant/change-open-status/:openStatus` | `RestaurantAuthProtect` | **COMPLETE** | Toggles `isOpen: true/false`. |
| 23 | `RestaurantUpdateLegalInfo` | `restaurant.controller.js` | Restaurant | `PUT /restaurant/update-legal-info` | `RestaurantAuthProtect` | **COMPLETE** | Updates legal name & company type. |
| 24 | `RestaurantUpdateAddress` | `restaurant.controller.js` | Restaurant | `PUT /restaurant/update-address` | `RestaurantAuthProtect` | **COMPLETE** | Updates address & GPS coordinates. |
| 25 | `RestaurantUpdateBankingDocuments` | `restaurant.controller.js` | Restaurant | `PUT /restaurant/update-banking-documents` | `RestaurantAuthProtect` | **COMPLETE** | Updates bank info & document URLs. |
| 26 | `RestaurantUpdateSocialMediaLinks` | `restaurant.controller.js` | Restaurant | `PUT /restaurant/update-social-media-links` | `RestaurantAuthProtect` | **COMPLETE** | Updates social media array. |
| 27 | `RestaurantUpdateCoverPhoto` | `restaurant.controller.js` | Restaurant | `PUT /restaurant/update-cover-photo` | `RestaurantAuthProtect` | **COMPLETE** | Uploads image to Cloudinary, deletes previous asset. |
| 28 | `RestaurantUpdateRestaurantImages` | `restaurant.controller.js` | Restaurant | `PUT /restaurant/update-restaurant-images` | `RestaurantAuthProtect` | **COMPLETE** | Multi-image buffer upload to Cloudinary. |
| 29 | `RestaurantAddMenuItems` | `restaurant.controller.js` | Restaurant | `POST /restaurant/add-menu-item` | `RestaurantAuthProtect` | **COMPLETE** | Validates dish, uploads image, appends to `Menu`. |
| 30 | `RestaurantMenuItems` | `restaurant.controller.js` | Restaurant | `GET /restaurant/menu-items` | `RestaurantAuthProtect` | **COMPLETE** | Filters out `isDeleted: true` items. |
| 31 | `RestaurantUpdateMenuItem` | `restaurant.controller.js` | Restaurant | *Unrouted* | `RestaurantAuthProtect` | **UNUSED** | Implemented in controller but NOT mounted in router. |
| 32 | `RestaurantUpdateMenuItemStatus` | `restaurant.controller.js` | Restaurant | `PATCH /restaurant/menu-item/:itemId/status` | `RestaurantAuthProtect` | **COMPLETE** | Updates status: `available`, `unavailable`, `discontinued`. |
| 33 | `RestaurantToggleMenuItemControl` | `restaurant.controller.js` | Restaurant | `PATCH /restaurant/menu-item/:itemId/control` | `RestaurantAuthProtect` | **COMPLETE** | Toggles boolean flags (`isTopRated`, `isRecommended`, `isNew`). |
| 34 | `RestaurantDeleteMenuItem` | `restaurant.controller.js` | Restaurant | `DELETE /restaurant/menu-item/:itemId` | `RestaurantAuthProtect` | **COMPLETE** | Sets `isDeleted = true` and `status = "discontinued"`. |
| 35 | `GetRiderProfile` | `rider.controller.js` | Rider | `GET /rider/profile` | `RiderAuthProtect` | **COMPLETE** | Returns rider profile with populated user details (excluding password). |
| 36 | `UpdateRiderProfile` | `rider.controller.js` | Rider | `PUT /rider/profile` | `RiderAuthProtect` | **COMPLETE** | Updates vehicle, address, and bank info. |
| 37 | `UploadRiderDocuments` | `rider.controller.js` | Rider | `PUT /rider/upload-documents` | `RiderAuthProtect` | **COMPLETE** | Multi-field KYC upload to Cloudinary. |
| 38 | `ToggleRiderAvailability` | `rider.controller.js` | Rider | `PATCH /rider/toggle-availability` | `RiderAuthProtect` | **COMPLETE** | Blocks inactive riders from going online; toggles `isAvailable`. |
| 39 | `UpdateRiderLocation` | `rider.controller.js` | Rider | `PATCH /rider/location` | `RiderAuthProtect` | **COMPLETE** | Updates `currentLocation.lat` and `lon`. |
| 40 | `GetRiderDashboard` | `rider.controller.js` | Rider | `GET /rider/dashboard` | `RiderAuthProtect` | **COMPLETE** | Counts active deliveries, today's deliveries, and ₹40 earnings tallies. |
| 41 | `GetRiderEarnings` | `rider.controller.js` | Rider | `GET /rider/earnings` | `RiderAuthProtect` | **COMPLETE** | Computes today's, weekly, and total ₹40 earnings with transaction breakdown. |
| 42 | `GetRiderOrders` | `rider.controller.js` | Rider | `GET /rider/orders` | `RiderAuthProtect` | **COMPLETE** | Supports `?status=active|completed|all`, populates restaurant & customer info. |
| 43 | `GetRiderOrderDetails` | `rider.controller.js` | Rider | `GET /rider/orders/:orderId` | `RiderAuthProtect` | **COMPLETE** | Enforces ownership (`riderId: rider._id`), populates full order details. |
| 44 | `AcceptAssignedOrder` | `rider.controller.js` | Rider | `PATCH /rider/orders/:orderId/accept` | `RiderAuthProtect` | **PARTIALLY COMPLETE** | Validates status in `["ready", "accepted"]` but does not alter database state. |
| 45 | `PickupOrder` | `rider.controller.js` | Rider | `PATCH /rider/orders/:orderId/pickup` | `RiderAuthProtect` | **COMPLETE** | Validates status in `["ready", "accepted"]` ➔ updates to `"pickedUp"`. |
| 46 | `OutForDeliveryOrder` | `rider.controller.js` | Rider | `PATCH /rider/orders/:orderId/out-for-delivery` | `RiderAuthProtect` | **COMPLETE** | Validates status is `"pickedUp"` ➔ updates to `"outForDelivery"`. |
| 47 | `DeliverOrder` | `rider.controller.js` | Rider | `PATCH /rider/orders/:orderId/deliver` | `RiderAuthProtect` | **COMPLETE** | Validates status is `"outForDelivery"` ➔ updates to `"delivered"`. |
| 48 | `GetAdminDashboardStats` | `admin.controller.js` | Admin | `GET /admin/dashboard` | `AdminAuthProtect` | **COMPLETE** | Aggregates all user metrics, active deliveries, revenue, and approval queues. |
| 49 | `GetAllCustomers` | `admin.controller.js` | Admin | `GET /admin/customers` | `AdminAuthProtect` | **COMPLETE** | Cross-collection regex search across `fullName`, `email`, and `phone`. |
| 50 | `GetCustomerDetails` | `admin.controller.js` | Admin | `GET /admin/customers/:customerId` | `AdminAuthProtect` | **COMPLETE** | Populates user info, full address book, and order history. |
| 51 | `UpdateCustomerStatus` | `admin.controller.js` | Admin | `PATCH /admin/customers/:customerId/status` | `AdminAuthProtect` | **COMPLETE** | Updates/toggles `status` (`verified`, `suspended`) and syncs `isActive`. |
| 52 | `GetAllRestaurants` | `admin.controller.js` | Admin | `GET /admin/restaurants` | `AdminAuthProtect` | **COMPLETE** | Multi-filter by `status`, `isOpen`, `city`, and regex search. |
| 53 | `GetRestaurantDetails` | `admin.controller.js` | Admin | `GET /admin/restaurants/:restaurantId` | `AdminAuthProtect` | **COMPLETE** | Fetches restaurant profile, legal KYC, bank details, and menu dishes. |
| 54 | `UpdateRestaurantStatus` | `admin.controller.js` | Admin | `PATCH /admin/restaurants/:restaurantId/status` | `AdminAuthProtect` | **COMPLETE** | Updates `status: active/inactive/blocked`; auto-closes `isOpen: false` if deactivated. |
| 55 | `GetRestaurantOrders` | `admin.controller.js` | Admin | `GET /admin/restaurants/:restaurantId/orders` | `AdminAuthProtect` | **COMPLETE** | Returns restaurant order history with customer & rider details. |
| 56 | `GetAllRiders` | `admin.controller.js` | Admin | `GET /admin/riders` | `AdminAuthProtect` | **COMPLETE** | Multi-filter by `status`, `isAvailable`, vehicle number, and city. |
| 57 | `GetRiderDetails` | `admin.controller.js` | Admin | `GET /admin/riders/:riderId` | `AdminAuthProtect` | **COMPLETE** | Returns documents, vehicle specs, bank info, and active delivery load. |
| 58 | `UpdateRiderStatus` | `admin.controller.js` | Admin | `PATCH /admin/riders/:riderId/status` | `AdminAuthProtect` | **COMPLETE** | Updates status: `pending`, `active`, `inactive`, `blocked`; disables `isAvailable` if blocked. |
| 59 | `GetRiderOrders` | `admin.controller.js` | Admin | `GET /admin/riders/:riderId/orders` | `AdminAuthProtect` | **COMPLETE** | Returns deliveries assigned to specific rider. |
| 60 | `GetRiderEarnings` | `admin.controller.js` | Admin | `GET /admin/riders/:riderId/earnings` | `AdminAuthProtect` | **COMPLETE** | Computes rider delivery fee audit (total & today). |
| 61 | `GetAllOrders` | `admin.controller.js` | Admin | `GET /admin/orders` | `AdminAuthProtect` | **COMPLETE** | Live platform-wide order stream with date range, status, restaurant, customer, rider filters. |
| 62 | `GetOrderDetails` | `admin.controller.js` | Admin | `GET /admin/orders/:orderId` | `AdminAuthProtect` | **COMPLETE** | Full 360° inspection of order, billDetails, restaurant legal, customer, and rider. |
| 63 | `AssignRiderToOrder` | `admin.controller.js` | Admin | `PATCH /admin/orders/:orderId/assign-rider` | `AdminAuthProtect` | **COMPLETE** | Validates status in `["ready", "accepted", "preparing"]` and rider `status === "active"`; assigns `order.riderId`. |
| 64 | `UpdateOrderStatus` | `admin.controller.js` | Admin | `PATCH /admin/orders/:orderId/status` | `AdminAuthProtect` | **COMPLETE** | Admin emergency override for order status, payment status, and cancellation reason. |

---

## 6. Route Audit

### Complete Master Route Table

```
========================================================================================================================
METHOD  ROUTE                                        MIDDLEWARE                   CONTROLLER                      STATUS
========================================================================================================================
POST    /auth/register                               None                         RegisterUser                    OK
POST    /auth/login                                  None                         LoginUser                       OK (Leaking Hash)
GET     /auth/logout                                 None                         LogoutUser                      OK (Cookie Casing Bug)
POST    /auth/send-otp                               None                         SendOtp                         OK
POST    /auth/verify-otp                             None                         VerifyOtp                       OK
POST    /auth/reset-password                         OTPAuthProtect               ResetPassword                   OK
------------------------------------------------------------------------------------------------------------------------
POST    /public/contact-us                           None                         ContactUsForm                   OK
GET     /public/restaurants                          None                         GetAllRestaurants               OK (Unfiltered)
GET     /public/restaurant-detail/:restaurantId      None                         GetRestaurantDetails            OK (Leaking Hash)
------------------------------------------------------------------------------------------------------------------------
PUT     /common/edit-profile                         AuthProtect, Multer          EditUserProfile                 OK (ID Hijack Risk)
PATCH   /common/change-password                      AuthProtect                  UpdateUserPassword              OK (Artificial Delay)
------------------------------------------------------------------------------------------------------------------------
GET     /customer/address-book                       AuthProtect                  GetAddressBook                  OK
POST    /customer/address-book                       AuthProtect                  AddAddress                      OK
PUT     /customer/address-book/:addressId            AuthProtect                  UpdateAddress                   OK
DELETE  /customer/address-book/:addressId            AuthProtect                  DeleteAddress                   OK
GET     /customer/all-orders                         AuthProtect                  GetAllOrders                    OK
------------------------------------------------------------------------------------------------------------------------
POST    /order/create-order/:restaurantId            AuthProtect                  CreateOrder                     OK
------------------------------------------------------------------------------------------------------------------------
POST    /payment/create-order                        AuthProtect                  CreateRazorpayOrder             OK
POST    /payment/verify                              AuthProtect                  VerifyRazorpayPayment           OK
------------------------------------------------------------------------------------------------------------------------
PUT     /restaurant/update-restaurant-info           RestaurantAuthProtect        RestaurantUpdateInfo            OK
GET     /restaurant/get-restaurant-data              RestaurantAuthProtect        RestaurantGetData               OK
PATCH   /restaurant/change-open-status/:openStatus   RestaurantAuthProtect        OpenRestaurant                  OK
PUT     /restaurant/update-legal-info                RestaurantAuthProtect        RestaurantUpdateLegalInfo       OK
PUT     /restaurant/update-address                   RestaurantAuthProtect        RestaurantUpdateAddress         OK
PUT     /restaurant/update-banking-documents         RestaurantAuthProtect        RestaurantUpdateBankingDocuments OK
PUT     /restaurant/update-social-media-links        RestaurantAuthProtect        RestaurantUpdateSocialMediaLinks OK
PUT     /restaurant/update-cover-photo               RestaurantAuthProtect, Multer RestaurantUpdateCoverPhoto      OK
PUT     /restaurant/update-restaurant-images         RestaurantAuthProtect, Multer RestaurantUpdateRestaurantImages OK
POST    /restaurant/add-menu-item                    RestaurantAuthProtect, Multer RestaurantAddMenuItems          OK
GET     /restaurant/menu-items                       RestaurantAuthProtect        RestaurantMenuItems             OK
PATCH   /restaurant/menu-item/:itemId/status         RestaurantAuthProtect        RestaurantUpdateMenuItemStatus  OK
PATCH   /restaurant/menu-item/:itemId/control        RestaurantAuthProtect        RestaurantToggleMenuItemControl OK
DELETE  /restaurant/menu-item/:itemId                RestaurantAuthProtect        RestaurantDeleteMenuItem        OK
---     [UNROUTED: RestaurantUpdateMenuItem]         --------------------         RestaurantUpdateMenuItem        MISSING ROUTE
------------------------------------------------------------------------------------------------------------------------
GET     /rider/profile                               RiderAuthProtect             GetRiderProfile                 OK
PUT     /rider/profile                               RiderAuthProtect             UpdateRiderProfile              OK
PUT     /rider/upload-documents                      RiderAuthProtect, Multer     UploadRiderDocuments            OK
PATCH   /rider/toggle-availability                   RiderAuthProtect             ToggleRiderAvailability         OK
PATCH   /rider/location                              RiderAuthProtect             UpdateRiderLocation             OK
GET     /rider/dashboard                             RiderAuthProtect             GetRiderDashboard               OK
GET     /rider/earnings                              RiderAuthProtect             GetRiderEarnings                OK
GET     /rider/orders                                RiderAuthProtect             GetRiderOrders                  OK
GET     /rider/orders/:orderId                       RiderAuthProtect             GetRiderOrderDetails            OK
PATCH   /rider/orders/:orderId/accept                RiderAuthProtect             AcceptAssignedOrder             OK
PATCH   /rider/orders/:orderId/pickup                RiderAuthProtect             PickupOrder                     OK
PATCH   /rider/orders/:orderId/out-for-delivery      RiderAuthProtect             OutForDeliveryOrder             OK
PATCH   /rider/orders/:orderId/deliver               RiderAuthProtect             DeliverOrder                    OK
------------------------------------------------------------------------------------------------------------------------
GET     /admin/dashboard                             AdminAuthProtect             GetAdminDashboardStats          OK
GET     /admin/customers                             AdminAuthProtect             GetAllCustomers                 OK
GET     /admin/customers/:customerId                 AdminAuthProtect             GetCustomerDetails              OK
PATCH   /admin/customers/:customerId/status          AdminAuthProtect             UpdateCustomerStatus            OK
GET     /admin/restaurants                           AdminAuthProtect             GetAllRestaurants               OK
GET     /admin/restaurants/:restaurantId             AdminAuthProtect             GetRestaurantDetails            OK
PATCH   /admin/restaurants/:restaurantId/status      AdminAuthProtect             UpdateRestaurantStatus          OK
GET     /admin/restaurants/:restaurantId/orders      AdminAuthProtect             GetRestaurantOrders             OK
GET     /admin/riders                                AdminAuthProtect             GetAllRiders                    OK
GET     /admin/riders/:riderId                       AdminAuthProtect             GetRiderDetails                 OK
PATCH   /admin/riders/:riderId/status                AdminAuthProtect             UpdateRiderStatus               OK
GET     /admin/riders/:riderId/orders                AdminAuthProtect             GetRiderOrders                  OK
GET     /admin/riders/:riderId/earnings              AdminAuthProtect             GetRiderEarnings                OK
GET     /admin/orders                                AdminAuthProtect             GetAllOrders                    OK
GET     /admin/orders/:orderId                       AdminAuthProtect             GetOrderDetails                 OK
PATCH   /admin/orders/:orderId/assign-rider          AdminAuthProtect             AssignRiderToOrder              OK
PATCH   /admin/orders/:orderId/status                AdminAuthProtect             UpdateOrderStatus               OK
========================================================================================================================
```

---

## 7. Authentication & Authorization Audit

### Auth Pipeline Breakdown
```
1. Registration (POST /auth/register)
   └─► Bcrypt Salt (10 rounds) ➔ Stores User with userType in MongoDB.

2. Login (POST /auth/login)
   └─► Compare password ➔ Sign JWT { id: user._id } (1 day expiry) ➔ Set HTTP-Only 'oreo' cookie.

3. Protected Route Request
   └─► auth.middelware.js reads req.cookies.oreo ➔ jwt.verify() ➔ User.findById(decode.id) ➔ req.user = user.

4. Role Guarding
   ├─► RestaurantAuthProtect: req.user.userType === "restaurant" ? next() : 403 Forbidden
   ├─► RiderAuthProtect:      req.user.userType === "rider"      ? next() : 403 Forbidden
   ├─► AdminAuthProtect:      req.user.userType === "admin"      ? next() : 403 Forbidden
   └─► AuthProtect:           Passes ANY valid authenticated user without role verification.
```

### Authorization Vulnerability Findings
1. **Missing `CustomerAuthProtect`**:
   - `CustomerRouter` and `OrderRouter` utilize `AuthProtect`. Any authenticated account (e.g. a restaurant manager or rider) can add addresses or trigger customer routes. While `CreateOrder` includes an internal `if (currentUser.userType !== "customer")` check, `CustomerRouter` address book routes lack this check.
2. **Account Takeover via Profile Edit**:
   - In `EditUserProfile` ([common.controller.js:18](file:///d:/cravings_original/server/src/controller/common.controller.js#L18)), the controller looks up the target user via `User.findOne({ email: req.body.email })` instead of `req.user._id`. An attacker can submit any victim's email address and overwrite their name, phone, and profile photo.
3. **Rider Ownership Verification**:
   - Rider endpoints enforce ownership properly via `Order.findOne({ _id: orderId, riderId: rider._id })`.
4. **Customer Ownership Verification**:
   - `payment.controller.js` enforces ownership properly via `getCustomerOrder(req.user._id, orderId)`.

---

## 8. Admin Backend Audit

| Admin Feature | Target Endpoint | Status | Operational Evaluation |
|---|---|---|---|
| **Admin Authentication** | `AdminAuthProtect` | **COMPLETE** | Rejects non-admin tokens with `403 Forbidden`. |
| **Admin Dashboard Stats** | `GET /admin/dashboard` | **COMPLETE** | Aggregates counts across Customer, Restaurant, Rider, Order, revenue, and pending queues. |
| **Customer Directory** | `GET /admin/customers` | **COMPLETE** | Non-paginated, case-insensitive cross-model regex search on name, email, phone. |
| **Customer Detail View** | `GET /admin/customers/:customerId` | **COMPLETE** | Fetches profile, full address book, and complete order history. |
| **Customer Status Toggle** | `PATCH /admin/customers/:customerId/status` | **COMPLETE** | Validates status enum; syncs `isActive: false` on suspension. |
| **Restaurant Directory** | `GET /admin/restaurants` | **COMPLETE** | Status filter (`active`, `inactive`, `blocked`), `isOpen`, city, and regex search. |
| **Restaurant Detail View** | `GET /admin/restaurants/:restaurantId` | **COMPLETE** | Returns restaurant legal KYC, bank details, contact, and menu dishes. |
| **Restaurant Status Control** | `PATCH /admin/restaurants/:restaurantId/status` | **COMPLETE** | Validates enum; automatically sets `isOpen = false` if deactivated or blocked. |
| **Restaurant Order Audit** | `GET /admin/restaurants/:restaurantId/orders` | **COMPLETE** | Returns all orders processed by the kitchen with customer & rider details. |
| **Rider Directory** | `GET /admin/riders` | **COMPLETE** | Filters by approval status, availability, vehicle number, and city search. |
| **Rider Detail View** | `GET /admin/riders/:riderId` | **COMPLETE** | Inspects KYC driving license, RC, PAN, insurance, live coordinates, and active delivery load. |
| **Rider Status Control** | `PATCH /admin/riders/:riderId/status` | **COMPLETE** | Approves (`active`), disables, or blocks rider; turns off `isAvailable` if blocked. |
| **Rider Order Audit** | `GET /admin/riders/:riderId/orders` | **COMPLETE** | Returns complete delivery history for specific rider. |
| **Rider Earnings Audit** | `GET /admin/riders/:riderId/earnings` | **COMPLETE** | Calculates lifetime and today's delivery fee earnings at ₹40/delivered order. |
| **Live Order Stream** | `GET /admin/orders` | **COMPLETE** | Filters by status, date range (`startDate`, `endDate`), restaurant, customer, and rider. |
| **Order 360° Inspection** | `GET /admin/orders/:orderId` | **COMPLETE** | Deeply populated with customer, restaurant legal info, rider, and bill breakdowns. |
| **Manual Rider Assignment** | `PATCH /admin/orders/:orderId/assign-rider` | **COMPLETE** | Validates order state in `["ready", "accepted", "preparing"]` and rider `status === "active"`. |
| **Emergency Status Override** | `PATCH /admin/orders/:orderId/status` | **COMPLETE** | Overrides order status, payment status, and logs cancellation reason. |
| **Financial Summary API** | `/admin/finance/summary` | **MISSING** | Documented in architecture guide, but not yet implemented as a standalone route. |
| **Transaction History API** | `/admin/finance/transactions` | **MISSING** | Documented in architecture guide, but not yet implemented as a standalone route. |

---

## 9. Rider Backend Audit

| Feature | Route | Status | Analysis |
|---|---|---|---|
| **Rider Profile View** | `GET /rider/profile` | **COMPLETE** | Populates user identity (excluding password) and rider metadata. |
| **Rider Profile Update** | `PUT /rider/profile` | **COMPLETE** | Updates vehicle details, address, and bank information. |
| **KYC Document Upload** | `PUT /rider/upload-documents` | **COMPLETE** | Uploads driving license, RC, insurance, Aadhar, and PAN to Cloudinary. |
| **Availability Toggle** | `PATCH /rider/toggle-availability` | **COMPLETE** | Enforces that only riders with `status === "active"` can go online. |
| **Location Update** | `PATCH /rider/location` | **COMPLETE** | Updates latitude and longitude strings. |
| **Rider Dashboard** | `GET /rider/dashboard` | **COMPLETE** | Tallies active orders, today's deliveries, lifetime deliveries, and ₹40 earnings. |
| **Rider Earnings View** | `GET /rider/earnings` | **COMPLETE** | Provides weekly, daily, and total earnings with transaction history. |
| **Assigned Orders List** | `GET /rider/orders` | **COMPLETE** | Filters by `?status=active|completed|all`. |
| **Assigned Order Details** | `GET /rider/orders/:orderId` | **COMPLETE** | Enforces ownership check (`riderId: rider._id`). |
| **Accept Assigned Order** | `PATCH /rider/orders/:orderId/accept` | **PARTIAL** | Validates order is in `["ready", "accepted"]`, but does not alter database state. |
| **Pickup Order** | `PATCH /rider/orders/:orderId/pickup` | **COMPLETE** | Validates state in `["ready", "accepted"]` ➔ updates `orderStatus = "pickedUp"`. |
| **Out For Delivery** | `PATCH /rider/orders/:orderId/out-for-delivery` | **COMPLETE** | Validates state is `"pickedUp"` ➔ updates `orderStatus = "outForDelivery"`. |
| **Deliver Order** | `PATCH /rider/orders/:orderId/deliver` | **COMPLETE** | Validates state is `"outForDelivery"` ➔ updates `orderStatus = "delivered"`. |
| **Mark Undeliverable** | `PATCH /rider/orders/:orderId/undeliverable` | **MISSING** | Documented in workflow specifications, but not yet implemented. |

---

## 10. Customer Backend Audit

| Feature | Route | Status | Analysis |
|---|---|---|---|
| **Address Book Lookup** | `GET /customer/address-book` | **COMPLETE** | Returns saved addresses array from Customer document. |
| **Add Address** | `POST /customer/address-book` | **COMPLETE** | Validates required fields, manages `isDefault` flag across addresses. |
| **Update Address** | `PUT /customer/address-book/:addressId` | **COMPLETE** | Updates specific subdocument in `addressBook`. |
| **Delete Address** | `DELETE /customer/address-book/:addressId` | **COMPLETE** | Removes subdocument safely. |
| **Order History** | `GET /customer/all-orders` | **PARTIAL** | Fetches orders by `customerId: customer._id`, but does NOT populate restaurant or item images, and lacks pagination. |
| **Single Order Detail** | `GET /customer/orders/:orderId` | **MISSING** | No customer endpoint to view deep order breakdown or track delivery status. |
| **Cancel Order** | `PATCH /customer/orders/:orderId/cancel` | **MISSING** | No customer endpoint to cancel an order before kitchen acceptance. |

---

## 11. Restaurant Backend Audit

| Feature | Route | Status | Analysis |
|---|---|---|---|
| **Update Basic Info** | `PUT /restaurant/update-restaurant-info` | **COMPLETE** | Upserts restaurant info and serving hours. |
| **Fetch Restaurant Data** | `GET /restaurant/get-restaurant-data` | **PARTIAL** | Requires redundant `req.query.id`. |
| **Toggle Store Open/Closed** | `PATCH /restaurant/change-open-status/:openStatus` | **COMPLETE** | Updates `isOpen`. |
| **Legal KYC Info** | `PUT /restaurant/update-legal-info` | **COMPLETE** | Updates legal name and entity type. |
| **Address & Geo-Coordinates**| `PUT /restaurant/update-address` | **COMPLETE** | Updates physical location and GPS coordinates. |
| **Banking & Certificates** | `PUT /restaurant/update-banking-documents` | **COMPLETE** | Updates bank info, GST, FSSAI, PAN URLs. |
| **Social Links** | `PUT /restaurant/update-social-media-links` | **COMPLETE** | Updates social media array. |
| **Cover Photo** | `PUT /restaurant/update-cover-photo` | **COMPLETE** | Cloudinary upload + old asset deletion. |
| **Gallery Photos** | `PUT /restaurant/update-restaurant-images` | **COMPLETE** | Multi-image upload to Cloudinary. |
| **Add Menu Item** | `POST /restaurant/add-menu-item` | **COMPLETE** | Uploads dish photo, appends to `Menu`. |
| **Get Menu Items** | `GET /restaurant/menu-items` | **COMPLETE** | Fetches active menu items (`isDeleted !== true`). |
| **Edit Menu Item** | `PUT /restaurant/menu-item/:itemId` | **MISSING ROUTE** | Method `RestaurantUpdateMenuItem` is implemented in controller but NOT registered in router. |
| **Update Item Status** | `PATCH /restaurant/menu-item/:itemId/status` | **COMPLETE** | Toggles `available`, `unavailable`, `discontinued`. |
| **Toggle Item Badges** | `PATCH /restaurant/menu-item/:itemId/control` | **COMPLETE** | Toggles `isTopRated`, `isRecommended`, `isNew`. |
| **Delete Menu Item** | `DELETE /restaurant/menu-item/:itemId` | **COMPLETE** | Soft-deletes item (`isDeleted = true`). |
| **Kitchen Incoming Orders** | `GET /restaurant/orders` | **CRITICAL MISSING** | **No endpoint exists for kitchen managers to view live orders!** |
| **Kitchen Accept Order** | `PATCH /restaurant/orders/:orderId/accept` | **CRITICAL MISSING** | **No endpoint exists for kitchen to accept order.** |
| **Kitchen Start Preparing** | `PATCH /restaurant/orders/:orderId/preparing` | **CRITICAL MISSING** | **No endpoint exists to transition order to `preparing`.** |
| **Kitchen Mark Ready** | `PATCH /restaurant/orders/:orderId/ready` | **CRITICAL MISSING** | **No endpoint exists to transition order to `ready`.** |

---

## 12. Order Lifecycle Audit

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     ACTUAL IMPLEMENTED LIFECYCLE                                  │
├───────────────┬───────────────────────────────┬──────────────────────────────┬────────────────────┤
│ STATUS        │ TRIGGERED BY                  │ ENDPOINT                     │ IMPLEMENTATION GAP │
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ pending       │ Customer creates order        │ POST /order/create-order/:id │ Fully functional   │
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ accepted      │ Razorpay payment verification │ POST /payment/verify         │ Fully functional   │
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ preparing     │ Kitchen starts cooking        │ [NO RESTAURANT ENDPOINT]     │ **GAP**: Admin only│
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ ready         │ Kitchen finishes cooking      │ [NO RESTAURANT ENDPOINT]     │ **GAP**: Admin only│
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ (Assigned)    │ Admin assigns rider           │ PATCH /admin/orders/:id/...  │ Fully functional   │
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ pickedUp      │ Rider collects from kitchen   │ PATCH /rider/orders/:id/...  │ Fully functional   │
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ outForDelivery│ Rider starts journey          │ PATCH /rider/orders/:id/...  │ Fully functional   │
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ delivered     │ Rider completes dropoff       │ PATCH /rider/orders/:id/...  │ Fully functional   │
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ undeliverable │ Rider cannot deliver          │ [NO RIDER ENDPOINT]          │ **GAP**: Admin only│
├───────────────┼───────────────────────────────┼──────────────────────────────┼────────────────────┤
│ cancelled     │ Customer/Admin cancel         │ PATCH /admin/orders/:id/...  │ Customer cannot    │
└───────────────┴───────────────────────────────┴──────────────────────────────┴────────────────────┘
```

### Critical Gap in the Lifecycle:
Currently, when a customer pays for an order, it enters `accepted` status. **There is no controller in `restaurant.controller.js` for the restaurant manager to accept the order, start preparation (`preparing`), or mark it as packed (`ready`).** Unless an Administrator manually invokes `PATCH /admin/orders/:orderId/status` to change the status to `ready`, the order gets stuck, and the Admin cannot assign a rider through `AssignRiderToOrder` (which expects status in `["ready", "accepted", "preparing"]`).

---

## 13. Payment Audit

### Razorpay Integration Verification:
1. **Order Creation (`POST /payment/create-order`)**:
   - Multiplies `order.billDetails.finalAmount * 100` to convert INR to paise.
   - Validates that `paymentStatus !== "completed"` to prevent duplicate charges.
   - Binds `razorpayOrderId` to `order.paymentDetails.razorpayOrderId`.
2. **Cryptographic HMAC-SHA256 Signature Verification (`POST /payment/verify`)**:
   - Reconstructs expected signature using `crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex")`.
   - On signature failure: sets `paymentStatus = "failed"`, `orderStatus = "failed"`, returns `400 Bad Request`.
   - On signature success: sets `paymentStatus = "completed"`, records `paidAt`, transitions `orderStatus = "accepted"`.
3. **Bill Computation in `CreateOrder`**:
   - `totalAmount` = $\sum(\text{itemPrice} \times \text{quantity})$
   - `platformFee` = ₹5.00
   - `convenienceFee` = ₹5.00
   - `deliveryCharge` = ₹0.00
   - `taxAmount` = $\text{totalAmount} \times 0.05$ (5% GST)
   - `finalAmount` = $\text{totalAmount} + \text{platformFee} + \text{convenienceFee} + \text{deliveryCharge} + \text{taxAmount} - \text{discountAmount}$

---

## 14. Earnings & Revenue Audit

### Revenue Breakdown Discrepancy:
* **Customer Bill**:
  - Customer pays `finalAmount` comprising subtotal + taxes + ₹10 platform/convenience fees.
  - `deliveryCharge` is hardcoded to ₹0 in [order.controller.js:89](file:///d:/cravings_original/server/src/controller/order.controller.js#L89).
* **Rider Earnings**:
  - Rider is credited a hardcoded `DELIVERY_FEE = 40` (₹40.00) per delivered order in [rider.controller.js:310](file:///d:/cravings_original/server/src/controller/rider.controller.js#L310) and [admin.controller.js:634](file:///d:/cravings_original/server/src/controller/admin.controller.js#L634).
  - **Financial Inconsistency**: Because the customer was charged ₹0 for delivery, the platform absorbs the ₹40 rider delivery payout entirely from platform margin, but the platform fee is only ₹10 (₹5 platform + ₹5 convenience). This creates a negative unit economics model (Platform loses ₹30 per order).
* **Source of Truth**:
  - There is no `Wallet` or `Transaction` ledger collection. Earnings are calculated on-the-fly via `Order.find({ riderId, orderStatus: "delivered" }).length * 40`.
  - Hardcoded `DELIVERY_FEE = 40` works for early MVP stages, but needs a dedicated configuration/pricing table for dynamic distance-based pricing.

---

## 15. Security Audit

| Severity | Vulnerability Description | Location | Impact |
|---|---|---|---|
| **CRITICAL** | **Password Hash Leakage to Public API** | [public.controller.js:46-51](file:///d:/cravings_original/server/src/controller/public.controller.js#L46-L51) | Any unauthenticated user calling `GET /public/restaurant-detail/:restaurantId` receives the restaurant manager's full User record with bcrypt password hash. |
| **CRITICAL** | **Account / Profile Takeover Flaw** | [common.controller.js:18](file:///d:/cravings_original/server/src/controller/common.controller.js#L18) | `EditUserProfile` queries `User.findOne({ email: req.body.email })` instead of `req.user._id`. Any authenticated user can modify other users' profiles. |
| **CRITICAL** | **Password Hash Leakage on Login & Profile Edit** | [auth.controller.js:92](file:///d:/cravings_original/server/src/controller/auth.controller.js#L92), [common.controller.js:52](file:///d:/cravings_original/server/src/controller/common.controller.js#L52) | Returns `data: existingUser` without stripping the `password` field. |
| **HIGH** | **Missing Customer Role Authorization Guard** | [customer.route.js](file:///d:/cravings_original/server/src/router/customer.route.js), [order.route.js](file:///d:/cravings_original/server/src/router/order.route.js) | Uses `AuthProtect` (authenticates any role). Non-customer users can manage customer address books. |
| **MEDIUM** | **Logout Cookie Case-Sensitivity Failure** | [auth.controller.js:102](file:///d:/cravings_original/server/src/controller/auth.controller.js#L102) | `res.clearCookie("Oreo")` does not clear `res.cookie("oreo")`, leaving the session cookie active in browser. |
| **MEDIUM** | **Unhandled Server Crash in JWT Helper** | [auth.service.js:20](file:///d:/cravings_original/server/src/utils/auth.service.js#L20) | `throw next(error)` in `genToken` causes `ReferenceError: next is not defined` if token generation errors. |
| **MEDIUM** | **Hanging Requests on Error (`next()` without `error`)** | `auth.controller.js:96,107`, `common.controller.js:55,100` | Calling `next()` with no argument skips the Express error handler and leaves connections hanging. |
| **LOW** | **ReDoS Risk via Raw String in `RegExp`** | `admin.controller.js`, `rider.controller.js` | Unescaped user inputs passed to `new RegExp(search, "i")` can cause high CPU usage with regex payload injection. |

---

## 16. Validation & Error Handling Audit

### Validation Strengths:
* Controllers rigorously check for existence of required body fields and return `400 Bad Request`.
* Status update endpoints validate against Mongoose enum arrays (`allowedStatuses.includes(status)`).
* Payment verification validates all 4 Razorpay payload parameters and verifies HMAC digests.

### Validation Deficiencies:
* **ObjectId Validation**: Parameters (`:customerId`, `:restaurantId`, `:riderId`, `:orderId`) are rarely checked with `mongoose.Types.ObjectId.isValid(id)`. An invalid string length triggers Mongoose `CastError` (500) rather than a clean 400 Bad Request.
* **Global Error Handler**:
  - Located in [index.js:43-48](file:///d:/cravings_original/server/index.js#L43-L48):
    ```javascript
    app.use((err, req, res, next) => {
      const ErrMessage = err.message || "Internal Server Error";
      const ErrStausCode = err.statusCode || 500;
      res.status(ErrStausCode).json({ message: ErrMessage });
    });
    ```
  - Clean and centralized, but does not capture Mongoose `CastError` or `ValidationError` codes automatically.

---

## 17. Duplicate Functionality

| Redundant Implementation | Superior Implementation | Recommended Action |
|---|---|---|
| `GetRiderEarnings` in `rider.controller.js` vs `admin.controller.js` | Both compute `deliveredOrders.length * 40`. | Legitimate duplication across different role domains (Rider self-service vs Admin supervisory audit). Retain both. |
| `GetAllRestaurants` in `public.controller.js` vs `admin.controller.js` | `admin.controller.js` is much richer (includes status/city/open filters and search). | Update `public.controller.js` to only return active and open restaurants (`{ status: "active", isOpen: true }`). |
| `GetRestaurantDetails` in `public.controller.js` vs `admin.controller.js` | `admin.controller.js` is clean and does not expose passwords. | Sanitize `public.controller.js` to use `.select("-password")` on `managerId`. |

---

## 18. Missing Backend Functionality

### 1. REQUIRED (Essential for Core Food Delivery Operations)
1. **Restaurant Kitchen Order Management**:
   - `GET /restaurant/orders` (View orders placed at this restaurant).
   - `PATCH /restaurant/orders/:orderId/accept` (Accept order from customer).
   - `PATCH /restaurant/orders/:orderId/preparing` (Mark food as being prepared).
   - `PATCH /restaurant/orders/:orderId/ready` (Mark food ready for rider pickup).
2. **Customer Order Details & Tracking**:
   - `GET /customer/orders/:orderId` (Inspect single order details, populated items, restaurant details, and delivery progress).
3. **Rider Undeliverable Handling**:
   - `PATCH /rider/orders/:orderId/undeliverable` (Mark order undeliverable with a reason).
4. **Mounting `RestaurantUpdateMenuItem`**:
   - Route `PUT /restaurant/menu-item/:itemId` needs to be registered in `restaurant.route.js`.

### 2. RECOMMENDED (Production Stability & Security)
1. **`CustomerAuthProtect` Middleware**: Ensure customer and checkout endpoints are strictly accessible by users with `userType === "customer"`.
2. **Password Sanitization**: Add `.select("-password")` or `delete user.password` on `LoginUser`, `EditUserProfile`, and `public.controller.js`.
3. **Fix `EditUserProfile` Profile Hijack**: Change query to `User.findById(req.user._id)`.
4. **Fix `LogoutUser` Cookie Name**: Change `res.clearCookie("Oreo")` to `res.clearCookie("oreo")`.
5. **Add `order.cancellationReason` to `orderSchema`**: Prevents Mongoose from discarding cancellation reasons.

### 3. OPTIONAL (Future Enhancements)
1. Standalone `/admin/finance/summary` and `/admin/finance/transactions` endpoints.
2. MongoDB TTL index on `OTP.expiresAt`.
3. MongoDB 2dsphere indexes on `Rider.currentLocation` and `Restaurant.geoLocation`.

---

## 19. Documentation Mismatches

| Documented Spec | Actual Codebase Implementation | Discrepancy Details |
|---|---|---|
| `PUT /restaurant/menu-item/:itemId` | Method `RestaurantUpdateMenuItem` exists in `restaurant.controller.js:654` | **Route Missing**: Not mounted in `restaurant.route.js`. |
| `PATCH /rider/orders/:orderId/undeliverable` | Documented in `admin-rider-backend-documentation.md` | **Not Implemented**: Controller & route do not exist in `rider.controller.js`. |
| `GET /admin/finance/summary` | Documented in Section 12 of Admin Guide | **Not Implemented**: Finance controller exists conceptually, but is not separated into a route. |
| `Order.ref` in `order.model.js:6` | `ref: "restaurant"` | **Fixed**: Previously was misspelled as `"restauarnt"`. |
| `itemPrice` in `order.model.js` | Schema defines `type: String`, controller uses `Number` | **Type Inconsistency**: Price stored as string in Order items vs Number in Menu items. |

---

## 20. Critical Issues (P0)

1. **Manager Password Hash Exposure**:
   - In `public.controller.js:46-51`, `GetRestaurantDetails` populates `managerId` without `.select("-password")`. The manager's bcrypt hash is returned to any unauthenticated caller.
2. **Arbitrary User Profile Takeover**:
   - In `common.controller.js:18`, `EditUserProfile` looks up the user using `email` from `req.body` rather than `req.user._id`. An attacker can edit another user's name, phone, and avatar.
3. **Broken Restaurant Order Lifecycle**:
   - No kitchen order management endpoints exist. Restaurant managers cannot view orders, accept them, or mark them `preparing` / `ready`.

---

## 21. High Priority Issues (P1)

1. **Password Hash Returned in Login & Profile Update Responses**:
   - `auth.controller.js:92` and `common.controller.js:52` return `data: existingUser` containing the password hash.
2. **Missing Customer Order Detail Endpoint**:
   - Customer has `GET /customer/all-orders`, but no `GET /customer/orders/:orderId` to view a single order's live tracking and breakdown.
3. **Missing `CustomerAuthProtect`**:
   - Non-customer accounts can access customer address book APIs.
4. **Mongoose Schema Discarding `cancellationReason`**:
   - `Order` schema does not define `cancellationReason`, so admin cancellation notes are lost upon save.

---

## 22. Medium Priority Issues (P2)

1. **Logout Cookie Casing Bug**:
   - `auth.controller.js:102` calls `res.clearCookie("Oreo")` instead of `"oreo"`.
2. **Crash in `genToken` Error Path**:
   - `auth.service.js:20` executes `throw next(error)` where `next` is undefined.
3. **Empty `next()` Error Handling**:
   - Several catch blocks call `next()` instead of `next(error)`.
4. **Unregistered `RestaurantUpdateMenuItem` Route**:
   - `restaurant.controller.js` has the edit menu item controller, but it is not plugged into Express router.

---

## 23. Low Priority Issues (P3)

1. **Mongoose Reserved Keyword Warning**:
   - `isNew` in `menu.model.js:87` triggers schema warnings.
2. **Hardcoded 3-Second Delay**:
   - `UpdateUserPassword` in `common.controller.js:95` has `await new Promise((resolve) => setTimeout(resolve, 3000));`.
3. **Missing TTL Index on OTP**:
   - Expired OTP documents stay in MongoDB until overwritten.

---

## 24. Recommended Next Steps

```
Phase 1: Security & Stability (Immediate)
├─ 1. Strip password hashes from public.controller.js, auth.controller.js, common.controller.js.
├─ 2. Fix EditUserProfile to update req.user._id instead of User.findOne({ email }).
├─ 3. Fix LogoutUser cookie casing to res.clearCookie("oreo").
└─ 4. Add CustomerAuthProtect to customer.route.js and order.route.js.

Phase 2: Kitchen & Customer Lifecycle Completion
├─ 1. Create Restaurant Order Controllers:
│     ├─ GetRestaurantOrders (GET /restaurant/orders)
│     ├─ AcceptRestaurantOrder (PATCH /restaurant/orders/:orderId/accept)
│     ├─ PrepareRestaurantOrder (PATCH /restaurant/orders/:orderId/prepare)
│     └─ ReadyRestaurantOrder (PATCH /restaurant/orders/:orderId/ready)
├─ 2. Mount PUT /restaurant/menu-item/:itemId in restaurant.route.js.
├─ 3. Create GetCustomerOrderDetails (GET /customer/orders/:orderId).
└─ 4. Create MarkOrderUndeliverable in rider.controller.js.

Phase 3: Schema Cleanup
├─ 1. Add cancellationReason to order.model.js.
├─ 2. Change isNew to isNewItem in menu.model.js.
└─ 3. Add TTL index to OTP schema ({ expiresAt: 1 }, { expireAfterSeconds: 0 }).
```

---

## 25. Backend Completion Score

| Subsystem / Layer | Completeness Weight | Completion % | Weighted Score |
|---|---|---|---|
| **Authentication & Tokens** | 10% | 85% | 8.5% |
| **Admin Subsystem** | 15% | 95% | 14.25% |
| **Rider Subsystem** | 15% | 92% | 13.8% |
| **Customer Subsystem** | 10% | 75% | 7.5% |
| **Restaurant Subsystem** | 15% | 68% | 10.2% |
| **Order Engine & Lifecycle** | 15% | 70% | 10.5% |
| **Payment & Razorpay** | 10% | 95% | 9.5% |
| **Security & Privacy** | 10% | 65% | 6.5% |
| **TOTAL ESTIMATED COMPLETION** | **100%** | — | **80.75%** |

---

## 26. Final Verdict

### **"BACKEND MOSTLY COMPLETE — SOME ITEMS REMAIN"**

### Exact Rationale:
* **What is strong & complete**: The Admin supervisory backend (17 endpoints), Rider logistics flow (12 endpoints), Razorpay HMAC-SHA256 payment verification, Multer-to-Cloudinary media processing, and customer address book CRUD are fully implemented and architecturally sound.
* **Why it is not 100% complete**:
  1. The **Restaurant Kitchen Order Workflow** is missing—restaurants have no API to receive, accept, cook (`preparing`), or pack (`ready`) orders.
  2. Four **critical security flaws** (password hash exposure in 3 controllers and an arbitrary profile hijacking flaw in `EditUserProfile`) must be remediated.
  3. Minor lifecycle gaps remain (Customer single-order tracking, Rider undeliverable action, unrouted `RestaurantUpdateMenuItem`).
