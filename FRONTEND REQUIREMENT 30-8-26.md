# FRONTEND REQUIREMENT & ARCHITECTURE SPECIFICATION
**Date:** 30-08-2026  
**Project:** Cravings Food-Ordering Platform (Full-Stack Analysis & Frontend Blueprint)

---

## 1. CURRENT FRONTEND STRUCTURE

### 1.1 Existing Directory Tree
```text
client/src/
├── App.css
├── App.jsx
├── index.css
├── main.jsx
├── assets/
│   ├── NoDataFound.gif
│   ├── runningLoader.gif
│   ├── Samplerestaurant.jpg
│   └── carousel/
│       └── bgImage1.jpg
├── config/
│   └── ApiConfig.jsx
├── context/
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── OrderNow.jsx
│   ├── Register.jsx
│   ├── RestaurantDetailsPage.jsx
│   └── dashboard/
│       ├── AdminDashboard.jsx
│       ├── CustomerDashboard.jsx
│       ├── RestaurantDashboard.jsx
│       └── RiderDashboard.jsx
└── components/
    ├── Cart.jsx
    ├── Footer.jsx
    ├── Loader.jsx
    ├── Navbar.jsx
    ├── NoDataFound.jsx
    ├── adminDashboard/
    │   ├── AdminOrders.jsx
    │   ├── AdminOverview.jsx
    │   ├── AdminSettings.jsx
    │   └── AdminSidebar.jsx
    ├── commonModals/
    │   ├── ForgotPasswordModal.jsx
    │   └── PasswordChangeModal.jsx
    ├── customerDashboard/
    │   ├── CustomerOrders.jsx
    │   ├── CustomerOverview.jsx
    │   ├── CustomerSetting.jsx
    │   └── CustomerSidebar.jsx
    ├── publicRestaurantDetails/
    │   ├── MenuItemCard.jsx
    │   ├── RestaurantAbout.jsx
    │   ├── RestaurantContact.jsx
    │   ├── RestaurantGallery.jsx
    │   ├── RestaurantHero.jsx
    │   ├── RestaurantInfoStrip.jsx
    │   ├── RestaurantMenu.jsx
    │   ├── RestaurantSocialLinks.jsx
    │   └── helpers.jsx
    ├── restaurantDashboard/
    │   ├── NoDataFound.jsx
    │   ├── RestaurantMenu.jsx
    │   ├── RestaurantOrders.jsx
    │   ├── RestaurantOverview.jsx
    │   ├── RestaurantSettings.jsx
    │   ├── RestaurantSidebar.jsx
    │   ├── menuItems/
    │   │   ├── AddNewItemModal.jsx
    │   │   ├── ConfirmModal.jsx
    │   │   └── EditOrViewItem.jsx
    │   └── settings/
    │       ├── RestaurantPhotos.jsx
    │       ├── coreDetails/
    │       │   ├── Index.jsx
    │       │   ├── RestaurantAddress.jsx
    │       │   ├── RestaurantBankingDocument.jsx
    │       │   └── RestaurantSocialMediaLinks.jsx
    │       └── restaurantInformation/
    │           ├── Index.jsx
    │           ├── LegalInformation.jsx
    │           ├── PersonalInformation.jsx
    │           └── RestaurantInformation.jsx
    └── riderDashboard/
        ├── RiderOrders.jsx
        ├── RiderOverview.jsx
        ├── RiderSettings.jsx
        └── RiderSidebar.jsx
```

### 1.2 Description of Existing Folders and Components
- **`config/ApiConfig.jsx`**: Axios instance configured with `baseURL` (`http://localhost:4500` default) and `withCredentials: true`.
- **`context/AuthContext.jsx`**: Manages current user state (`user`, `isLogin`, `role`) persisted in `sessionStorage` under `cravingUser`.
- **`context/CartContext.jsx`**: Manages cart state (`restaurantId`, `restaurantName`, `items`), item operations (`addItem`, `increaseItem`, `decreaseItem`, `removeItem`, `clearCart`, `replaceCart`), auto-sync for missing prices, and `localStorage` persistence under `cravings_cart`.
- **`pages/OrderNow.jsx`**: Public browsing page listing active restaurants fetched from `GET /public/restaurants` with search, cuisine, and food type filters.
- **`pages/RestaurantDetailsPage.jsx`**: Restaurant storefront page fetching restaurant profile, menu, and gallery from `GET /public/restaurant-detail/:id`.
- **`components/Cart.jsx`**: Full cart interface calculating item totals, handling Razorpay checkout SDK integration, creating orders via `POST /order/create-order/:restaurantId`, and verifying payments via `POST /payment/verify`.
- **`pages/dashboard/*`**: Container pages with sidebar navigation tabs for four user roles: Customer, Restaurant, Rider, and Admin.
- **`components/commonModals/*`**: Modals for OTP verification/password reset (`ForgotPasswordModal.jsx`) and authenticated password update (`PasswordChangeModal.jsx`).
- **`components/Navbar.jsx` / `Footer.jsx`**: Currently simple placeholder stubs (`<div>Navbar</div>`, `<div>Footer</div>`).
- **`pages/Home.jsx`**: Incomplete stub with broken imports not routed in `App.jsx`.
- **`components/*Dashboard/*Orders.jsx` & `*Overview.jsx`**: Stub components (`<div>CustomerOrders</div>`, `<div>RiderOrders</div>`, `<div>RestaurantOrders</div>`, `<div>AdminOrders</div>`) that do not yet consume backend order or overview stats APIs.

---

## 2. BACKEND API INVENTORY

All backend routes mounted in `server/index.js`:

