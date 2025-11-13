# TallyPOS Backend API Documentation

Base URL: `http://localhost:3000`

## Authentication

All endpoints (except login) require JWT token in header:
```
Authorization: Bearer <access_token>
```

---

## 1. Authentication

### POST /auth/login
Login dan dapatkan JWT token

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 2. Users Management

### POST /users
Create new user (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "kasir01",
  "email": "kasir01@tallypos.com",
  "password": "password123",
  "fullName": "Kasir Satu",
  "role": "kasir"
}
```

**Roles:** `admin` | `kasir`

---

### GET /users
Get all users

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `search` (optional): Search by username, email, or full name

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "admin",
    "email": "admin@tallypos.com",
    "fullName": "Administrator",
    "role": "admin",
    "isActive": true,
    "createdAt": "2025-11-13T...",
    "updatedAt": "2025-11-13T..."
  }
]
```

---

### GET /users/:id
Get user by ID

**Headers:** `Authorization: Bearer <token>`

---

### PATCH /users/:id
Update user (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "newemail@tallypos.com",
  "isActive": true
}
```

---

### DELETE /users/:id
Delete user (Admin only)

**Headers:** `Authorization: Bearer <token>`

---

## 3. Categories

### POST /categories
Create category (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Makanan",
  "description": "Produk makanan dan snack"
}
```

---

### GET /categories
Get all categories

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `search` (optional): Search by name
- `isActive` (optional): Filter by active status

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Makanan",
    "description": "Produk makanan dan snack",
    "isActive": true,
    "createdAt": "2025-11-13T...",
    "updatedAt": "2025-11-13T..."
  }
]
```

---

### GET /categories/active
Get only active categories

**Headers:** `Authorization: Bearer <token>`

---

### GET /categories/:id
Get category by ID

**Headers:** `Authorization: Bearer <token>`

---

### PATCH /categories/:id
Update category (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Category",
  "description": "Updated description",
  "isActive": true
}
```

---

### PATCH /categories/:id/toggle-active
Toggle category active status (Admin only)

**Headers:** `Authorization: Bearer <token>`

---

### DELETE /categories/:id
Delete category (Admin only)

**Headers:** `Authorization: Bearer <token>`

---

## 4. Products

### POST /products
Create product (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "categoryId": "uuid",
  "sku": "PRD-001",
  "barcode": "1234567890123",
  "name": "Indomie Goreng",
  "description": "Mie instan rasa goreng",
  "purchasePrice": 2500,
  "sellingPrice": 3500,
  "stock": 100,
  "minStock": 10,
  "unit": "pcs",
  "imageUrl": "https://example.com/image.jpg"
}
```

---

### GET /products
Get all products

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `search` (optional): Search by name, SKU, or barcode
- `categoryId` (optional): Filter by category
- `isActive` (optional): Filter by active status

**Response:**
```json
[
  {
    "id": "uuid",
    "categoryId": "uuid",
    "sku": "PRD-001",
    "barcode": "1234567890123",
    "name": "Indomie Goreng",
    "description": "Mie instan rasa goreng",
    "purchasePrice": "2500.00",
    "sellingPrice": "3500.00",
    "stock": 100,
    "minStock": 10,
    "unit": "pcs",
    "imageUrl": "https://example.com/image.jpg",
    "isActive": true,
    "createdAt": "2025-11-13T...",
    "updatedAt": "2025-11-13T...",
    "category": {
      "id": "uuid",
      "name": "Makanan"
    }
  }
]
```

---

### GET /products/active
Get only active products

**Headers:** `Authorization: Bearer <token>`

---

### GET /products/low-stock
Get products with low stock (stock <= minStock)

**Headers:** `Authorization: Bearer <token>`

---

### GET /products/sku/:sku
Get product by SKU

**Headers:** `Authorization: Bearer <token>`

---

### GET /products/barcode/:barcode
Get product by barcode

**Headers:** `Authorization: Bearer <token>`

---

### GET /products/:id
Get product by ID

**Headers:** `Authorization: Bearer <token>`

---

### PATCH /products/:id
Update product (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "sellingPrice": 4000,
  "stock": 150
}
```

---

### PATCH /products/:id/stock
Update product stock (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 50
}
```

---

### PATCH /products/:id/toggle-active
Toggle product active status (Admin only)

**Headers:** `Authorization: Bearer <token>`

---

### DELETE /products/:id
Delete product (Admin only)

**Headers:** `Authorization: Bearer <token>`

---

## 5. Customers

### POST /customers
Create customer

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "081234567890",
  "email": "john@example.com",
  "address": "Jl. Contoh No. 123"
}
```

---

