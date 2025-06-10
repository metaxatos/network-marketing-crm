# Network Marketing CRM API Documentation

## Overview
This API provides all backend functionality for the Network Marketing CRM application. All endpoints follow RESTful conventions and return consistent JSON responses.

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
Most endpoints require authentication using Bearer tokens from Supabase Auth.

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format
All responses follow this format:
```json
{
  "data": {},
  "success": true,
  "message": "Optional message"
}
```

## Implemented Endpoints

### 🔐 Authentication

#### POST /api/auth/login
Login with email and password.
```json
Request: {
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "user": { "id", "email", "profile" },
  "session": "token"
}
```

#### POST /api/auth/signup
Create a new account.
```json
Request: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/logout
Logout current user (requires auth).

#### GET /api/auth/user
Get current user details (requires auth).

### 📊 Dashboard

#### GET /api/dashboard/metrics
Get dashboard metrics including contacts, emails, and training progress.

#### GET /api/dashboard/activities
Get paginated activity feed.
Query params: `page`, `limit`

#### GET /api/dashboard/quick-actions
Get suggested actions based on user context.

### 👥 Contact Management

#### GET /api/contacts
List contacts with search and filtering.
Query params: `search`, `status`, `page`, `limit`, `cursor`

#### POST /api/contacts
Create a new contact.
```json
Request: {
  "name": "Jane Smith",
  "phone": "+1234567890",
  "email": "jane@example.com",
  "status": "lead",
  "tags": ["new"]
}
```

#### GET /api/contacts/[id]
Get single contact with notes and interactions.

#### PUT /api/contacts/[id]
Update contact details.

#### DELETE /api/contacts/[id]
Delete a contact.

#### POST /api/contacts/[id]/notes
Add a note to a contact.
```json
Request: {
  "content": "Had a great conversation"
}
```

### 📧 Email System

#### GET /api/email-templates
Get available email templates for the company.

#### POST /api/emails/send
Send an email using a template.
```json
Request: {
  "contactId": "uuid",
  "templateId": "uuid",
  "variables": {
    "custom_message": "Personal note"
  }
}
```

#### GET /api/emails/history
Get sent email history.
Query params: `page`, `limit`

#### PUT /api/emails/[id]/status
Update email status (sent, failed, bounced).

### 🎓 Training System

#### GET /api/training/courses
Get all courses with user progress.

#### POST /api/training/enroll
Enroll in a course.
```json
Request: {
  "courseId": "uuid"
}
```

#### POST /api/training/progress
Update video progress.
```json
Request: {
  "videoId": "uuid",
  "positionSeconds": 125,
  "completed": false
}
```

#### GET /api/training/[courseId]
Get course details with videos and progress.

### 🌐 Landing Pages

#### GET /api/public/pages/[slug]
Get public landing page (no auth required).

#### POST /api/public/pages/[slug]/capture
Capture lead from landing page (no auth required).
```json
Request: {
  "name": "New Lead",
  "email": "lead@example.com",
  "phone": "+1234567890",
  "utmSource": "facebook"
}
```

#### GET /api/landing-pages
Get user's landing pages with stats (requires auth).

#### PUT /api/landing-pages/[id]
Update landing page content (requires auth).
```json
Request: {
  "title": "New Title",
  "isPublished": true,
  "content": { "sections": [...] }
}
```

## Error Handling

### Error Response Format
```json
{
  "data": null,
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid token
- `403` Forbidden - No access to resource
- `404` Not Found - Resource doesn't exist
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server error

## Rate Limiting
- Login: 5 attempts per minute per IP
- Signup: 3 attempts per hour per IP
- General API: 100 requests per minute per user

## Security Features
- JWT-based authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Row Level Security (RLS)
- Activity logging

## Testing
Use the `test-endpoints.http` file with VS Code REST Client extension to test all endpoints.

## Next Steps
- Implement remaining endpoints if needed
- Add WebSocket support for real-time features
- Implement file upload endpoints
- Add batch operations for contacts
- Implement export functionality 