| Method | API Endpoint | Role / Auth Protection | Purpose | Existing / Target Frontend Page |
|---|---|---|---|---|
| **GET** | `/` | Public | Server welcome message / health check | None (Backend Diagnostic) |
| **POST** | `/auth/register` | Public | User registration (`customer`, `restaurant`, `rider`) | `Register.jsx` |
| **POST** | `/auth/login` | Public | User authentication with cookie session (`oreo`) | `Login.jsx` |
| **GET** | `/auth/logout` | Public / Authenticated | Clear session cookie (`oreo`) | `Navbar.jsx` / Any Page |
| **POST** | `/auth/send-otp` | Public | Send 6-digit OTP to email for password reset | `ForgotPasswordModal.jsx` |
| **POST** | `/auth/verify-otp` | Public | Verify OTP and set temporary cookie (`kitkat`) | `ForgotPasswordModal.jsx` |
| **POST** | `/auth/reset-password` | OTP Cookie (`kitkat`) | Reset account password | `ForgotPasswordModal.jsx` |
| **POST** | `/public/contact-us` | Public | Submit contact form feedback/inquiry | `ContactPage.jsx` / `Footer.jsx` |
| **GET** | `/public/restaurants` | Public | Fetch all active restaurants with details & images | `OrderNow.jsx` & `Home.jsx` |
| **GET** | `/public/restaurant-detail/:restaurantId` | Public | Fetch single restaurant profile + menu items | `RestaurantDetailsPage.jsx` |
| **PUT** | `/common/edit-profile` | Authenticated (`AuthProtect`) | Update user profile (`fullName`, `email`, `phone`, `displayPic`) | `CustomerSetting.jsx`, `RestaurantSettings.jsx`, `RiderSettings.jsx`, `AdminSettings.jsx` |
| **PATCH** | `/common/change-password` | Authenticated (`AuthProtect`) | Update user password (`oldPassword`, `newPassword`) | `PasswordChangeModal.jsx` |
| **GET** | `/customer/address-book` | Customer (`CustomerAuthProtect`) | Fetch saved delivery addresses | `CustomerAddressBook.jsx` / `CustomerSetting.jsx` / `CheckoutPage.jsx` |
| **POST** | `/customer/address-book` | Customer (`CustomerAuthProtect`) | Add new address to address book | `CustomerAddressBook.jsx` / `AddressModal.jsx` |
| **PUT** | `/customer/address-book/:addressId` | Customer (`CustomerAuthProtect`) | Edit existing address | `CustomerAddressBook.jsx` / `AddressModal.jsx` |
| **DELETE** | `/customer/address-book/:addressId` | Customer (`CustomerAuthProtect`) | Delete address from address book | `CustomerAddressBook.jsx` |
| **GET** | `/customer/all-orders` | Customer (`CustomerAuthProtect`) | Fetch customer order history with status & items | `CustomerOrders.jsx` |
| **GET** | `/customer/orders/:orderId` | Customer (`CustomerAuthProtect`) | Fetch single order details with live status & rider | `OrderTrackingPage.jsx` / `CustomerOrderDetailsModal.jsx` |
| **POST** | `/order/create-order/:restaurantId` | Customer (`CustomerAuthProtect`) | Create pending food order from cart | `Cart.jsx` / `CheckoutPage.jsx` |
| **POST** | `/payment/create-order` | Authenticated (`AuthProtect`) | Generate Razorpay order ID & amount in paise | `Cart.jsx` / `CheckoutPage.jsx` |
| **POST** | `/payment/verify` | Authenticated (`AuthProtect`) | Verify Razorpay payment signature & update order | `Cart.jsx` / `CheckoutPage.jsx` |
| **GET** | `/restaurant/get-restaurant-data` | Restaurant (`RestaurantAuthProtect`) | Fetch restaurant manager's full profile, KYC, and settings | `RestaurantDashboard.jsx` & settings tabs |
| **PUT** | `/restaurant/update-restaurant-info` | Restaurant (`RestaurantAuthProtect`) | Update restaurant general information | `RestaurantInformation.jsx` |
| **PATCH** | `/restaurant/change-open-status/:openStatus` | Restaurant (`RestaurantAuthProtect`) | Toggle restaurant open/closed status | `RestaurantSidebar.jsx` / `RestaurantOverview.jsx` |
| **PUT** | `/restaurant/update-legal-info` | Restaurant (`RestaurantAuthProtect`) | Update restaurant legal/company details | `LegalInformation.jsx` |
| **PUT** | `/restaurant/update-address` | Restaurant (`RestaurantAuthProtect`) | Update restaurant location & address | `RestaurantAddress.jsx` |
| **PUT** | `/restaurant/update-banking-documents` | Restaurant (`RestaurantAuthProtect`) | Update banking, GST, and PAN details | `RestaurantBankingDocument.jsx` |
| **PUT** | `/restaurant/update-social-media-links` | Restaurant (`RestaurantAuthProtect`) | Update restaurant social profile links | `RestaurantSocialMediaLinks.jsx` |
| **PUT** | `/restaurant/update-cover-photo` | Restaurant (`RestaurantAuthProtect`) | Upload/update restaurant hero cover image | `RestaurantPhotos.jsx` |
| **PUT** | `/restaurant/update-restaurant-images` | Restaurant (`RestaurantAuthProtect`) | Upload gallery photos (up to 8 images) | `RestaurantPhotos.jsx` |
| **POST** | `/restaurant/add-menu-item` | Restaurant (`RestaurantAuthProtect`) | Add new menu item with image upload | `AddNewItemModal.jsx` |
| **GET** | `/restaurant/menu-items` | Restaurant (`RestaurantAuthProtect`) | Fetch restaurant's complete menu catalog | `RestaurantMenu.jsx` (Dashboard) |
| **PUT** | `/restaurant/menu-item/:itemId` | Restaurant (`RestaurantAuthProtect`) | Update dish details & price | `EditOrViewItem.jsx` |
| **PATCH** | `/restaurant/menu-item/:itemId/status` | Restaurant (`RestaurantAuthProtect`) | Change dish availability (`available`, `unavailable`, `discontinued`) | `RestaurantMenu.jsx` |
| **DELETE** | `/restaurant/menu-item/:itemId` | Restaurant (`RestaurantAuthProtect`) | Soft-delete item from menu (`isDeleted: true`) | `RestaurantMenu.jsx` / `ConfirmModal.jsx` |
| **PATCH** | `/restaurant/menu-item/:itemId/control` | Restaurant (`RestaurantAuthProtect`) | Toggle item flags (`isTopRated`, `isRecommended`, `isNew`) | `RestaurantMenu.jsx` |
| **GET** | `/restaurant/orders` | Restaurant (`RestaurantAuthProtect`) | Fetch all orders received by restaurant | `RestaurantOrders.jsx` |
| **PATCH** | `/restaurant/orders/:orderId/accept` | Restaurant (`RestaurantAuthProtect`) | Accept order (`orderStatus: accepted`) | `RestaurantOrders.jsx` |
| **PATCH** | `/restaurant/orders/:orderId/preparing` | Restaurant (`RestaurantAuthProtect`) | Mark order as preparing (`orderStatus: preparing`) | `RestaurantOrders.jsx` |
| **PATCH** | `/restaurant/orders/:orderId/ready` | Restaurant (`RestaurantAuthProtect`) | Mark order as ready for pickup (`orderStatus: ready`) | `RestaurantOrders.jsx` |
| **GET** | `/rider/profile` | Rider (`RiderAuthProtect`) | Fetch rider profile & KYC details | `RiderSettings.jsx` |
| **PUT** | `/rider/profile` | Rider (`RiderAuthProtect`) | Update vehicle details, address, and bank details | `RiderSettings.jsx` |
| **PUT** | `/rider/upload-documents` | Rider (`RiderAuthProtect`) | Upload driving license, RC, insurance, Aadhar, PAN | `RiderSettings.jsx` / `RiderKYCModal.jsx` |
| **PATCH** | `/rider/toggle-availability` | Rider (`RiderAuthProtect`) | Toggle rider online/offline availability | `RiderSidebar.jsx` / `RiderOverview.jsx` |
| **PATCH** | `/rider/location` | Rider (`RiderAuthProtect`) | Update rider GPS coordinates (`lat`, `lon`) | `RiderDashboard.jsx` (Background tracker) |
| **GET** | `/rider/dashboard` | Rider (`RiderAuthProtect`) | Fetch rider summary, active orders, ratings | `RiderOverview.jsx` |
| **GET** | `/rider/earnings` | Rider (`RiderAuthProtect`) | Fetch rider delivery earnings & stats | `RiderEarnings.jsx` / `RiderOverview.jsx` |
| **GET** | `/rider/orders` | Rider (`RiderAuthProtect`) | Fetch assigned active deliveries and delivery history | `RiderOrders.jsx` |
| **GET** | `/rider/orders/:orderId` | Rider (`RiderAuthProtect`) | Fetch single delivery task details | `RiderOrderDetailsModal.jsx` |
| **PATCH** | `/rider/orders/:orderId/accept` | Rider (`RiderAuthProtect`) | Accept assigned delivery | `RiderOrders.jsx` |
| **PATCH** | `/rider/orders/:orderId/pickup` | Rider (`RiderAuthProtect`) | Mark order picked up from restaurant | `RiderOrders.jsx` |
| **PATCH** | `/rider/orders/:orderId/out-for-delivery` | Rider (`RiderAuthProtect`) | Mark order out for delivery to customer | `RiderOrders.jsx` |
| **PATCH** | `/rider/orders/:orderId/deliver` | Rider (`RiderAuthProtect`) | Mark order successfully delivered | `RiderOrders.jsx` |
| **PATCH** | `/rider/orders/:orderId/undeliverable` | Rider (`RiderAuthProtect`) | Mark order undeliverable with reason | `RiderOrders.jsx` |
| **GET** | `/admin/dashboard` | Admin (`AdminAuthProtect`) | Overall platform KPI stats (revenue, orders, users) | `AdminOverview.jsx` |
| **GET** | `/admin/customers` | Admin (`AdminAuthProtect`) | List all customer accounts with status | `AdminCustomers.jsx` |
| **GET** | `/admin/customers/:customerId` | Admin (`AdminAuthProtect`) | Fetch detailed customer profile & orders | `AdminCustomerDetailModal.jsx` |
| **PATCH** | `/admin/customers/:customerId/status` | Admin (`AdminAuthProtect`) | Change customer status (`pending`, `verified`, `suspended`) | `AdminCustomers.jsx` |
| **GET** | `/admin/restaurants` | Admin (`AdminAuthProtect`) | List all restaurant accounts | `AdminRestaurants.jsx` |
| **GET** | `/admin/restaurants/:restaurantId` | Admin (`AdminAuthProtect`) | Fetch single restaurant KYC, legal, and menu details | `AdminRestaurantDetailModal.jsx` |
| **PATCH** | `/admin/restaurants/:restaurantId/status` | Admin (`AdminAuthProtect`) | Approve/reject/suspend restaurant (`active`, `pending`, `suspended`) | `AdminRestaurants.jsx` |
| **GET** | `/admin/restaurants/:restaurantId/orders` | Admin (`AdminAuthProtect`) | Fetch orders belonging to a specific restaurant | `AdminRestaurantOrdersModal.jsx` |
| **GET** | `/admin/riders` | Admin (`AdminAuthProtect`) | List all delivery riders | `AdminRiders.jsx` |
| **GET** | `/admin/riders/:riderId` | Admin (`AdminAuthProtect`) | Fetch rider KYC documents and profile | `AdminRiderDetailModal.jsx` |
| **PATCH** | `/admin/riders/:riderId/status` | Admin (`AdminAuthProtect`) | Verify/block rider (`active`, `pending`, `inactive`, `blocked`) | `AdminRiders.jsx` |
| **GET** | `/admin/riders/:riderId/orders` | Admin (`AdminAuthProtect`) | Fetch deliveries completed by a specific rider | `AdminRiderOrdersModal.jsx` |
| **GET** | `/admin/riders/:riderId/earnings` | Admin (`AdminAuthProtect`) | Fetch payout and earnings records for a rider | `AdminRiderEarningsModal.jsx` |
| **GET** | `/admin/orders` | Admin (`AdminAuthProtect`) | List all system orders across all restaurants | `AdminOrders.jsx` |
| **GET** | `/admin/orders/:orderId` | Admin (`AdminAuthProtect`) | Fetch single order details with customer, restaurant, rider | `AdminOrderDetailModal.jsx` |
| **PATCH** | `/admin/orders/:orderId/assign-rider` | Admin (`AdminAuthProtect`) | Manually assign or reassign rider to an order | `AdminOrders.jsx` |
| **PATCH** | `/admin/orders/:orderId/status` | Admin (`AdminAuthProtect`) | Override order status or record cancellation | `AdminOrders.jsx` |

