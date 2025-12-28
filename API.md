# OpenSign API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // Optional: "user" (default), "referrer", or "admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get Current User
**GET** `/auth/me`

Get the authenticated user's profile.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "commissionRate": 5,
    "totalCommissionEarned": 1500.00
  }
}
```

---

## Documents

### Create Document
**POST** `/documents`

Upload a new document for signing.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
- `file`: PDF or image file (max 10MB)
- `title`: Document title
- `description`: Optional description
- `signers`: JSON string of signers array

**Example signers JSON:**
```json
[
  {
    "email": "signer1@example.com",
    "name": "Signer One"
  },
  {
    "email": "signer2@example.com",
    "name": "Signer Two"
  }
]
```

**Response:**
```json
{
  "success": true,
  "document": {
    "_id": "doc_id",
    "title": "Loan Agreement",
    "fileUrl": "https://spaces.example.com/file",
    "owner": "user_id",
    "signers": [...],
    "status": "draft"
  }
}
```

### Get All Documents
**GET** `/documents`

Get all documents where user is owner or signer.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "documents": [...]
}
```

### Get Document by ID
**GET** `/documents/:id`

Get a single document with signed URL for file access.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "document": {
    "_id": "doc_id",
    "title": "Loan Agreement",
    "fileUrl": "https://spaces.example.com/file",
    "fileSignedUrl": "https://temporary-signed-url",
    "owner": {...},
    "signers": [...],
    "status": "pending"
  }
}
```

### Sign Document
**POST** `/documents/:id/sign`

Sign a document as one of the signers.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "signatureData": "base64_signature_image_data"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document signed successfully",
  "document": {...}
}
```

### Send Signature Request
**POST** `/documents/:id/send`

Send signature request emails to all signers.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Signature requests sent successfully"
}
```

### Delete Document
**DELETE** `/documents/:id`

Delete a document (owner only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## Leads

### Create Lead
**POST** `/leads`

Create a new business loan lead.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "ABC Corporation",
  "email": "contact@abccorp.com",
  "phone": "555-1234",
  "company": "ABC Corp",
  "loanAmount": 100000,
  "loanType": "business",  // business, equipment, real_estate, working_capital, other
  "source": "referral",     // website, referral, cold_call, email, other
  "referrer": "referrer_user_id",  // Optional
  "assignedTo": "user_id"          // Optional
}
```

**Response:**
```json
{
  "success": true,
  "lead": {...}
}
```

### Get All Leads
**GET** `/leads`

Get all leads accessible to the user.

**Query Parameters:**
- `status`: Filter by status (new, contacted, qualified, proposal_sent, negotiating, won, lost)
- `loanType`: Filter by loan type
- `source`: Filter by source

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "leads": [...]
}
```

### Get Lead by ID
**GET** `/leads/:id`

Get a single lead with full details.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "lead": {
    "_id": "lead_id",
    "name": "ABC Corporation",
    "email": "contact@abccorp.com",
    "loanAmount": 100000,
    "status": "qualified",
    "notes": [...],
    "documents": [...]
  }
}
```

### Update Lead
**PUT** `/leads/:id`

Update lead information.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "won",
  "loanAmount": 150000,
  "assignedTo": "new_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "lead": {...}
}
```

### Add Note to Lead
**POST** `/leads/:id/notes`

Add a note to a lead.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Called client, they're interested in proceeding"
}
```

**Response:**
```json
{
  "success": true,
  "lead": {...}
}
```

### Delete Lead
**DELETE** `/leads/:id`

Delete a lead (admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

## Commissions

### Create Commission
**POST** `/commissions` (Admin only)

Create a new commission record.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "referrer": "referrer_user_id",
  "lead": "lead_id",
  "loanAmount": 100000,
  "rate": 5,  // Percentage
  "document": "document_id",  // Optional
  "notes": "Commission for Q4 2023"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "commission": {
    "_id": "commission_id",
    "amount": 5000,
    "status": "pending"
  }
}
```

### Get All Commissions
**GET** `/commissions`

Get all commissions for the user (or all if admin).

**Query Parameters:**
- `status`: Filter by status (pending, approved, paid, cancelled)

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 15,
  "totals": {
    "total": 25000,
    "pending": 5000,
    "approved": 8000,
    "paid": 12000
  },
  "commissions": [...]
}
```

### Get Commission by ID
**GET** `/commissions/:id`

Get a single commission.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "commission": {...}
}
```

### Update Commission
**PUT** `/commissions/:id` (Admin only)

Update commission status.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "paid",
  "notes": "Paid via wire transfer"
}
```

**Response:**
```json
{
  "success": true,
  "commission": {...}
}
```

### Delete Commission
**DELETE** `/commissions/:id` (Admin only)

Delete a commission.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Commission deleted successfully"
}
```

---

## Users

### Get All Users
**GET** `/users` (Admin only)

Get all users in the system.

**Query Parameters:**
- `role`: Filter by role (user, referrer, admin)
- `active`: Filter by active status (true/false)

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 50,
  "users": [...]
}
```

### Get User by ID
**GET** `/users/:id`

Get a single user (own profile or admin).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

### Update User
**PUT** `/users/:id`

Update user information.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "referrer",  // Admin only
  "commissionRate": 7,  // Admin only
  "active": true  // Admin only
}
```

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

### Delete User
**DELETE** `/users/:id` (Admin only)

Delete a user.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Get Referrers List
**GET** `/users/referrers/list`

Get all active referrers.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "referrers": [...]
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "message": "Error message here",
  "errors": [
    {
      "msg": "Validation error message",
      "param": "field_name"
    }
  ]
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

API endpoints are rate limited to 100 requests per 15 minutes per IP address to prevent abuse.
