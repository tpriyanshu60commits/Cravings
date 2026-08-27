# Cravings Backend: Complete Thunder Client API Testing Guide

> **Base URL**: `http://localhost:5000`  
> **Server Engine**: Node.js / Express (ES Modules)  
> **Database**: MongoDB (Mongoose)  
> **Authentication Mode**: Cookie-based JWT (`oreo` for sessions, `kitkat` for password reset OTP)  
> **Testing Tool**: Thunder Client (VS Code Extension) or Postman / Curl  

---

## 1. Authentication Architecture & Test Accounts

### How Authentication Works in Thunder Client
1. **Cookie Management**:
   - When you call `POST /auth/login`, the server returns a `Set-Cookie` header with the name `oreo` containing the JWT token.
   - **Thunder Client automatically stores and sends cookies for subsequent requests to `localhost:5000`**.
   - If switching between roles (e.g. from Customer to Admin), call `GET /auth/logout` or manually clear the `oreo` cookie in Thunder Client's **Cookies** tab.
2. **OTP Flow Token**:
   - When you call `POST /auth/verify-otp`, the server sets a short-lived (10 min) cookie named `kitkat`.
   - `POST /auth/reset-password` requires this `kitkat` cookie via `OTPAuthProtect`.

### Seed Test Accounts (Available in Codebase)
You can use the seeded test accounts or register fresh ones via `POST /auth/register`:

| Role | Email | Password | User Type | Notes |
|---|---|---|---|---|
| **Admin** | `admin@cravings678.com` | `StrongPassword@123` | `admin` | Superuser with platform-wide supervision |
| **Restaurant** | `Manager1@gmail.com` | `Manager@123` | `restaurant` | Restaurant kitchen & menu manager |
| **Customer** | `Customer1@gmail.com` | `Customer@123` | `customer` | Orders food & manages address book |
| **Rider** | `Rider1@gmail.com` | `Rider@123` | `rider` | Delivery partner (vehicle KYC & tracking) |

---

## 2. Recommended Dependency-Based Testing Order

To avoid testing errors (such as attempting to create an order before a restaurant exists), execute your tests in this sequence:

```
[Phase 1: Public & Auth Setup]
  1. GET / (Health Check)
  2. POST /public/contact-us
  3. POST /auth/register (or use Seeded Accounts)
  4. POST /auth/login (Customer) ➔ Save Cookie
  5. POST /auth/send-otp ➔ POST /auth/verify-otp ➔ POST /auth/reset-password

[Phase 2: Restaurant Setup & Menu Creation]
  6. POST /auth/login (Restaurant Manager) ➔ Save Cookie
  7. PUT /restaurant/update-restaurant-info
  8. PUT /restaurant/update-legal-info
  9. PUT /restaurant/update-address
  10. PUT /restaurant/update-banking-documents
  11. PUT /restaurant/update-cover-photo (Multipart)
  12. PATCH /restaurant/change-open-status/true
  13. POST /restaurant/add-menu-item (Multipart) ➔ COPY `itemId` & `restaurantId`
  14. GET /restaurant/menu-items

[Phase 3: Rider Onboarding & KYC]
  15. POST /auth/login (Rider) ➔ Save Cookie
  16. PUT /rider/profile (Vehicle details)
  17. PUT /rider/upload-documents (Multipart KYC)
  18. PATCH /rider/location (Set GPS coordinates)

[Phase 4: Admin Verification & Rider Approval]
  19. POST /auth/login (Admin) ➔ Save Cookie
  20. GET /admin/dashboard
  21. GET /admin/restaurants
  22. PATCH /admin/restaurants/:restaurantId/status (Approve: `active`)
  23. GET /admin/riders ➔ COPY `riderId`
  24. PATCH /admin/riders/:riderId/status (Approve: `active`)

[Phase 5: Rider Availability]
  25. POST /auth/login (Rider) ➔ Save Cookie
  26. PATCH /rider/toggle-availability (Set `isAvailable: true`)

[Phase 6: Customer Checkout & Payment]
  27. POST /auth/login (Customer) ➔ Save Cookie
  28. POST /customer/address-book (Add Drop Address)
  29. GET /customer/address-book ➔ Verify Address
  30. GET /public/restaurants ➔ Confirm store is open
  31. GET /public/restaurant-detail/:restaurantId
  32. POST /order/create-order/:restaurantId ➔ COPY `orderId`
  33. POST /payment/create-order ➔ COPY `razorpayOrderId`
  34. POST /payment/verify ➔ Status transitions to `accepted`

[Phase 7: Kitchen Processing]
  35. POST /auth/login (Restaurant Manager) ➔ Save Cookie
  36. GET /restaurant/orders
  37. PATCH /restaurant/orders/:orderId/preparing ➔ Status becomes `preparing`
  38. PATCH /restaurant/orders/:orderId/ready ➔ Status becomes `ready`

[Phase 8: Admin Dispatch]
  39. POST /auth/login (Admin) ➔ Save Cookie
  40. PATCH /admin/orders/:orderId/assign-rider ➔ Assigns rider to order

[Phase 9: Rider Delivery Execution]
  41. POST /auth/login (Rider) ➔ Save Cookie
  42. GET /rider/orders
  43. GET /rider/orders/:orderId
  44. PATCH /rider/orders/:orderId/pickup ➔ Status becomes `pickedUp`
  45. PATCH /rider/orders/:orderId/out-for-delivery ➔ Status becomes `outForDelivery`
  46. PATCH /rider/orders/:orderId/deliver ➔ Status becomes `delivered`
  47. GET /rider/earnings ➔ Verifies ₹40 delivery payout

[Phase 10: Customer Tracking & History]
  48. POST /auth/login (Customer) ➔ Save Cookie
  49. GET /customer/orders/:orderId ➔ Verifies `delivered` state
  50. GET /customer/all-orders
```