---

## 3. REQUIRED FRONTEND PAGES

### Public & Shared Pages

- **Page:** `Home.jsx` [MODIFY]
  - **Purpose:** Public landing page featuring brand hero section, popular restaurants, cuisine highlights, and order CTA.
  - **Role:** Public
  - **APIs:** `GET /public/restaurants`

- **Page:** `OrderNow.jsx` [EXISTING]
  - **Purpose:** Public restaurant search and catalog with live filters (veg, non-veg, vegan, jain, cuisines, cities).
  - **Role:** Public / All
  - **APIs:** `GET /public/restaurants`

- **Page:** `RestaurantDetailsPage.jsx` [EXISTING]
  - **Purpose:** Public restaurant storefront with hero banner, details strip, photo gallery, category-filtered menu cards, and bottom cart bar.
  - **Role:** Public / Customer
  - **APIs:** `GET /public/restaurant-detail/:restaurantId`

- **Page:** `ContactPage.jsx` [NEW]
  - **Purpose:** Contact Us form for customer and partner inquiries.
  - **Role:** Public
  - **APIs:** `POST /public/contact-us`

- **Page:** `Login.jsx` [EXISTING]
  - **Purpose:** User login supporting customer, restaurant, rider, and admin roles with cookie session initialization.
  - **Role:** Public
  - **APIs:** `POST /auth/login`

