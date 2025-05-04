# Expense Tracker API

A RESTful API for an expense tracking application built with Express.js and PostgreSQL.

## Features

-   User authentication (register, login, profile management)
-   Category management for income and expenses
-   Transaction tracking with date and category classification
-   Financial analysis and reporting
-   Secure API with JWT authentication

## Database Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### User Routes

-   `POST /api/users/register` - Register a new user
-   `POST /api/users/login` - Login a user
-   `GET /api/users/profile` - Get user profile
-   `PUT /api/users/profile` - Update user profile
-   `DELETE /api/users/account` - Delete user account

### Category Routes

-   `POST /api/categories` - Create a new category
-   `GET /api/categories` - Get all categories (can filter by type)
-   `GET /api/categories/:id` - Get a specific category
-   `PUT /api/categories/:id` - Update a category
-   `DELETE /api/categories/:id` - Delete a category

### Transaction Routes

-   `POST /api/transactions` - Create a new transaction
-   `GET /api/transactions` - Get all transactions (with pagination)
-   `GET /api/transactions/:id` - Get a specific transaction
-   `PUT /api/transactions/:id` - Update a transaction
-   `DELETE /api/transactions/:id` - Delete a transaction
-   `GET /api/transactions/analysis/category-totals` - Get totals by category
-   `GET /api/transactions/analysis/monthly` - Get monthly income and expense totals

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
    ```
    PORT=3000
    PG_CONNECTION_STRING=your_postgres_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4. Start the server:
    - Development: `npm run dev`
    - Production: `npm start`

## Technology Stack

-   Node.js
-   Express.js
-   PostgreSQL
-   JWT Authentication
-   bcrypt (password hashing)