---

## 3. Detailed API Testing Catalog (All 71 Endpoints)

---

### GROUP 1: PUBLIC APIs (No Authentication Required)

#### API #1: Server Health Check
* **Method**: `GET`
* **URL**: `http://localhost:5000/`
* **Auth**: Public
* **Expected Response (200 OK)**:
```json
{
  "message": "Welcome to my Cravings Project"
}
```

#### API #2: Submit Contact Us Form
* **Method**: `POST`
* **URL**: `http://localhost:5000/public/contact-us`
* **Auth**: Public
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "fullName": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "subject": "Inquiry about partnership",
  "message": "We would like to list our bakery on Cravings."
}
```
* **Expected Response (201 Created)**:
```json
{
  "message": "Thanks for Contacting us! You will hear back from us soon"
}
```

#### API #3: Get All Restaurants (Public Catalog)
* **Method**: `GET`
* **URL**: `http://localhost:5000/public/restaurants`
* **Auth**: Public
* **Expected Response (200 OK)**:
```json
{
  "data": [
    {
      "_id": "66ce1234567890abcdef1234",
      "restaurantName": "Spice Garden",
      "isOpen": true,
      "status": "active",
      "city": "Mumbai"
    }
  ]
}
```
* **IDs to Copy**: Copy `_id` as `restaurantId` for ordering.

