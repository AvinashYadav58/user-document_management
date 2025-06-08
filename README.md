# User Document Management

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This project is a backend service built using the [NestJS](https://nestjs.com/) framework. It provides user authentication, document management, and ingestion controls. The project integrates with AWS RDS for database management and is designed to be efficient and scalable.

## Features

- User Authentication: Register, login, logout, and role-based access control (admin, editor, viewer).
- User Management: Admin-only functionality for managing user roles and permissions.
- Document Management: CRUD operations for user documents.
- Ingestion Management: Handles document ingestion pipelines.

## Prerequisites

- Node.js (v16 or later)
- NPM or Yarn
- AWS RDS (PostgreSQL instance configured)

## Project Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AvinashYadav58/user-document_management.git
   ```

2. **Navigate to the Project Directory**
   ```bash
   cd user-document_management
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

4. **Configure Environment Variables**
   - Create a `.env.stage.dev` file:
     ```bash
     cp .env.example .env.stage.dev
     ```
   - Update the `.env.stage.dev` file with your AWS RDS and application configuration:
     ```env
     DB_HOST=<your-rds-endpoint>
     DB_PORT=5432
     DB_USERNAME=<your-db-username>
     DB_PASSWORD=<your-db-password>
     DB_DATABASE=<your-db-name>
     JWT_SECRET=<your-jwt-secret>
     STAGE=dev
     ```

## Running the Application

- **Development Mode** (with live reload):
  ```bash
  npm run start:dev
  ```

- **Production Mode**:
  ```bash
  npm run build
  npm run start:prod
  ```

- **Debug Mode**:
  ```bash
  npm run start:debug
  ```

## Running Tests

- **Unit Tests**:
  ```bash
  npm run test
  ```

- **E2E Tests**:
  ```bash
  npm run test:e2e
  ```

- **Coverage**:
  ```bash
  npm run test:cov
  ```

## Accessing the Application

The application runs on `http://localhost:3000` by default. Use tools like Postman or cURL to interact with the APIs.

## Deployment

No additional database setup is required as the project integrates directly with AWS RDS. Ensure the necessary security groups are configured to allow access to your RDS instance from the deployment environment.

## License

This project is [MIT licensed](LICENSE).
