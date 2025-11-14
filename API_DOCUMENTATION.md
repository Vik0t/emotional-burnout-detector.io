# Emotional Burnout Detection System - API Documentation

## Overview
This document provides documentation for the RESTful API of the Emotional Burnout Detection System. The API is built with Node.js and Express, using SQLite as the database.

## Base URL
```
http://localhost:3002/api
```

## Authentication
Most endpoints require an employee ID for identification. There's no separate authentication token system.

## API Endpoints

### User Management

#### Create or Update User
```
POST /users
```

**Request Body:**
```json
{
  "employee_id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "employee_id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "is_admin": boolean
}
```

#### Get User Information
```
GET /users/:employeeId
```

**Response:**
```json
{
  "id": number,
  "employee_id": "string",
  "telegram_chat_id": "string",
  "is_admin": boolean,
  "created_at": "datetime",
  "last_login": "datetime",
  "department": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "last_test_date": "datetime",
  "next_test_date": "datetime",
  "notifications_enabled": boolean
}
```

#### Update User Test Information
```
PUT /users/:employeeId/test-info
```

**Request Body:**
```json
{
  "last_test_date": "datetime",
  "next_test_date": "datetime",
  "notifications_enabled": boolean
}
```

**Response:**
```json
{
  "success": true
}
```

### Test Results

#### Save Test Results
```
POST /test-results
```

**Request Body:**
```json
{
  "employeeId": "string",
  "emotionalExhaustion": number,
  "depersonalization": number,
  "personalAccomplishment": number,
  "totalScore": number,
  "answers": array
}
```

**Response:**
```json
{
  "success": true,
  "id": number
}
```

#### Get Latest Test Result
```
GET /test-results/:employeeId
```

**Response:**
```json
{
  "id": number,
  "employee_id": "string",
  "emotional_exhaustion": number,
  "depersonalization": number,
  "personal_accomplishment": number,
  "total_score": number,
  "answers": array,
  "created_at": "datetime"
}
```

#### Get Test History
```
GET /test-results/:employeeId/history
```

**Response:**
```json
[
  {
    "id": number,
    "emotional_exhaustion": number,
    "depersonalization": number,
    "personal_accomplishment": number,
    "total_score": number,
    "created_at": "datetime"
  }
]
```

### Chat Messages

#### Save Chat Message
```
POST /chat-messages
```

**Request Body:**
```json
{
  "employeeId": "string",
  "message": "string",
  "response": "string"
}
```

**Response:**
```json
{
  "success": true,
  "id": number
}
```

#### Get Chat History
```
GET /chat-messages/:employeeId
```

**Response:**
```json
[
  {
    "message": "string",
    "response": "string",
    "created_at": "datetime"
  }
]
```

### Chatbot

#### Generate Chatbot Response
```
POST /chatbot/response
```

**Request Body:**
```json
{
  "employeeId": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "response": "string"
}
```

### HR Dashboard

#### Get Employee Statistics
```
GET /hr/employees
```

**Response:**
```json
[
  {
    "employee_id": "string",
    "is_admin": boolean,
    "created_at": "datetime",
    "last_login": "datetime",
    "test_count": number,
    "last_test_date": "datetime",
    "last_score": number
  }
]
```

#### Get Risk Distribution
```
GET /hr/risk-distribution
```

**Response:**
```json
{
  "high": number,
  "medium": number,
  "low": number
}
```

#### Get Department Statistics
```
GET /hr/departments
```

**Response:**
```json
[
  {
    "name": "string",
    "avg_score": number,
    "at_risk": number,
    "employees": number
  }
]
```

#### Get HR Statistics
```
GET /hr/statistics
```

**Response:**
```json
{
  "total_employees": number,
  "recent_tests": number,
  "high_risk_count": number,
  "medium_risk_count": number,
  "low_risk_count": number
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT UNIQUE NOT NULL,
  telegram_chat_id TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  department TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  last_test_date DATETIME,
  next_test_date DATETIME,
  notifications_enabled BOOLEAN DEFAULT TRUE
);
```

### Test Results Table
```sql
CREATE TABLE test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL,
  emotional_exhaustion INTEGER NOT NULL,
  depersonalization INTEGER NOT NULL,
  personal_accomplishment INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  answers TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users (employee_id)
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users (employee_id)
);
```

## Error Handling
All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```

## Testing
The system includes a comprehensive test suite that can be run with:
```
npm test
```

## Deployment
To deploy the backend server:
1. Install dependencies: `npm install`
2. Initialize the database: `node scripts/init-db.js`
3. Start the server: `npm start`

The server will run on port 3002 by default.