### GET /customers
Get all customers

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `search` (optional): Search by name, phone, or email

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "phone": "081234567890",
    "email": "john@example.com",
    "address": "Jl. Contoh No. 123",
    "totalTransactions": 5,
    "totalSpent": "150000.00",
    "createdAt": "2025-11-13T...",
    "updatedAt": "2025-11-13T..."
  }
]
```

---

### GET /customers/top
Get top customers by spending (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `limit` (optional, default: 10): Number of customers

---

### GET /customers/phone/:phone
Get customer by phone number

**Headers:** `Authorization: Bearer <token>`

---

### GET /customers/:id
Get customer by ID

**Headers:** `Authorization: Bearer <token>`

---

### PATCH /customers/:id
Update customer

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "081234567890",
  "email": "newemail@example.com",
  "address": "New Address"
}
```

---

### DELETE /customers/:id
Delete customer (Admin only)

**Headers:** `Authorization: Bearer <token>`

---

## 6. Transactions

### POST /transactions
Create new transaction

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "discountAmount": 0
    },
    {
      "productId": "uuid",
      "quantity": 1,
      "discountAmount": 500
    }
  ],
  "discountPercentage": 0,
  "discountAmount": 0,
  "taxAmount": 0,
  "paymentMethod": "cash",
  "paymentAmount": 50000,
  "notes": "Transaksi pelanggan VIP"
}
```

**Payment Methods:** `cash` | `debit` | `credit` | `qris` | `transfer`

**Response:**
```json
{
  "id": "uuid",
  "transactionCode": "TRX-20251113-00001",
  "userId": "uuid",
  "customerId": "uuid",
  "transactionDate": "2025-11-13T...",
  "subtotal": "7000.00",
  "discountAmount": "500.00",
  "discountPercentage": "0.00",
  "taxAmount": "0.00",
  "totalAmount": "6500.00",
  "paymentMethod": "cash",
  "paymentAmount": "50000.00",
  "changeAmount": "43500.00",
  "notes": "Transaksi pelanggan VIP",
  "status": "completed",
  "details": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Indomie Goreng",
      "quantity": 2,
      "unitPrice": "3500.00",
      "discountAmount": "0.00",
      "subtotal": "7000.00"
    }
  ]
}
```

---

### GET /transactions
Get all transactions

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `startDate` (optional): Filter start date (YYYY-MM-DD)
- `endDate` (optional): Filter end date (YYYY-MM-DD)
- `userId` (optional): Filter by user/kasir
- `status` (optional): Filter by status

**Status:** `completed` | `cancelled` | `refunded`

---

### GET /transactions/report
Get sales report (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `startDate` (optional): Report start date
- `endDate` (optional): Report end date

**Response:**
```json
{
  "totalTransactions": 10,
  "totalRevenue": "150000.00",
  "totalDiscount": "5000.00",
  "totalTax": "0.00",
  "totalProfit": "50000.00",
  "transactions": [...]
}
```

---

### GET /transactions/code/:code
Get transaction by code

**Headers:** `Authorization: Bearer <token>`

---

### GET /transactions/:id
Get transaction by ID

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "transactionCode": "TRX-20251113-00001",
  "transactionDate": "2025-11-13T...",
  "subtotal": "7000.00",
  "totalAmount": "6500.00",
  "paymentMethod": "cash",
  "status": "completed",
  "user": {
    "id": "uuid",
    "username": "admin",
    "fullName": "Administrator"
  },
  "customer": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "081234567890"
  },
  "details": [
    {
      "id": "uuid",
      "productName": "Indomie Goreng",
      "quantity": 2,
      "unitPrice": "3500.00",
      "subtotal": "7000.00",
      "product": {
        "id": "uuid",
        "name": "Indomie Goreng",
        "sku": "PRD-001"
      }
    }
  ]
}
```

---

