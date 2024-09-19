# NestJS User Management API

This project is a RESTful API built with NestJS for managing user accounts. It includes features such as user login, authentication, and CRUD operations for user management.

## Features

- User login
- JWT-based authentication
- CRUD operations for user management
- Password strength validation

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js v20.17.0
- pnpm
- PostgreSQL (installed and running)

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```
   cd user-management
   ```

3. Install the dependencies:

   ```
   pnpm install
   ```

4. Set up your environment variables by creating a `.env` file in the root directory. Use the `.env.example` file as a template.

5. Run Database migrations:

   ```
   pnpx prisma migrate deploy
   ```

## Running the Application

To run the application in development mode:

```
pnpm run start:dev
```

The API will be available at `http://localhost:YOUR-HTTP-PORT` by default.

## Swagger API Documentation

The Swagger API will be available at `http://localhost:YOUR-HTTP-PORT/api` by default.

## API Endpoints

- `POST /auth/login` - User login
- `POST /users` - Create a new user (protected route)
- `GET /users` - Get all users (protected route)
- `GET /users/:id` - Get a specific user (protected route)
- `PUT /users/:id` - Update a user (protected route)
- `DELETE /users/:id` - Delete a user (protected route)

## Running Tests

To run the test suite:

```
pnpm run test
```