#### API #4: Get Restaurant Public Profile & Full Menu
* **Method**: `GET`
* **URL**: `http://localhost:5000/public/restaurant-detail/:restaurantId`
* **Path Param**: `:restaurantId` (Copy from API #3)
* **Auth**: Public
* **Expected Response (200 OK)**:
```json
{
  "data": {
    "_id": "66ce9876543210fedcba5678",
    "restaurantId": {
      "_id": "66ce1234567890abcdef1234",
      "restaurantName": "Spice Garden",
      "managerId": {
        "_id": "66ce11112222333344445555",
        "fullName": "Manager1",
        "email": "Manager1@gmail.com",
        "phone": "9876543210"
      }
    },
    "menuItems": [
      {
        "_id": "66ce55556666777788889999",
        "itemName": "Paneer Butter Masala",
        "itemPrice": 250,
        "category": "Main Course",
        "foodType": "Vegetarian",
        "status": "available"
      }
    ]
  }
}
```
* **IDs to Copy**: Copy `menuItems[0]._id` as `itemId`.

---

### GROUP 2: AUTHENTICATION APIs

#### API #5: Register New User
* **Method**: `POST`
* **URL**: `http://localhost:5000/auth/register`
* **Auth**: Public
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "fullName": "Rohan Verma",
  "email": "rohan.customer@example.com",
  "password": "CustomerPassword@123",
  "phone": "9822334455",
  "gender": "male",
  "dob": "1998-05-15",
  "userType": "customer"
}
```
> **Valid `userType` enums**: `"customer"`, `"restaurant"`, `"rider"`, `"admin"`
* **Expected Response (201 Created)**:
```json
{
  "message": "User Created Successfully"
}
```

#### API #6: Login User
* **Method**: `POST`
* **URL**: `http://localhost:5000/auth/login`
* **Auth**: Public
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "email": "rohan.customer@example.com",
  "password": "CustomerPassword@123"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Welcome Back",
  "data": {
    "_id": "66ce22223333444455556666",
    "fullName": "Rohan Verma",
    "email": "rohan.customer@example.com",
    "phone": "9822334455",
    "userType": "customer",
    "photo": {
      "url": "https://placehold.co/600x400?text=R",
      "publicId": null
    }
  }
}
```
* **Cookie Saved**: `oreo=<JWT_TOKEN>` (Handled automatically by Thunder Client).

#### API #7: Send Password Reset OTP
* **Method**: `POST`
* **URL**: `http://localhost:5000/auth/send-otp`
* **Auth**: Public
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "email": "rohan.customer@example.com"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "OTP sent on 'rohan.customer@example.com'"
}
```
*(Check server terminal console or your Gmail inbox for the 6-digit OTP)*

#### API #8: Verify OTP
* **Method**: `POST`
* **URL**: `http://localhost:5000/auth/verify-otp`
* **Auth**: Public
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "email": "rohan.customer@example.com",
  "otp": "123456"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "OTP verified. Create You New Password Now"
}
```
* **Cookie Saved**: Sets `kitkat=<OTP_TOKEN>`.

#### API #9: Reset Password
* **Method**: `POST`
* **URL**: `http://localhost:5000/auth/reset-password`
* **Auth**: Requires `kitkat` cookie (`OTPAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "newPassword": "NewStrongPassword@2026"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Password Changed"
}
```

#### API #10: Logout User
* **Method**: `GET`
* **URL**: `http://localhost:5000/auth/logout`
* **Auth**: Public
* **Expected Response (200 OK)**:
```json
{
  "message": "Logout Sucessfully"
}
```

---

### GROUP 3: COMMON USER PROFILE APIs (Any Authenticated User)

#### API #11: Edit Own Profile & Avatar
* **Method**: `PUT`
* **URL**: `http://localhost:5000/common/edit-profile`
* **Auth**: Requires `oreo` cookie (`AuthProtect`)
* **Body Type**: `Form / Multipart` (Form-data)
  - Text field: `fullName` ➔ `Rohan V. Updated`
  - Text field: `phone` ➔ `9876543219`
  - File field: `displayPic` ➔ Choose local image (JPG/PNG)
* **Expected Response (200 OK)**:
```json
{
  "message": "User Updated Successfully",
  "data": {
    "_id": "66ce22223333444455556666",
    "fullName": "Rohan V. Updated",
    "email": "rohan.customer@example.com",
    "phone": "9876543219",
    "photo": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "Cravings678/profile/..."
    }
  }
}
```

#### API #12: Change User Password
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/common/change-password`
* **Auth**: Requires `oreo` cookie (`AuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "oldPassword": "NewStrongPassword@2026",
  "newPassword": "CustomerPassword@123"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Password updated successfully"
}
```

---

### GROUP 4: CUSTOMER APIs (`CustomerAuthProtect`)

#### API #13: Add Address to Address Book
* **Method**: `POST`
* **URL**: `http://localhost:5000/customer/address-book`
* **Auth**: Requires Customer Login (`CustomerAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "name": "Rohan Verma",
  "address": "Flat 402, Sunshine Heights, Andheri West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pinCode": "400053",
  "country": "India",
  "addressType": "home",
  "isDefault": true,
  "geoLat": "19.1363",
  "geoLon": "72.8277"
}
```
> **Valid `addressType` enums**: `"home"`, `"work"`, `"other"`
* **Expected Response (201 Created)**:
```json
{
  "message": "Address added successfully",
  "data": [
    {
      "_id": "66ce33334444555566667777",
      "name": "Rohan Verma",
      "address": "Flat 402, Sunshine Heights, Andheri West",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pinCode": "400053",
      "country": "India",
      "addressType": "home",
      "isDefault": true,
      "geoLocation": {
        "lat": "19.1363",
        "lon": "72.8277"
      }
    }
  ]
}
```
* **IDs to Copy**: Copy `data[0]._id` as `addressId`.

#### API #14: Get Customer Address Book
* **Method**: `GET`
* **URL**: `http://localhost:5000/customer/address-book`
* **Auth**: Requires Customer Login (`CustomerAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Address book fetched successfully",
  "data": [ ... ]
}
```

#### API #15: Update Saved Address
* **Method**: `PUT`
* **URL**: `http://localhost:5000/customer/address-book/:addressId`
* **Path Param**: `:addressId` (From API #13)
* **Auth**: Requires Customer Login (`CustomerAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "name": "Rohan V.",
  "address": "Flat 402, Sunshine Heights, Phase 2",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pinCode": "400053",
  "country": "India",
  "addressType": "home",
  "isDefault": true
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Address updated successfully",
  "data": [ ... ]
}
```

#### API #16: Delete Saved Address
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/customer/address-book/:addressId`
* **Path Param**: `:addressId` (From API #13)
* **Auth**: Requires Customer Login (`CustomerAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Address deleted successfully",
  "data": [ ... ]
}
```

#### API #17: Get Customer All Orders
* **Method**: `GET`
* **URL**: `http://localhost:5000/customer/all-orders`
* **Auth**: Requires Customer Login (`CustomerAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "All Order Fetched",
  "data": [ ... ]
}
```

#### API #18: Get Customer Single Order Live Tracking
* **Method**: `GET`
* **URL**: `http://localhost:5000/customer/orders/:orderId`
* **Path Param**: `:orderId` (From API #19 CreateOrder)
* **Auth**: Requires Customer Login (`CustomerAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order details fetched successfully",
  "data": {
    "_id": "66ce77778888999900001111",
    "orderStatus": "outForDelivery",
    "restaurantId": {
      "restaurantName": "Spice Garden",
      "address": "12 Linking Road",
      "city": "Mumbai"
    },
    "riderId": {
      "vehicleDetails": {
        "vehicleType": "bike",
        "vehicleNumber": "MH02AB1234"
      },
      "currentLocation": {
        "lat": "19.1350",
        "lon": "72.8260"
      },
      "averageRating": 4.8
    },
    "billDetails": {
      "finalAmount": 535
    }
  }
}
```

---

### GROUP 5: ORDER & PAYMENT APIs

#### API #19: Create Order (Customer)
* **Method**: `POST`
* **URL**: `http://localhost:5000/order/create-order/:restaurantId`
* **Path Param**: `:restaurantId` (From API #3)
* **Auth**: Requires Customer Login (`CustomerAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "orderItems": [
    {
      "itemId": "66ce55556666777788889999",
      "quantity": 2
    }
  ],
  "paymentMethod": "upi",
  "deliveryAddress": {
    "name": "Rohan Verma",
    "address": "Flat 402 Sunshine Heights",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400053",
    "geoLocation": {
      "lat": "19.1363",
      "lon": "72.8277"
    }
  }
}
```
* **Expected Response (201 Created)**:
```json
{
  "message": "Order created with payment pending",
  "data": {
    "_id": "66ce77778888999900001111",
    "restaurantId": "66ce1234567890abcdef1234",
    "orderStatus": "pending",
    "billDetails": {
      "totalAmount": 500,
      "platformFee": 5,
      "convenienceFee": 5,
      "taxAmount": 25,
      "deliveryCharge": 0,
      "discountAmount": 0,
      "finalAmount": 535
    },
    "paymentDetails": {
      "paymentMethod": "upi",
      "paymentStatus": "pending"
    }
  }
}
```
* **IDs to Copy**: Copy `data._id` as `orderId`.

#### API #20: Create Razorpay Order
* **Method**: `POST`
* **URL**: `http://localhost:5000/payment/create-order`
* **Auth**: Requires Customer Login (`AuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "orderId": "66ce77778888999900001111"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Razorpay order created",
  "data": {
    "key": "rzp_test_...",
    "razorpayOrderId": "order_OG7w...",
    "amount": 53500,
    "currency": "INR",
    "appOrderId": "66ce77778888999900001111"
  }
}
```
* **IDs to Copy**: Copy `data.razorpayOrderId`.

#### API #21: Verify Razorpay Payment Signature
* **Method**: `POST`
* **URL**: `http://localhost:5000/payment/verify`
* **Auth**: Requires Customer Login (`AuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "orderId": "66ce77778888999900001111",
  "razorpay_order_id": "order_OG7w...",
  "razorpay_payment_id": "pay_OG7xyz...",
  "razorpay_signature": "<GENERATED_OR_MOCKED_HMAC_SHA256>"
}
```
> *(Note: In automated testing, compute signature via `crypto.createHmac("sha256", RAZORPAY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex")`)*
* **Expected Response (200 OK)**:
```json
{
  "message": "Payment verified and order successful",
  "data": {
    "_id": "66ce77778888999900001111",
    "orderStatus": "accepted",
    "paymentDetails": {
      "paymentStatus": "completed",
      "razorpayOrderId": "order_OG7w...",
      "razorpayPaymentId": "pay_OG7xyz..."
    }
  }
}
```

---

### GROUP 6: RESTAURANT APIs (`RestaurantAuthProtect`)

*(First login as `Manager1@gmail.com`)*

#### API #22: Update Restaurant Information
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/update-restaurant-info`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "restaurantName": "Spice Garden Kitchen",
  "description": "Authentic North & South Indian delicacies",
  "restaurantType": "Fine Dining",
  "cuisineTypes": "North Indian, South Indian, Mughlai",
  "contactEmail": "contact@spicegarden.com",
  "contactPhone": "9876543210",
  "openingTime": "10:00 AM",
  "closingTime": "11:00 PM"
}
```
* **Expected Response (200 OK or 201 Created)**:
```json
{
  "success": true,
  "message": "Restaurant information updated successfully",
  "data": { ... }
}
```

#### API #23: Get Restaurant Own Data
* **Method**: `GET`
* **URL**: `http://localhost:5000/restaurant/get-restaurant-data?id=66ce11112222333344445555`
* **Query Param**: `?id=<MANAGER_USER_ID>`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurant Fetched Successfully",
  "data": { ... }
}
```

#### API #24: Toggle Restaurant Open/Closed Status
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/restaurant/change-open-status/true`
* **Path Param**: `:openStatus` (`true` or `false`)
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurant is live now",
  "data": {
    "isOpen": true
  }
}
```

#### API #25: Update Legal KYC Info
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/update-legal-info`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "legalName": "Spice Garden Hospitality Private Limited",
  "companyType": "Private Limited"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Legal information updated successfully",
  "data": { ... }
}
```

#### API #26: Update Restaurant Address
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/update-address`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "address": "12 Linking Road, Bandra West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pinCode": "400050",
  "country": "India",
  "geoLat": "19.0600",
  "geoLon": "72.8300"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Address updated successfully",
  "data": { ... }
}
```

#### API #27: Update Banking & Documents
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/update-banking-documents`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "bankName": "HDFC Bank",
  "accountNumber": "50100234567890",
  "ifscCode": "HDFC0001234",
  "gstCertificate": "https://example.com/gst.pdf",
  "fssaiCertificate": "https://example.com/fssai.pdf",
  "panCard": "https://example.com/pan.pdf"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Banking & Documents updated successfully",
  "data": { ... }
}
```

#### API #28: Update Social Media Links
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/update-social-media-links`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "socialMediaLinks": [
    "https://instagram.com/spicegarden",
    "https://facebook.com/spicegarden"
  ]
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Social media links updated successfully"
}
```

#### API #29: Upload Restaurant Cover Photo
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/update-cover-photo`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Body Type**: `Form / Multipart` (Form-data)
  - File field: `coverImage` ➔ Choose local image (JPG/PNG)
* **Expected Response (200 OK)**:
```json
{
  "message": "Cover photo updated successfully",
  "data": { ... }
}
```

#### API #30: Upload Multiple Restaurant Images
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/update-restaurant-images`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Body Type**: `Form / Multipart` (Form-data)
  - File field: `restaurantImages` ➔ Attach up to 8 images
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurant images updated successfully",
  "data": { ... }
}
```

#### API #31: Add Menu Item
* **Method**: `POST`
* **URL**: `http://localhost:5000/restaurant/add-menu-item`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Body Type**: `Form / Multipart` (Form-data)
  - Text field: `itemName` ➔ `Paneer Butter Masala`
  - Text field: `itemPrice` ➔ `250`
  - Text field: `description` ➔ `Rich creamy cottage cheese gravy`
  - Text field: `category` ➔ `Main Course`
  - Text field: `foodType` ➔ `Vegetarian`
  - Text field: `status` ➔ `available`
  - Text field: `isTopRated` ➔ `true`
  - Text field: `isRecommended` ➔ `true`
  - Text field: `isNew` ➔ `false`
  - File field: `itemImage` ➔ Choose dish image
> **Valid `category` enums**: `"Appetizer"`, `"Main Course"`, `"Dessert"`, `"Beverage"`, `"Salad"`, `"Soup"`, `"Side Dish"`, `"Breakfast"`, `"Lunch"`, `"Dinner"`, `"Snack"`, `"Pizza"`, `"Pasta"`, `"Burger"`, `"Sandwich"`, `"Seafood"`, `"Rice"`, `"Wrap"`, `"Starter"`, `"Drink"`, `"Other"`  
> **Valid `foodType` enums**: `"Vegetarian"`, `"Non-Vegetarian"`, `"Vegan"`, `"Gluten-Free"`, `"Dairy-Free"`, `"Egg-Free"`, `"Other"`  
> **Valid `status` enums**: `"available"`, `"unavailable"`, `"discontinued"`
* **Expected Response (200 OK)**:
```json
{
  "message": "Menu item added successfully",
  "data": {
    "_id": "...",
    "menuItems": [ ... ]
  }
}
```
* **IDs to Copy**: Copy new `menuItems[...]._id` as `itemId`.

#### API #32: Get All Restaurant Menu Items
* **Method**: `GET`
* **URL**: `http://localhost:5000/restaurant/menu-items`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Menu items fetched successfully",
  "data": [ ... ]
}
```

#### API #33: Update Menu Item
* **Method**: `PUT`
* **URL**: `http://localhost:5000/restaurant/menu-item/:itemId`
* **Path Param**: `:itemId` (From API #31)
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Body Type**: `Form / Multipart` (Form-data) or JSON
  - Text field: `itemName` ➔ `Special Paneer Butter Masala`
  - Text field: `itemPrice` ➔ `280`
  - Text field: `status` ➔ `available`
* **Expected Response (200 OK)**:
```json
{
  "message": "Menu item updated successfully",
  "data": { ... }
}
```

#### API #34: Update Menu Item Status (Quick Toggle)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/restaurant/menu-item/:itemId/status?status=unavailable`
* **Path Param**: `:itemId`
* **Query Param**: `?status=available|unavailable|discontinued`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Menu item status updated successfully",
  "data": {
    "status": "unavailable"
  }
}
```

#### API #35: Toggle Menu Item Badges (Control)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/restaurant/menu-item/:itemId/control?control=isTopRated`
* **Path Param**: `:itemId`
* **Query Param**: `?control=isTopRated|isRecommended|isNew`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Menu item control updated successfully",
  "data": { ... }
}
```

#### API #36: Delete Menu Item (Soft Delete)
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/restaurant/menu-item/:itemId`
* **Path Param**: `:itemId`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Menu item deleted successfully",
  "data": {
    "isDeleted": true,
    "status": "discontinued"
  }
}
```

#### API #37: Get Kitchen Live Orders
* **Method**: `GET`
* **URL**: `http://localhost:5000/restaurant/orders`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurant orders fetched successfully",
  "data": [
    {
      "_id": "66ce77778888999900001111",
      "orderStatus": "accepted",
      "orderItems": [ ... ],
      "billDetails": { "finalAmount": 535 }
    }
  ]
}
```

#### API #38: Kitchen Accept Order (Pending ➔ Accepted)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/restaurant/orders/:orderId/accept`
* **Path Param**: `:orderId` (Only applicable if order is in `pending` state)
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order accepted successfully",
  "data": {
    "_id": "66ce77778888999900001111",
    "orderStatus": "accepted"
  }
}
```

#### API #39: Kitchen Start Cooking (Accepted ➔ Preparing)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/restaurant/orders/:orderId/preparing`
* **Path Param**: `:orderId`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order is now being prepared",
  "data": {
    "_id": "66ce77778888999900001111",
    "orderStatus": "preparing"
  }
}
```

#### API #40: Kitchen Mark Packed & Ready (Preparing ➔ Ready)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/restaurant/orders/:orderId/ready`
* **Path Param**: `:orderId`
* **Auth**: Requires Restaurant Login (`RestaurantAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order is ready for rider pickup",
  "data": {
    "_id": "66ce77778888999900001111",
    "orderStatus": "ready"
  }
}
```

---

### GROUP 7: RIDER APIs (`RiderAuthProtect`)

*(First login as `Rider1@gmail.com`)*

#### API #41: Get Rider Profile
* **Method**: `GET`
* **URL**: `http://localhost:5000/rider/profile`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider profile fetched successfully",
  "data": {
    "_id": "66ce44445555666677778888",
    "status": "pending",
    "isAvailable": false,
    "vehicleDetails": { ... },
    "documents": { ... }
  }
}
```

#### API #42: Update Rider Profile & Vehicle Specs
* **Method**: `PUT`
* **URL**: `http://localhost:5000/rider/profile`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "vehicleDetails": {
    "vehicleType": "bike",
    "vehicleNumber": "MH02AB1234",
    "vehicleModel": "Honda Activa 6G",
    "vehicleColor": "Black"
  },
  "currentAddress": {
    "address": "Room 10, Shivaji Nagar",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400053",
    "country": "India"
  },
  "financialDetails": {
    "bankName": "State Bank of India",
    "accountNumber": "30123456789",
    "ifscCode": "SBIN0001234"
  }
}
```
> **Valid `vehicleType` enums**: `"bike"`, `"scooter"`, `"electric_bike"`, `"bicycle"`, `"other"`
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider profile updated successfully",
  "data": { ... }
}
```

