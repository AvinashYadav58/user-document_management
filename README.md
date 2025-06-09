# User Document Management

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This project is a modular, scalable, and cloud-ready backend service built using the NestJS framework. It is designed to manage user authentication, role-based access control, document management, and document ingestion workflows. The system is engineered with a strong emphasis on code quality, testability, and maintainability, aligning with production-grade standards even if some features remain in a prototype state.

## Features

- User Authentication: Register, login, logout, and role-based access control (admin, editor, viewer).
- User Management: Admin-only functionality for managing user roles and permissions.
- Document Management: CRUD operations for user documents. AWS S3 integration for secure document storage.
- Ingestion Management: APIs to trigger and manage ingestion pipelines for document processing.

## Prerequisites

Before running this project, ensure the following services are properly configured:

### 1. AWS S3 Bucket Setup

This project uses AWS S3 for secure document storage.

#### Steps:

- Sign in to the [AWS Console](https://aws.amazon.com/console/).
- Go to **S3** and create a new bucket:
  - Bucket Name: (e.g., `document_store`)
  - Region: `ap-south-1`
- Go to **IAM**, create a user with **Programmatic Access**:
  - Attach the `AmazonS3FullAccess` policy (or a custom policy with minimal permissions).
  - Save the **Access Key ID** and **Secret Access Key** for environment configuration.

### 2. PostgreSQL Database Setup

This project supports using **either a local PostgreSQL instance** or **AWS RDS**.

#### Option A: Local PostgreSQL

Install PostgreSQL from [https://www.postgresql.org/download/](https://www.postgresql.org/download/) if you haven't already.

Default configuration:

- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: *(set during installation)*

Create the database: user_document_management



#### Option B: AWS RDS (PostgreSQL)

If you prefer a managed cloud database, you can use **Amazon RDS** to host your PostgreSQL instance.

##### Steps to Set Up RDS:

##### 1. **Log in** to the [AWS Management Console](https://console.aws.amazon.com/).

##### 2. **Navigate** to the **RDS** service.

##### 3. **Create a new PostgreSQL database**:
   - **Engine**: PostgreSQL
   - **DB Identifier**: `user-document-management`
   - **Master Username**: `postgres`
   - **Master Password**: `<your-db-password>`
   - **DB Name**: `user_document_management`

##### 4. **Enable Public Access**:
   - During setup, enable public accessibility **if you plan to connect from your local machine**.

##### 5. **Configure Security Group**:
   - Go to **VPC > Security Groups**.
   - Find the security group associated with your RDS instance.
   - Add an **Inbound Rule**:
     - **Type**: PostgreSQL
     - **Port**: `5432`
     - **Source**: Your IP (e.g., `203.0.113.0/32`)

##### 6. **Note down your RDS connection details**:
   - **Endpoint** (used as `DB_HOST` in your `.env.stage.dev`)
   - **Port** (typically `5432`)




## Project Setup

### 1. **Clone the Repository**

   ```bash
   git clone https://github.com/AvinashYadav58/user_document_management.git
   ```

### 2. **Navigate to the Project Directory**

   ```bash
   cd user_document_management
   ```

### 3. **Install Dependencies**

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

### 4. **Configure Environment Variables**

   - Create a `.env.stage.dev` file in the root directory of the project.
     
   - Update the `.env.stage.dev` file with your AWS RDS, AWS S3 bucket and application configuration:

     ```env
      AWS_ACCESS_KEY_ID='<your-aws-access-key>'
      AWS_SECRET='<your-aws-secret-key>'
      AWS_REGION='ap-south-1'
      AWS_BUCKET_NAME='cricket-arabia'
      DB_HOST='<your-db-host>'
      DB_PORT='5432'
      DB_USERNAME='postgres'
      DB_PASSWORD='<your-db-password>'
      DB_DATABASE='user_document_management'
      JWT_SECRET='<your-jwt-secret>'

     ```

## Running the Application

- **Install packages**:

  ```bash
  npm install
  ```

- **Development Mode** (with live reload):

  ```bash
  npm run start:dev
  ```

- **Production Mode**:

  ```bash
  npm run build
  npm run start:prod
  ```

## Running Tests

- **Unit Tests**:

  ```bash
  npm run test
  ```

- **Coverage**:
  ```bash
  npm run test:cov
  ```

## Accessing the Application

The application runs on `http://localhost:3000` by default. Use tools like Postman or cURL to interact with the APIs.



## User Document Management API Documentation
This document provides a comprehensive overview of the available APIs in the User Document Management system. It explains each API's purpose, request methods, required headers, payloads, and expected responses. The document also highlights role-based access control for each endpoint.


### Authentication APIs
#### 1. Sign Up
Purpose: Register a new user in the system.
 Endpoint: POST /auth/signup
 Request Example:
curl --location 'http://localhost:3000/auth/signup' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=avinash23' \
--data-urlencode 'password=StrongPass123!'

Response:
200 OK: User registered successfully.



#### 2. Sign In
Purpose: Authenticate a user and provide an access token.
 Endpoint: POST /auth/signin
 Request Example:
curl --location 'http://localhost:3000/auth/signin' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=avinash22' \
--data-urlencode 'password=StrongPass123!'

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
}


### User Management APIs
#### 1. Get Self Profile
Purpose: Retrieve the profile details of the currently authenticated user.
 Endpoint: GET /users/profile
 Request Example:
curl --location 'http://localhost:3000/users/profile' \
--header 'Authorization: Bearer <access-token>'

Response: User details.

#### 2. Get User Details
Purpose: Retrieve details of a specific user by their ID.
 Endpoint: GET /users/:userId/user
 Request Example:
curl --location 'http://localhost:3000/users/<userId>/user' \
--header 'Authorization: Bearer <access-token>'

Access Control: Admin only.

#### 3. Get All Users
Purpose: Retrieve a list of all registered users.
 Endpoint: GET /users
 Request Example:
curl --location 'http://localhost:3000/users' \
--header 'Authorization: Bearer <access-token>'

Access Control: Admin only.

#### 4. Update User Role
Purpose: Modify the role of a specific user.
 Endpoint: PATCH /users/:userId/role
 Request Example:
curl --location --request PATCH 'http://localhost:3000/users/<userId>/role' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <access-token>' \
--data '{"role": "Editor"}'

Access Control: Admin only.

#### 5. Delete user
Purpose: Delete a specific user.
 Endpoint: DELETE /users/:userId
 Request Example:
curl --location --request DELETE 'http://localhost:3000/users/305baa3b-8cb0-4116-a0a7-f12e74f119d4' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2aW5hc2gyMiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc0OTQ0Mzg1MSwiZXhwIjoxNzQ5NDUxMDUxfQ.ukxtV4OjFplileEhvlkxwv7jZ22PoFJKAN3vv8aSOBk'

Access Control: Admin only.

### Document Management APIs
#### 1. Upload Document
Purpose: Upload a new document.
 Endpoint: POST /documents
 Request Example:
curl --location 'http://localhost:3000/documents' \
--header 'Authorization: Bearer <access-token>' \
--form 'file=@"/path/to/file.jpg"' \
--form 'title="Document Title"' \
--form 'description="Document Description"' \
--form 'author="Author Name"'

Access Control: Admin and Editor only.

#### 2. Get All Documents
Purpose: Retrieve all documents.
 Endpoint: GET /documents
 Request Example:
curl --location 'http://localhost:3000/documents' \
--header 'Authorization: Bearer <access-token>'


#### 3. Get Document by ID
Purpose: Retrieve details of a specific document by its ID.
 Endpoint: GET /documents/:documentId
 Request Example:
curl --location 'http://localhost:3000/documents/<documentId>' \
--header 'Authorization: Bearer <access-token>'


#### 4. Update Document
Purpose: Update an existing document.
 Endpoint: PATCH /documents/:documentId
 Request Example:
curl --location --request PATCH 'http://localhost:3000/documents/<documentId>' \
--header 'Content-Type: application/json' \
--data '{"title":"Updated Title","description":"Updated Description","author":"Updated Author"}'

Access Control: Admin and Editor only.

#### 5. Delete Document
Purpose: Delete a specific document.
 Endpoint: DELETE /documents/:documentId
 Request Example:
curl --location --request DELETE 'http://localhost:3000/documents/<documentId>' \
--header 'Authorization: Bearer <access-token>'

Access Control: Admin only.

### Ingestion Management APIs
#### 1. Trigger Ingestion
Purpose: Start an ingestion process for a document.
 Endpoint: POST /ingestion/trigger/:documentId
 Request Example:
curl --location --request POST 'http://localhost:3000/ingestion/trigger/<documentId>' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <access-token>'

Access Control: Admin and Editor only.

#### 2. Get Ingestion Status
Purpose: Retrieve the status of a specific ingestion process.
 Endpoint: GET /ingestion/:documentId/status
 Request Example:
curl --location 'http://localhost:3000/ingestion/<documentId>/status' \
--header 'Authorization: Bearer <access-token>'


#### 3. Get All Ingestion Processes
Purpose: Retrieve all ingestion processes.
 Endpoint: GET /ingestion/all
 Request Example:
curl --location 'http://localhost:3000/ingestion/all' \
--header 'Authorization: Bearer <access-token>'

Access Control: Admin only.

#### 4. Mark Ingestion Complete
Purpose: Mark a specific ingestion process as complete.
 Endpoint: PATCH /ingestion/:documentId/complete
 Request Example:
curl --location --request PATCH 'http://localhost:3000/ingestion/<documentId>/complete' \
--header 'Authorization: Bearer <access-token>'

Access Control: Admin only.

#### 5. Mark Ingestion Failed
Purpose: Mark a specific ingestion process as failed.
 Endpoint: PATCH /ingestion/:documentId/fail
 Request Example:
curl --location --request PATCH 'http://localhost:3000/ingestion/<documentId>/fail' \
--header 'Authorization: Bearer <access-token>'

Access Control: Admin only.





## Deployment Plan

No additional database setup is required as the project integrates directly with AWS RDS. Ensure the necessary security groups are configured to allow access to your RDS instance from the deployment environment.