- **Page:** `Register.jsx` [EXISTING]
  - **Purpose:** User registration supporting multiple user types (`customer`, `restaurant`, `rider`).
  - **Role:** Public
  - **APIs:** `POST /auth/register`

- **Page:** `ForgotPasswordModal.jsx` / `PasswordReset` [MODIFY]
  - **Purpose:** OTP-based password recovery flow (Send OTP → Verify OTP → Reset Password).
  - **Role:** Public
  - **APIs:** `POST /auth/send-otp`, `POST /auth/verify-otp`, `POST /auth/reset-password`

---

### Customer Pages

- **Page:** `Cart.jsx` [EXISTING]
  - **Purpose:** Review cart items, adjust quantities, verify restaurant match, initiate order, load Razorpay, and verify checkout payment.
  - **Role:** Customer
  - **APIs:** `POST /order/create-order/:restaurantId`, `POST /payment/create-order`, `POST /payment/verify`

- **Page:** `OrderTrackingPage.jsx` (`/order-tracking/:orderId`) [NEW]
  - **Purpose:** Real-time visual tracking of active order lifecycle (Pending → Accepted → Preparing → Ready → PickedUp → OutForDelivery → Delivered), displaying assigned rider details and delivery address.
  - **Role:** Customer
  - **APIs:** `GET /customer/orders/:orderId`

- **Page:** `CustomerDashboard.jsx` [EXISTING — MODIFY CHILD TABS]
  - **Purpose:** Main portal hosting Overview, Orders, Address Book, and Settings.
  - **Role:** Customer
  - **Child Components / Sub-pages:**
    - **`CustomerOverview.jsx`** [MODIFY - currently stub]: Customer active order summary, quick reorder shortcuts, and account status.
      - **APIs:** `GET /customer/all-orders`, `GET /customer/address-book`
    - **`CustomerOrders.jsx`** [MODIFY - currently stub]: Customer historical and live orders list with status badges, bill breakdown, and "Track Order" navigation.
      - **APIs:** `GET /customer/all-orders`, `GET /customer/orders/:orderId`
    - **`CustomerAddressBook.jsx`** [NEW]: Manage saved home/work/other addresses with GPS coordinates and default address selection.
      - **APIs:** `GET /customer/address-book`, `POST /customer/address-book`, `PUT /customer/address-book/:addressId`, `DELETE /customer/address-book/:addressId`
    - **`CustomerSetting.jsx`** [EXISTING]: Profile info editor (photo, name, phone) and password change trigger.
      - **APIs:** `PUT /common/edit-profile`, `PATCH /common/change-password`

---

### Restaurant Pages