#### API #43: Upload Rider KYC Documents
* **Method**: `PUT`
* **URL**: `http://localhost:5000/rider/upload-documents`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Body Type**: `Form / Multipart` (Form-data)
  - File field: `drivingLicense` ➔ Attach License Image
  - File field: `vehicleRC` ➔ Attach RC Book Image
  - File field: `insurance` ➔ Attach Insurance Doc
  - File field: `aadharCard` ➔ Attach Aadhar Card
  - File field: `panCard` ➔ Attach PAN Card
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider documents uploaded successfully",
  "data": { ... }
}
```

#### API #44: Toggle Rider Online Availability
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/rider/toggle-availability`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "isAvailable": true
}
```
> *(Note: Account must have `status: "active"` approved by Admin to go online)*
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider is now online",
  "data": {
    "isAvailable": true,
    "status": "active"
  }
}
```

#### API #45: Update Rider Live Location (GPS)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/rider/location`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "lat": "19.1350",
  "lon": "72.8260"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider location updated successfully",
  "data": {
    "lat": "19.1350",
    "lon": "72.8260"
  }
}
```

#### API #46: Get Rider Dashboard Metrics
* **Method**: `GET`
* **URL**: `http://localhost:5000/rider/dashboard`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider dashboard statistics fetched successfully",
  "data": {
    "isAvailable": true,
    "status": "active",
    "activeOrdersCount": 1,
    "todayDeliveriesCount": 0,
    "totalDeliveriesCount": 0,
    "todayEarnings": 0,
    "totalEarnings": 0
  }
}
```

#### API #47: Get Rider Earnings Report
* **Method**: `GET`
* **URL**: `http://localhost:5000/rider/earnings`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider earnings fetched successfully",
  "data": {
    "summary": {
      "todayEarnings": 40,
      "todayDeliveriesCount": 1,
      "weeklyEarnings": 40,
      "weeklyDeliveriesCount": 1,
      "totalEarnings": 40,
      "totalDeliveriesCount": 1,
      "perDeliveryFee": 40
    },
    "transactions": [ ... ]
  }
}
```

#### API #48: Get Rider Assigned Orders
* **Method**: `GET`
* **URL**: `http://localhost:5000/rider/orders?status=active`
* **Query Param**: `?status=active|completed|all`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider orders fetched successfully",
  "data": [ ... ]
}
```

#### API #49: Get Rider Single Order Details
* **Method**: `GET`
* **URL**: `http://localhost:5000/rider/orders/:orderId`
* **Path Param**: `:orderId`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order details fetched successfully",
  "data": { ... }
}
```

#### API #50: Accept Assigned Order
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/rider/orders/:orderId/accept`
* **Path Param**: `:orderId`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order accepted successfully",
  "data": { ... }
}
```

#### API #51: Mark Order Picked Up (Ready ➔ PickedUp)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/rider/orders/:orderId/pickup`
* **Path Param**: `:orderId`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order marked as picked up",
  "data": {
    "orderStatus": "pickedUp"
  }
}
```

#### API #52: Mark Out For Delivery (PickedUp ➔ OutForDelivery)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/rider/orders/:orderId/out-for-delivery`
* **Path Param**: `:orderId`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order marked as out for delivery",
  "data": {
    "orderStatus": "outForDelivery"
  }
}
```

#### API #53: Mark Order Delivered (OutForDelivery ➔ Delivered)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/rider/orders/:orderId/deliver`
* **Path Param**: `:orderId`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order delivered successfully",
  "data": {
    "orderStatus": "delivered"
  }
}
```

#### API #54: Mark Order Undeliverable (OutForDelivery ➔ Undeliverable)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/rider/orders/:orderId/undeliverable`
* **Path Param**: `:orderId`
* **Auth**: Requires Rider Login (`RiderAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order marked as undeliverable successfully",
  "data": {
    "orderStatus": "undeliverable"
  }
}
```

---

### GROUP 8: ADMIN SUPERVISION & DISPATCH APIs (`AdminAuthProtect`)

*(First login as `admin@cravings678.com`)*

#### API #55: Admin Platform Dashboard Stats
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/dashboard`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Admin dashboard statistics fetched successfully",
  "data": {
    "customers": { "total": 10, "verified": 8, "pending": 2, "suspended": 0 },
    "restaurants": { "total": 4, "active": 3, "pending": 1, "blocked": 0 },
    "riders": { "total": 5, "active": 4, "available": 2, "pending": 1, "blocked": 0 },
    "orders": { "total": 20, "activeDeliveries": 2, "delivered": 18, "cancelled": 0 },
    "revenue": { "grossMerchandiseValue": 10700, "todayRevenue": 535 },
    "pendingApprovals": { "restaurants": 1, "riders": 1, "customers": 2 }
  }
}
```

#### API #56: Get All Customers List
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/customers?search=Rohan`
* **Query Param**: `?search=...` (Searches `fullName`, `email`, `phone`)
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Customers fetched successfully",
  "count": 1,
  "data": [ ... ]
}
```
* **IDs to Copy**: Copy `data[0]._id` as `customerId`.

#### API #57: Get Customer Details
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/customers/:customerId`
* **Path Param**: `:customerId` (From API #56)
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Customer details fetched successfully",
  "data": {
    "customer": { ... },
    "orderHistory": [ ... ]
  }
}
```

#### API #58: Update Customer Status (Approve / Suspend)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/admin/customers/:customerId/status`
* **Path Param**: `:customerId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "status": "verified"
}
```
> **Valid `status` enums**: `"pending"`, `"verified"`, `"suspended"`
* **Expected Response (200 OK)**:
```json
{
  "message": "Customer status updated successfully",
  "data": { "status": "verified", "isActive": true }
}
```

#### API #59: Get All Restaurants List
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/restaurants?status=active&city=Mumbai`
* **Query Params**: `?status=active|inactive|blocked`, `?isOpen=true|false`, `?city=...`, `?search=...`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurants fetched successfully",
  "count": 1,
  "data": [ ... ]
}
```

#### API #60: Get Restaurant Full Inspection View
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/restaurants/:restaurantId`
* **Path Param**: `:restaurantId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurant details fetched successfully",
  "data": {
    "restaurant": { ... },
    "menu": { ... }
  }
}
```

#### API #61: Update Restaurant Status (Approve / Block)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/admin/restaurants/:restaurantId/status`
* **Path Param**: `:restaurantId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "status": "active"
}
```
> **Valid `status` enums**: `"active"`, `"inactive"`, `"blocked"`
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurant status updated successfully",
  "data": { "status": "active" }
}
```

#### API #62: Get Orders Placed With Restaurant
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/restaurants/:restaurantId/orders?status=delivered`
* **Path Param**: `:restaurantId`
* **Query Param**: `?status=...`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Restaurant orders fetched successfully",
  "data": [ ... ]
}
```

#### API #63: Get All Riders List
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/riders?status=active`
* **Query Params**: `?status=pending|active|inactive|blocked`, `?isAvailable=true|false`, `?search=...`, `?city=...`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Riders fetched successfully",
  "count": 1,
  "data": [ ... ]
}
```
* **IDs to Copy**: Copy `data[0]._id` as `riderId`.

#### API #64: Get Rider Details View
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/riders/:riderId`
* **Path Param**: `:riderId` (From API #63)
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider details fetched successfully",
  "data": {
    "rider": { ... },
    "activeOrdersCount": 0,
    "totalDeliveredCount": 1
  }
}
```

#### API #65: Update Rider Status (Approve / Reject / Block)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/admin/riders/:riderId/status`
* **Path Param**: `:riderId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "status": "active"
}
```
> **Valid `status` enums**: `"pending"`, `"active"`, `"inactive"`, `"blocked"`
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider status updated successfully",
  "data": { "status": "active" }
}
```

#### API #66: Get Rider Delivery History
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/riders/:riderId/orders`
* **Path Param**: `:riderId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider orders fetched successfully",
  "data": [ ... ]
}
```