### PATCH /transactions/:id/cancel
Cancel transaction (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Note:** Will restore product stock

---

## 7. Transaction Details

### GET /transaction-details/transaction/:transactionId
Get all details from one transaction

**Headers:** `Authorization: Bearer <token>`

---

### GET /transaction-details/product/:productId
Get product sales history (Admin only)

**Headers:** `Authorization: Bearer <token>`

---

### GET /transaction-details/product/:productId/stats
Get product sales statistics (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "productId": "uuid",
  "totalQuantity": 50,
  "totalRevenue": "175000.00",
  "totalTransactions": 25,
  "averageQuantityPerTransaction": 2.0,
  "details": [...]
}
```

---

### GET /transaction-details/top-selling
Get top selling products (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `limit` (optional, default: 10): Number of products

**Response:**
```json
[
  {
    "productId": "uuid",
    "productName": "Indomie Goreng",
    "totalQuantity": 100,
    "totalRevenue": "350000.00",
    "transactionCount": 50
  }
]
```

---

### GET /transaction-details/:id
Get detail by ID

**Headers:** `Authorization: Bearer <token>`

---

## 8. Stock Movements

### POST /stock-movements
Create manual stock movement (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "uuid",
  "type": "in",
  "quantity": 50,
  "referenceType": "purchase",
  "referenceId": "PO-001",
  "notes": "Pembelian dari supplier"
}
```

**Movement Types:**
- `in` - Pembelian/restok (quantity positive)
- `out` - Penjualan (quantity negative)
- `adjustment` - Koreksi stok opname
- `return` - Retur dari customer (quantity positive)
- `damaged` - Barang rusak (quantity negative)

**Response:**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "userId": "uuid",
  "type": "in",
  "quantity": 50,
  "stockBefore": 100,
  "stockAfter": 150,
  "referenceType": "purchase",
  "referenceId": "PO-001",
  "notes": "Pembelian dari supplier",
  "createdAt": "2025-11-13T...",
  "product": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "sku": "PRD-001"
  },
  "user": {
    "id": "uuid",
    "username": "admin"
  }
}
```

---

### GET /stock-movements
Get all stock movements (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `productId` (optional): Filter by product
- `type` (optional): Filter by movement type
- `startDate` (optional): Start date
- `endDate` (optional): End date

---

### GET /stock-movements/product/:productId
Get stock movement history for a product (last 100)

**Headers:** `Authorization: Bearer <token>`

---

### GET /stock-movements/product/:productId/summary
Get stock movement summary for a product (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `startDate` (optional)
- `endDate` (optional)

**Response:**
```json
{
  "productId": "uuid",
  "totalIn": 200,
  "totalOut": 150,
  "totalAdjustment": 5,
  "totalReturn": 10,
  "totalDamaged": 3,
  "movementCount": 50,
  "movements": [...]
}
```

---

### GET /stock-movements/reference/:referenceType/:referenceId
Get movements by reference (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Example:** `/stock-movements/reference/transaction/TRX-20251113-00001`

---

### GET /stock-movements/type/:type
Get movements by type (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Example:** `/stock-movements/type/in`

---

### GET /stock-movements/:id
Get movement by ID

**Headers:** `Authorization: Bearer <token>`

---

## Error Responses

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Notes for Frontend Development

### 1. Authentication Flow
1. Call `POST /auth/login` to get access token
2. Store token in localStorage/sessionStorage
3. Add token to every API request header: `Authorization: Bearer <token>`
4. Handle 401 errors (token expired) → redirect to login

### 2. Role-Based Access Control
- **Admin**: Full access to all endpoints
- **Kasir**: Limited access (cannot create/delete users, view reports)

Check user role from JWT token payload or user profile endpoint.

### 3. Transaction Flow
1. Search/scan product by barcode: `GET /products/barcode/:barcode`
2. Add items to cart (frontend state)
3. Calculate totals including discounts and tax
4. Create transaction: `POST /transactions`
5. Get transaction detail: `GET /transactions/:id`
6. Print receipt (use transaction data)

### 4. Stock Management
- Products automatically update stock when transaction is created
- Stock movements are logged automatically for transactions
- Manual stock adjustments via `POST /stock-movements`
- Check low stock alerts: `GET /products/low-stock`

### 5. Customer Lookup
- Quick search by phone: `GET /customers/phone/:phone`
- Use for customer selection during checkout
- Walk-in customer is pre-seeded in database

### 6. Date Filtering
Use ISO date format: `YYYY-MM-DD`
- Example: `?startDate=2025-11-01&endDate=2025-11-30`

### 7. Pagination
Current API returns all results. For large datasets, implement pagination on frontend or request backend pagination feature.

### 8. Search Optimization
All search parameters are case-insensitive partial matches.

---

## Postman Collection

Import this into Postman for quick testing:

**Base Setup:**
- Variable: `baseUrl` = `http://localhost:3000`
- Variable: `token` = Get from login response

**Example Requests:**

```javascript
// Login
POST {{baseUrl}}/auth/login
Body: {"username":"admin","password":"admin123"}

// Get Products (with token)
GET {{baseUrl}}/products
Headers: Authorization: Bearer {{token}}

// Create Transaction
POST {{baseUrl}}/transactions
Headers: Authorization: Bearer {{token}}
Body: {
  "customerId": "uuid",
  "items": [{"productId":"uuid","quantity":2}],
  "paymentMethod": "cash",
  "paymentAmount": 10000
}
```

---

## Database Seeded Data

### Users
- Username: `admin`
- Password: `admin123`
- Role: `admin`

### Categories
- Makanan
- Minuman
- Perlengkapan

### Customers
- Walk-in Customer (default for non-member transactions)

---

## Support

For issues or questions, check:
- API logs: `docker-compose logs -f backend-dev`
- Database: Connect to PostgreSQL container
- Code: GitHub repository

**Happy Coding! 🚀**