- **Page:** `RestaurantDashboard.jsx` [EXISTING]
  - **Purpose:** Restaurant management portal with open/close switch, order queue, menu catalog, and business settings.
  - **Role:** Restaurant
  - **Child Components / Sub-pages:**
    - **`RestaurantOverview.jsx`** [MODIFY - currently stub]: Live dashboard with metrics (today's orders, revenue, open/closed toggle, pending order count).
      - **APIs:** `GET /restaurant/get-restaurant-data`, `GET /restaurant/orders`, `PATCH /restaurant/change-open-status/:openStatus`
    - **`RestaurantOrders.jsx`** [MODIFY - currently stub]: Order management board with status transition controls: Accept (`PATCH /orders/:id/accept`), Mark Preparing (`PATCH /orders/:id/preparing`), Mark Ready (`PATCH /orders/:id/ready`).
      - **APIs:** `GET /restaurant/orders`, `PATCH /restaurant/orders/:orderId/accept`, `PATCH /restaurant/orders/:orderId/preparing`, `PATCH /restaurant/orders/:orderId/ready`
    - **`RestaurantMenu.jsx`** [EXISTING]: Dish catalog with add, edit, status toggle (`available`/`unavailable`/`discontinued`), control flags (`topRated`, `recommended`, `new`), and soft-delete.
      - **APIs:** `GET /restaurant/menu-items`, `POST /restaurant/add-menu-item`, `PUT /restaurant/menu-item/:itemId`, `PATCH /restaurant/menu-item/:itemId/status`, `DELETE /restaurant/menu-item/:itemId`, `PATCH /restaurant/menu-item/:itemId/control`
    - **`RestaurantSettings.jsx`** [EXISTING]: Business information, legal registration, address, banking documents, cover image, and photo gallery.
      - **APIs:** `GET /restaurant/get-restaurant-data`, `PUT /restaurant/update-restaurant-info`, `PUT /restaurant/update-legal-info`, `PUT /restaurant/update-address`, `PUT /restaurant/update-banking-documents`, `PUT /restaurant/update-social-media-links`, `PUT /restaurant/update-cover-photo`, `PUT /restaurant/update-restaurant-images`, `PUT /common/edit-profile`, `PATCH /common/change-password`

---

### Rider Pages

- **Page:** `RiderDashboard.jsx` [EXISTING]
  - **Purpose:** Rider delivery terminal for managing active deliveries, tracking earnings, updating GPS coordinates, and uploading KYC documents.
  - **Role:** Rider
  - **Child Components / Sub-pages:**
    - **`RiderOverview.jsx`** [MODIFY - currently stub]: Today's delivery count, earnings summary, rating, availability toggle, and quick access to active order.
      - **APIs:** `GET /rider/dashboard`, `PATCH /rider/toggle-availability`, `PATCH /rider/location`
    - **`RiderOrders.jsx`** [MODIFY - currently stub]: Live delivery queue with step-by-step dispatch actions: Accept Assigned (`PATCH /orders/:id/accept`), Pickup (`PATCH /orders/:id/pickup`), Out for Delivery (`PATCH /orders/:id/out-for-delivery`), Deliver (`PATCH /orders/:id/deliver`), Undeliverable (`PATCH /orders/:id/undeliverable`).
      - **APIs:** `GET /rider/orders`, `GET /rider/orders/:orderId`, `PATCH /rider/orders/:orderId/accept`, `PATCH /rider/orders/:orderId/pickup`, `PATCH /rider/orders/:orderId/out-for-delivery`, `PATCH /rider/orders/:orderId/deliver`, `PATCH /rider/orders/:orderId/undeliverable`
    - **`RiderEarnings.jsx`** [NEW]: Comprehensive breakdown of completed deliveries and total earnings.
      - **APIs:** `GET /rider/earnings`
    - **`RiderSettings.jsx`** [EXISTING - MODIFY]: Vehicle details, bank account info, current address, and KYC document uploads.
      - **APIs:** `GET /rider/profile`, `PUT /rider/profile`, `PUT /rider/upload-documents`, `PUT /common/edit-profile`, `PATCH /common/change-password`

---

### Admin Pages

- **Page:** `AdminDashboard.jsx` [EXISTING]
  - **Purpose:** Full administrative console to monitor platform KPIs, manage customers, verify/approve restaurants, verify riders, and manage/reassign orders.
  - **Role:** Admin
  - **Child Components / Sub-pages:**
    - **`AdminOverview.jsx`** [MODIFY - currently stub]: Platform analytics (total users, restaurants, riders, orders, gross revenue).
      - **APIs:** `GET /admin/dashboard`
    - **`AdminCustomers.jsx`** [NEW]: Customer table with search, status filtering, account suspension/activation, and order history view.
      - **APIs:** `GET /admin/customers`, `GET /admin/customers/:customerId`, `PATCH /admin/customers/:customerId/status`
    - **`AdminRestaurants.jsx`** [NEW]: Restaurant table with approval actions (`active`, `pending`, `suspended`), document verification, and restaurant orders view.
      - **APIs:** `GET /admin/restaurants`, `GET /admin/restaurants/:restaurantId`, `PATCH /admin/restaurants/:restaurantId/status`, `GET /admin/restaurants/:restaurantId/orders`
    - **`AdminRiders.jsx`** [NEW]: Rider management with KYC verification, status toggle (`active`, `pending`, `blocked`), orders, and earnings review.
      - **APIs:** `GET /admin/riders`, `GET /admin/riders/:riderId`, `PATCH /admin/riders/:riderId/status`, `GET /admin/riders/:riderId/orders`, `GET /admin/riders/:riderId/earnings`
    - **`AdminOrders.jsx`** [MODIFY - currently stub]: Global order management with live status filters, manual rider assignment (`PATCH /orders/:id/assign-rider`), and status override (`PATCH /orders/:id/status`).
      - **APIs:** `GET /admin/orders`, `GET /admin/orders/:orderId`, `PATCH /admin/orders/:orderId/assign-rider`, `PATCH /admin/orders/:orderId/status`, `GET /admin/riders`
    - **`AdminSettings.jsx`** [EXISTING]: Admin profile and password management.
      - **APIs:** `PUT /common/edit-profile`, `PATCH /common/change-password`

---

## 4. FINAL FRONTEND FOLDER STRUCTURE

```text
client/src/
├── App.jsx                                           [MODIFY] - Add missing routes (/order-tracking/:id, /contact, etc.)
├── main.jsx                                          [EXISTING]
├── App.css                                           [EXISTING]
├── index.css                                         [EXISTING]
├── assets/                                           [EXISTING]
├── config/
│   └── ApiConfig.jsx                                 [EXISTING]
├── context/
│   ├── AuthContext.jsx                               [MODIFY] - Add auth check & login/logout helper methods
│   └── CartContext.jsx                               [EXISTING]
├── routes/
│   ├── ProtectedRoute.jsx                            [NEW] - Role-based route guard component
│   └── PublicRoute.jsx                               [NEW] - Redirect logged-in users away from /login
├── pages/
│   ├── Home.jsx                                      [MODIFY] - Implement full home landing page
│   ├── OrderNow.jsx                                  [EXISTING]
│   ├── RestaurantDetailsPage.jsx                     [EXISTING]
│   ├── ContactPage.jsx                               [NEW] - Contact Us form page
│   ├── OrderTrackingPage.jsx                         [NEW] - Live order status tracking page
│   ├── Login.jsx                                     [EXISTING]
│   ├── Register.jsx                                  [EXISTING]
│   └── dashboard/
│       ├── CustomerDashboard.jsx                     [MODIFY] - Support Overview, Orders, Address Book, Settings
│       ├── RestaurantDashboard.jsx                   [MODIFY] - Support Overview, Orders, Menu, Settings
│       ├── RiderDashboard.jsx                        [MODIFY] - Support Overview, Orders, Earnings, Settings
│       └── AdminDashboard.jsx                        [MODIFY] - Support Overview, Customers, Restaurants, Riders, Orders, Settings
└── components/
    ├── Navbar.jsx                                    [MODIFY] - Implement real navigation bar with role badges & cart count
    ├── Footer.jsx                                    [MODIFY] - Implement brand footer with quick links
    ├── Cart.jsx                                      [EXISTING]
    ├── Loader.jsx                                    [EXISTING]
    ├── NoDataFound.jsx                               [EXISTING]
    ├── commonModals/
    │   ├── ForgotPasswordModal.jsx                   [EXISTING]
    │   └── PasswordChangeModal.jsx                   [EXISTING]
    ├── customerDashboard/
    │   ├── CustomerSidebar.jsx                       [MODIFY] - Add Address Book navigation tab
    │   ├── CustomerOverview.jsx                      [MODIFY] - Connect to customer summary data
    │   ├── CustomerOrders.jsx                        [MODIFY] - Implement order list & item breakdown
    │   ├── CustomerAddressBook.jsx                   [NEW] - Implement address CRUD interface
    │   ├── CustomerAddressModal.jsx                  [NEW] - Modal to add/edit address with coordinates
    │   └── CustomerSetting.jsx                       [EXISTING]
    ├── publicRestaurantDetails/                      [EXISTING - All 9 files intact]
    │   ├── MenuItemCard.jsx
    │   ├── RestaurantAbout.jsx
    │   ├── RestaurantContact.jsx
    │   ├── RestaurantGallery.jsx
    │   ├── RestaurantHero.jsx
    │   ├── RestaurantInfoStrip.jsx
    │   ├── RestaurantMenu.jsx
    │   ├── RestaurantSocialLinks.jsx
    │   └── helpers.jsx
    ├── restaurantDashboard/
    │   ├── RestaurantSidebar.jsx                     [MODIFY] - Add quick status toggle indicator
    │   ├── RestaurantOverview.jsx                    [MODIFY] - Connect to orders/revenue metrics
    │   ├── RestaurantOrders.jsx                      [MODIFY] - Implement Accept/Prepare/Ready order board
    │   ├── RestaurantMenu.jsx                        [EXISTING]
    │   ├── RestaurantSettings.jsx                    [EXISTING]
    │   ├── menuItems/                                [EXISTING - Add/Edit/Confirm modals intact]
    │   │   ├── AddNewItemModal.jsx
    │   │   ├── ConfirmModal.jsx
    │   │   └── EditOrViewItem.jsx
    │   └── settings/                                 [EXISTING - Core details & info intact]
    │       ├── RestaurantPhotos.jsx
    │       ├── coreDetails/
    │       │   ├── Index.jsx
    │       │   ├── RestaurantAddress.jsx
    │       │   ├── RestaurantBankingDocument.jsx
    │       │   └── RestaurantSocialMediaLinks.jsx
    │       └── restaurantInformation/
    │           ├── Index.jsx
    │           ├── LegalInformation.jsx
    │           ├── PersonalInformation.jsx
    │           └── RestaurantInformation.jsx
    ├── riderDashboard/
    │   ├── RiderSidebar.jsx                          [MODIFY] - Add Earnings tab & availability toggle
    │   ├── RiderOverview.jsx                         [MODIFY] - Connect to /rider/dashboard metrics
    │   ├── RiderOrders.jsx                           [MODIFY] - Implement Pickup/Delivery workflow controls
    │   ├── RiderEarnings.jsx                         [NEW] - Implement earnings history table
    │   └── RiderSettings.jsx                         [MODIFY] - Add vehicle, address, and document KYC upload
    └── adminDashboard/
        ├── AdminSidebar.jsx                          [MODIFY] - Add Customers, Restaurants, Riders, Orders tabs
        ├── AdminOverview.jsx                         [MODIFY] - Connect to /admin/dashboard analytics
        ├── AdminCustomers.jsx                        [NEW] - Customer list and status toggle
        ├── AdminRestaurants.jsx                      [NEW] - Restaurant list, approval, and order viewer
        ├── AdminRiders.jsx                           [NEW] - Rider list, verification, and earnings viewer
        ├── AdminOrders.jsx                           [MODIFY] - Global order list with rider assignment modal
        └── AdminSettings.jsx                         [EXISTING]
```

---

## 5. PAGE → API MAPPING

```text
Public & Shared Pages:
─────────────────────────────────────────────────────────────────────────────
Home.jsx                      → GET /public/restaurants
OrderNow.jsx                  → GET /public/restaurants
RestaurantDetailsPage.jsx     → GET /public/restaurant-detail/:restaurantId
ContactPage.jsx               → POST /public/contact-us
Login.jsx                     → POST /auth/login
Register.jsx                  → POST /auth/register
Navbar.jsx (Logout Action)    → GET /auth/logout
ForgotPasswordModal.jsx       → POST /auth/send-otp
                              → POST /auth/verify-otp
                              → POST /auth/reset-password
PasswordChangeModal.jsx       → PATCH /common/change-password

Customer Flows:
─────────────────────────────────────────────────────────────────────────────
Cart.jsx                      → POST /order/create-order/:restaurantId
                              → POST /payment/create-order
                              → POST /payment/verify
OrderTrackingPage.jsx         → GET /customer/orders/:orderId
CustomerDashboard:
  ├── CustomerOverview.jsx    → GET /customer/all-orders
  │                           → GET /customer/address-book
  ├── CustomerOrders.jsx      → GET /customer/all-orders
  │                           → GET /customer/orders/:orderId
  ├── CustomerAddressBook.jsx → GET /customer/address-book
  │                           → POST /customer/address-book
  │                           → PUT /customer/address-book/:addressId
  │                           → DELETE /customer/address-book/:addressId
  └── CustomerSetting.jsx     → PUT /common/edit-profile
                              → PATCH /common/change-password

Restaurant Management Flows:
─────────────────────────────────────────────────────────────────────────────
RestaurantDashboard:
  ├── RestaurantOverview.jsx  → GET /restaurant/get-restaurant-data
  │                           → GET /restaurant/orders
  │                           → PATCH /restaurant/change-open-status/:openStatus
  ├── RestaurantOrders.jsx    → GET /restaurant/orders
  │                           → PATCH /restaurant/orders/:orderId/accept
  │                           → PATCH /restaurant/orders/:orderId/preparing
  │                           → PATCH /restaurant/orders/:orderId/ready
  ├── RestaurantMenu.jsx      → GET /restaurant/menu-items
  │                           → POST /restaurant/add-menu-item
  │                           → PUT /restaurant/menu-item/:itemId
  │                           → PATCH /restaurant/menu-item/:itemId/status
  │                           → DELETE /restaurant/menu-item/:itemId
  │                           → PATCH /restaurant/menu-item/:itemId/control
  └── RestaurantSettings.jsx  → GET /restaurant/get-restaurant-data
                              → PUT /restaurant/update-restaurant-info
                              → PUT /restaurant/update-legal-info
                              → PUT /restaurant/update-address
                              → PUT /restaurant/update-banking-documents
                              → PUT /restaurant/update-social-media-links
                              → PUT /restaurant/update-cover-photo
                              → PUT /restaurant/update-restaurant-images
                              → PUT /common/edit-profile
                              → PATCH /common/change-password

Rider Delivery Flows:
─────────────────────────────────────────────────────────────────────────────
RiderDashboard:
  ├── RiderOverview.jsx       → GET /rider/dashboard
  │                           → PATCH /rider/toggle-availability
  │                           → PATCH /rider/location
  ├── RiderOrders.jsx         → GET /rider/orders
  │                           → GET /rider/orders/:orderId
  │                           → PATCH /rider/orders/:orderId/accept
  │                           → PATCH /rider/orders/:orderId/pickup
  │                           → PATCH /rider/orders/:orderId/out-for-delivery
  │                           → PATCH /rider/orders/:orderId/deliver
  │                           → PATCH /rider/orders/:orderId/undeliverable
  ├── RiderEarnings.jsx       → GET /rider/earnings
  └── RiderSettings.jsx       → GET /rider/profile
                              → PUT /rider/profile
                              → PUT /rider/upload-documents
                              → PUT /common/edit-profile
                              → PATCH /common/change-password

Admin Console Flows:
─────────────────────────────────────────────────────────────────────────────
AdminDashboard:
  ├── AdminOverview.jsx       → GET /admin/dashboard
  ├── AdminCustomers.jsx      → GET /admin/customers
  │                           → GET /admin/customers/:customerId
  │                           → PATCH /admin/customers/:customerId/status
  ├── AdminRestaurants.jsx    → GET /admin/restaurants
  │                           → GET /admin/restaurants/:restaurantId
  │                           → PATCH /admin/restaurants/:restaurantId/status
  │                           → GET /admin/restaurants/:restaurantId/orders
  ├── AdminRiders.jsx         → GET /admin/riders
  │                           → GET /admin/riders/:riderId
  │                           → PATCH /admin/riders/:riderId/status
  │                           → GET /admin/riders/:riderId/orders
  │                           → GET /admin/riders/:riderId/earnings
  ├── AdminOrders.jsx         → GET /admin/orders
  │                           → GET /admin/orders/:orderId
  │                           → PATCH /admin/orders/:orderId/assign-rider
  │                           → PATCH /admin/orders/:orderId/status
  │                           → GET /admin/riders
  └── AdminSettings.jsx       → PUT /common/edit-profile
                              → PATCH /common/change-password
```

---

## 6. MISSING FRONTEND REQUIREMENTS

### 6.1 Backend APIs with Zero Frontend Integration
1. `POST /public/contact-us` — Contact form API exists in backend but has no UI in frontend.
2. `GET /customer/address-book`, `POST /customer/address-book`, `PUT /customer/address-book/:id`, `DELETE /customer/address-book/:id` — Full customer address management is implemented on the backend but completely missing in the frontend.
3. `GET /customer/all-orders`, `GET /customer/orders/:id` — Customer order list and tracking APIs exist on backend, but `CustomerOrders.jsx` is only a stub.
4. `GET /restaurant/orders`, `PATCH /restaurant/orders/:id/accept`, `PATCH /restaurant/orders/:id/preparing`, `PATCH /restaurant/orders/:id/ready` — Restaurant order workflow is complete on backend, but `RestaurantOrders.jsx` is an empty stub.
5. `GET /rider/dashboard`, `GET /rider/earnings`, `GET /rider/orders`, `PATCH /rider/orders/:id/accept`, `PATCH /rider/orders/:id/pickup`, `PATCH /rider/orders/:id/out-for-delivery`, `PATCH /rider/orders/:id/deliver`, `PATCH /rider/orders/:id/undeliverable`, `PATCH /rider/toggle-availability`, `PATCH /rider/location`, `PUT /rider/upload-documents` — Entire Rider workflow exists on backend, but rider tabs in frontend are empty stubs.
6. `GET /admin/dashboard`, `GET /admin/customers`, `PATCH /admin/customers/:id/status`, `GET /admin/restaurants`, `PATCH /admin/restaurants/:id/status`, `GET /admin/riders`, `PATCH /admin/riders/:id/status`, `GET /admin/orders`, `PATCH /admin/orders/:id/assign-rider`, `PATCH /admin/orders/:id/status` — All Admin management and analytics APIs exist on backend, but Admin frontend only has stub tabs.

### 6.2 Missing Pages & Components
- **`ProtectedRoute.jsx`**: Centralized role-based route guard to prevent unauthenticated access or unauthorized role access (currently hardcoded inside dashboard pages).
- **`OrderTrackingPage.jsx`**: Dedicated public/customer tracking view for live order progression.
- **`ContactPage.jsx`**: Public contact form.
- **`CustomerAddressBook.jsx` & `CustomerAddressModal.jsx`**: Address book manager for customer checkout and profile.
- **`AdminCustomers.jsx`, `AdminRestaurants.jsx`, `AdminRiders.jsx`**: Admin management panels for user verification and status control.
- **`RiderEarnings.jsx`**: Dedicated earnings breakdown for delivery personnel.
- **`Navbar.jsx` / `Footer.jsx`**: Full responsive components replacing existing `<div>Navbar</div>` and `<div>Footer</div>` stubs.

### 6.3 State & API Inconsistencies to Address
- **Profile Photo Field in Common Edit**: Backend `EditUserProfile` expects `req.file` under field name `displayPic`, whereas User model stores `photo.url`. Frontend `CustomerSetting.jsx` correctly sends `displayPic`. This convention must be maintained across all role settings.
- **Order Item Price Field**: Backend `Menu` schema uses `itemPrice` (Number). `CartContext` maps it to `price` (Number). Order creation sends `{ itemId, quantity }` to `POST /order/create-order/:restaurantId`, and the backend calculates official bill totals from the database.

---

## 7. IMPLEMENTATION ORDER

```text
Phase 1: Foundation & Shared Shell
  1.1 Standardize API service layer & error interceptors in client/src/config/ApiConfig.jsx.
  1.2 Implement ProtectedRoute.jsx and PublicRoute.jsx in client/src/routes/.
  1.3 Implement full responsive Navbar.jsx and Footer.jsx with auth state and cart counter.
  1.4 Implement Home.jsx (landing page) and ContactPage.jsx.

Phase 2: Customer Order & Address Workflow
  2.1 Implement CustomerAddressBook.jsx & CustomerAddressModal.jsx (CRUD for /customer/address-book).
  2.2 Connect Cart.jsx address selection to customer address book.
  2.3 Implement CustomerOrders.jsx with active and past orders from GET /customer/all-orders.
  2.4 Implement OrderTrackingPage.jsx consuming GET /customer/orders/:orderId.
  2.5 Implement CustomerOverview.jsx.

Phase 3: Restaurant Operations
  3.1 Connect RestaurantOverview.jsx with metrics and open/close status toggle.
  3.2 Implement RestaurantOrders.jsx live order board with Accept / Prepare / Ready controls.

Phase 4: Rider Delivery Portal
  4.1 Implement RiderOverview.jsx with stats, online toggle, and GPS updater.
  4.2 Implement RiderOrders.jsx with delivery state transitions (Accept → Pickup → Out for Delivery → Deliver / Undeliverable).
  4.3 Implement RiderEarnings.jsx.
  4.4 Implement RiderSettings.jsx KYC document upload interface.

Phase 5: Admin Management Console
  5.1 Implement AdminOverview.jsx with platform KPI cards.
  5.2 Implement AdminCustomers.jsx (view, search, suspend/verify).
  5.3 Implement AdminRestaurants.jsx (view, verify documents, approve/suspend).
  5.4 Implement AdminRiders.jsx (view KYC, verify/block, earnings).
  5.5 Implement AdminOrders.jsx with manual rider assignment modal and status override.

Phase 6: Verification & End-to-End Testing
  6.1 Validate full lifecycle: Customer order → Restaurant accept/prep → Rider assign/pickup/deliver → Admin monitor.
```

---

## 8. FINAL REQUIREMENT SUMMARY

- **Existing Pages / Components:** `OrderNow.jsx`, `RestaurantDetailsPage.jsx`, `Cart.jsx`, `Login.jsx`, `Register.jsx`, `RestaurantDashboard.jsx` (Menu + Settings complete), `ForgotPasswordModal.jsx`, `PasswordChangeModal.jsx`.
- **New Pages Required:** `OrderTrackingPage.jsx`, `ContactPage.jsx`, `ProtectedRoute.jsx`.
- **Pages / Views to Modify from Stubs:** `Home.jsx`, `Navbar.jsx`, `Footer.jsx`, `CustomerOrders.jsx`, `CustomerOverview.jsx`, `RestaurantOverview.jsx`, `RestaurantOrders.jsx`, `RiderOverview.jsx`, `RiderOrders.jsx`, `AdminOverview.jsx`, `AdminOrders.jsx`.
- **New Components Required:** `CustomerAddressBook.jsx`, `CustomerAddressModal.jsx`, `RiderEarnings.jsx`, `AdminCustomers.jsx`, `AdminRestaurants.jsx`, `AdminRiders.jsx`.
- **APIs Needing Frontend Integration:** All Address Book APIs, Customer Orders & Tracking APIs, Restaurant Order Workflow APIs, Rider Delivery & KYC APIs, Admin Management & Dispatch APIs, and Public Contact API.