#### API #67: Get Rider Earnings Audit
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/riders/:riderId/earnings`
* **Path Param**: `:riderId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider earnings fetched successfully",
  "data": {
    "summary": { "totalEarnings": 40, "totalDeliveries": 1, "perDeliveryFee": 40 },
    "transactions": [ ... ]
  }
}
```

#### API #68: Get Platform-Wide Live Orders Stream
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/orders?status=ready`
* **Query Params**: `?status=...`, `?restaurantId=...`, `?customerId=...`, `?riderId=...`, `?startDate=2026-08-01`, `?endDate=2026-08-31`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Orders fetched successfully",
  "count": 1,
  "data": [ ... ]
}
```

#### API #69: Get Single Order 360° Inspection
* **Method**: `GET`
* **URL**: `http://localhost:5000/admin/orders/:orderId`
* **Path Param**: `:orderId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Expected Response (200 OK)**:
```json
{
  "message": "Order details fetched successfully",
  "data": {
    "_id": "66ce77778888999900001111",
    "orderStatus": "ready",
    "restaurantId": { ... },
    "customerId": { ... },
    "riderId": { ... }
  }
}
```

#### API #70: Assign Rider to Order (Dispatch)
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/admin/orders/:orderId/assign-rider`
* **Path Param**: `:orderId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "riderId": "66ce44445555666677778888"
}
```
> *(Note: Order must be in `"ready"`, `"accepted"`, or `"preparing"` state, and Rider must have `status === "active"`)*
* **Expected Response (200 OK)**:
```json
{
  "message": "Rider assigned to order successfully",
  "data": {
    "_id": "66ce77778888999900001111",
    "riderId": "66ce44445555666677778888"
  }
}
```

#### API #71: Admin Emergency Order Status Override
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/admin/orders/:orderId/status`
* **Path Param**: `:orderId`
* **Auth**: Requires Admin Login (`AdminAuthProtect`)
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "status": "cancelled",
  "cancellationReason": "Customer duplicate order request",
  "paymentStatus": "failed"
}
```
* **Expected Response (200 OK)**:
```json
{
  "message": "Order status updated successfully",
  "data": {
    "_id": "66ce77778888999900001111",
    "orderStatus": "cancelled",
    "cancellationReason": "Customer duplicate order request"
  }
}
```

---

## 4. End-to-End Order Lifecycle Flow Matrix

| Lifecycle Stage | Executed By (Role) | API Endpoint | Transition | Key Verification |
|---|---|---|---|---|
| **1. Order Creation** | Customer | `POST /order/create-order/:restaurantId` | `(New)` ➔ `pending` | `orderStatus: "pending"`, `paymentStatus: "pending"` |
| **2. Payment Verify** | Customer / Gateway | `POST /payment/verify` | `pending` ➔ `accepted` | `orderStatus: "accepted"`, `paymentStatus: "completed"` |
| **3. Kitchen Cooking** | Restaurant Manager | `PATCH /restaurant/orders/:orderId/preparing` | `accepted` ➔ `preparing` | `orderStatus: "preparing"` |
| **4. Kitchen Packing** | Restaurant Manager | `PATCH /restaurant/orders/:orderId/ready` | `preparing` ➔ `ready` | `orderStatus: "ready"` |
| **5. Dispatch Assignment** | Administrator | `PATCH /admin/orders/:orderId/assign-rider` | Assigns `riderId` | `order.riderId` populated, status stays `ready` |
| **6. Rider Pickup** | Rider | `PATCH /rider/orders/:orderId/pickup` | `ready` ➔ `pickedUp` | `orderStatus: "pickedUp"` |
| **7. Out For Delivery** | Rider | `PATCH /rider/orders/:orderId/out-for-delivery` | `pickedUp` ➔ `outForDelivery` | `orderStatus: "outForDelivery"` |
| **8. Delivery Complete** | Rider | `PATCH /rider/orders/:orderId/deliver` | `outForDelivery` ➔ `delivered` | `orderStatus: "delivered"`, rider gets ₹40 |
| **9. Tracking Check** | Customer | `GET /customer/orders/:orderId` | Reads status | Shows final `delivered` status |

---

## 5. Negative Test Cases & Security Validation

Test these in Thunder Client to prove security and validation rules are active:

| Negative Test Scenario | Endpoint | Request Details | Expected HTTP Status | Expected Error / Verification Rule |
|---|---|---|---|---|
| **Unauthenticated Request** | `GET /customer/address-book` | Send request without `oreo` cookie | `401 Unauthorized` | `"Session Expired"` |
| **Cross-Role Access (Customer ➔ Admin)** | `GET /admin/dashboard` | Send request with Customer `oreo` cookie | `403 Forbidden` | `"Unauthorized Access: Admin role required"` |
| **Cross-Role Access (Rider ➔ Restaurant)** | `GET /restaurant/orders` | Send request with Rider `oreo` cookie | `403 Forbidden` | `"Unauthorized Access"` |
| **Cross-Customer Order Snooping** | `GET /customer/orders/:orderId` | Customer A queries Customer B's `orderId` | `404 Not Found` | `"Order not found or you are not authorized..."` |
| **Cross-Rider Order Theft** | `PATCH /rider/orders/:orderId/pickup` | Rider A attempts to pickup Rider B's order | `404 Not Found` | `"Order not found or not assigned to you"` |
| **Premature Rider Delivery** | `PATCH /rider/orders/:orderId/deliver` | Attempt to deliver order while status is still `ready` | `400 Bad Request` | `"Invalid order status transition... Order must be 'outForDelivery' first."` |
| **Inactive Rider Online Attempt** | `PATCH /rider/toggle-availability` | Rider with `status: "pending"` sets `isAvailable: true` | `400 Bad Request` | `"Cannot go online... Only active riders can go online."` |
| **Assign Inactive Rider** | `PATCH /admin/orders/:orderId/assign-rider` | Admin assigns rider whose `status === "blocked"` | `400 Bad Request` | `"Cannot assign rider. Rider is currently 'blocked'..."` |
| **Invalid Enum Status Update** | `PATCH /admin/customers/:customerId/status` | Send body `{"status": "superuser"}` | `400 Bad Request` | `"Invalid status... Allowed: pending, verified, suspended"` |
| **Tampered Payment Signature** | `POST /payment/verify` | Send invalid string for `razorpay_signature` | `400 Bad Request` | `"Payment signature verification failed"` |

---

## 6. Summary of Multi-Part File Upload APIs

In Thunder Client, select **Body ➔ Form-Data** for these endpoints:

| API Name | Method | URL | Form-Data File Key | File Types |
|---|---|---|---|---|
| Edit Profile Picture | `PUT` | `/common/edit-profile` | `displayPic` | JPG, PNG, WEBP |
| Restaurant Cover Photo | `PUT` | `/restaurant/update-cover-photo` | `coverImage` | JPG, PNG, WEBP |
| Restaurant Gallery Images | `PUT` | `/restaurant/update-restaurant-images` | `restaurantImages` (multi-select) | JPG, PNG, WEBP (up to 8) |
| Add Menu Item Dish Photo | `POST` | `/restaurant/add-menu-item` | `itemImage` | JPG, PNG, WEBP |
| Update Menu Item Photo | `PUT` | `/restaurant/menu-item/:itemId` | `itemImage` | JPG, PNG, WEBP |
| Rider KYC Documents | `PUT` | `/rider/upload-documents` | `drivingLicense`, `vehicleRC`, `insurance`, `aadharCard`, `panCard` | JPG, PNG, PDF |

---

## 7. Database ID Dependency Reference Map

```
               ┌─────────────┐
               │    User     │
               └──────┬──────┘
       ┌──────────────┼──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
 ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐
 │ Customer │  │ Restaurant │  │  Rider   │  │   Admin   │
 └────┬─────┘  └──────┬─────┘  └────┬─────┘  └───────────┘
      │               │             │
      │        ┌──────▼─────┐       │
      │        │    Menu    │       │
      │        │(menuItems) │       │
      │        └──────┬─────┘       │
      │               │             │
      └───────┬───────┴─────────────┘
              ▼
        ┌───────────┐
        │   Order   │ ◄─── Stores restaurantId, customerId, riderId, orderItems.itemId
        └─────┬─────┘
              ▼
        ┌───────────┐
        │  Payment  │ ◄─── Stores razorpayOrderId, razorpayPaymentId, razorpaySignature
        └───────────┘
```

* **`restaurantId`**: Generated when Restaurant Info is saved (`PUT /restaurant/update-restaurant-info`) or fetched via `GET /public/restaurants`.
* **`itemId`**: Generated in `Menu.menuItems` array when dish is added (`POST /restaurant/add-menu-item`).
* **`orderId`**: Generated when Customer checks out (`POST /order/create-order/:restaurantId`).
* **`riderId`**: Generated in `Riders` collection when rider profile is accessed (`GET /admin/riders`).

---

## 8. Thunder Client Testing Progress Checklist

- [ ] **1. Public APIs Tested** (`GET /`, `POST /public/contact-us`, `GET /public/restaurants`, `GET /public/restaurant-detail/:id`)
- [ ] **2. Auth Flow Tested** (`Register`, `Login`, `Send OTP`, `Verify OTP`, `Reset Password`, `Logout`)
- [ ] **3. Common User Settings Tested** (`Edit Profile Pic`, `Change Password`)
- [ ] **4. Restaurant Onboarding Tested** (`Profile`, `Legal`, `Address`, `Bank Info`, `Cover Photo`, `Open Status`)
- [ ] **5. Menu Catalog Tested** (`Add Menu Item`, `Get Menu`, `Update Item`, `Toggle Status`, `Delete Item`)
- [ ] **6. Rider Setup Tested** (`Profile`, `Vehicle Info`, `KYC Upload`, `Location Updates`)
- [ ] **7. Admin Supervision Tested** (`Dashboard Metrics`, `Customer Verification`, `Restaurant Approval`, `Rider Approval`)
- [ ] **8. Customer Operations Tested** (`Address Book CRUD`, `View History`)
- [ ] **9. Order Creation & Razorpay Payment Tested** (`Create Order`, `Create Razorpay Order`, `Verify Signature`)
- [ ] **10. Kitchen Workflow Tested** (`View Kitchen Orders`, `Preparing`, `Ready`)
- [ ] **11. Admin Dispatch Tested** (`Assign Rider to Order`)
- [ ] **12. Rider Execution Tested** (`Pickup`, `Out for Delivery`, `Deliver`, `Mark Undeliverable`, `Check Earnings`)
- [ ] **13. Customer Live Tracking Tested** (`GET /customer/orders/:orderId`)
- [ ] **14. Role Security & Negative Cases Tested** (Verified all 10 negative test cases return expected 401/403/400/404 codes)
