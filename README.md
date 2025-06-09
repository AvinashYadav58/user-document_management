# User Document Management

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


## Authentication & Authorization

This application uses **JWT (JSON Web Tokens)** for secure authentication and **role-based authorization** using custom guards in the NestJS framework.

### Authentication Flow

#### 1. **User Signup:**
   - When a new user signs up, they are automatically assigned the default role: `viewer`.
   - The password is hashed and stored securely in the database.

#### 2. **User Login:**
   - The user provides valid credentials.
   - On successful authentication, a **JWT token** is issued containing the user's ID and role.
   - This token must be included in the `Authorization` header (`Bearer <token>`) for all protected requests.

#### 3. **JWT Validation:**
   - The application uses `JwtAuthGuard` to validate the presence and correctness of the JWT token on protected routes.
   - The `JwtStrategy` decodes the token and attaches the user details to the request object.

### Authorization & Role Management

#### 1. **Roles and Access Control:**
   - The app uses a custom `RolesGuard` to control access to routes based on user roles.
   - Roles include: `admin`, `editor`, and `viewer`.
   - Admins have full access to manage users and documents.
   - Editors can create and update content.
   - Viewers can only read data.

#### 2. **Role Assignment:**
   - When a user signs up, they are saved with the `viewer` role by default.
   - **Only an admin** can update a user's role in the system (e.g., promote to `editor` or `admin`).
   - There is no public API to change user roles; it's a protected admin-only operation.

#### 3. **Route-Level Authorization:**
   - Protected routes are decorated using the `@Roles()` decorator.
   - The `RolesGuard` checks the user’s role from the JWT payload and grants/denies access accordingly.



## User Document Management API Documentation
This document provides a comprehensive overview of the available APIs in the User Document Management system. It explains each API's purpose, request methods, required headers, payloads, and expected responses. The document also highlights role-based access control for each endpoint.

### Postma collection
```bash
https://api.postman.com/collections/27097214-1d5d95e5-07c1-47f1-9b55-6f4a5c2b80dc?access_key=PMAT-01JX8CMR92SCQV8NVRP2MQ92GX 
```


### Authentication APIs
#### 1. Sign Up
Purpose: Register a new user in the system.
 Endpoint: POST /auth/signup
 Request Example:
 ```bash
curl --location 'http://localhost:3000/auth/signup' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=avinash23' \
--data-urlencode 'password=StrongPass123!'
```

Response:
200 OK: User registered successfully.



#### 2. Sign In
Purpose: Authenticate a user and provide an access token.
 Endpoint: POST /auth/signin
 Request Example:
 ```bash
curl --location 'http://localhost:3000/auth/signin' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=avinash22' \
--data-urlencode 'password=StrongPass123!'
```

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
}


### User Management APIs
#### 1. Get Self Profile
Purpose: Retrieve the profile details of the currently authenticated user.
 Endpoint: GET /users/profile
 Request Example:
 ```bash
curl --location 'http://localhost:3000/users/profile' \
--header 'Authorization: Bearer <access-token>'
```

Response: User details.

#### 2. Get User Details
Purpose: Retrieve details of a specific user by their ID.
 Endpoint: GET /users/:userId/user
 Request Example:
 ```bash
curl --location 'http://localhost:3000/users/<userId>/user' \
--header 'Authorization: Bearer <access-token>'
```

Access Control: Admin only.

#### 3. Get All Users
Purpose: Retrieve a list of all registered users.
 Endpoint: GET /users
 Request Example:
 ```bash
curl --location 'http://localhost:3000/users' \
--header 'Authorization: Bearer <access-token>'
```

Access Control: Admin only.

#### 4. Update User Role
Purpose: Modify the role of a specific user.
 Endpoint: PATCH /users/:userId/role
 Request Example:
 ```bash
curl --location --request PATCH 'http://localhost:3000/users/<userId>/role' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <access-token>' \
--data '{"role": "Editor"}'
```

Access Control: Admin only.

#### 5. Delete user
Purpose: Delete a specific user.
 Endpoint: DELETE /users/:userId
 Request Example:
 ```bash
curl --location --request DELETE 'http://localhost:3000/users/305baa3b-8cb0-4116-a0a7-f12e74f119d4' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2aW5hc2gyMiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc0OTQ0Mzg1MSwiZXhwIjoxNzQ5NDUxMDUxfQ.ukxtV4OjFplileEhvlkxwv7jZ22PoFJKAN3vv8aSOBk'
```

Access Control: Admin only.

### Document Management APIs
#### 1. Upload Document
Purpose: Upload a new document.
 Endpoint: POST /documents
 Request Example:
 ```bash
curl --location 'http://localhost:3000/documents' \
--header 'Authorization: Bearer <access-token>' \
--form 'file=@"/path/to/file.jpg"' \
--form 'title="Document Title"' \
--form 'description="Document Description"' \
--form 'author="Author Name"'
```

Access Control: Admin and Editor only.

#### 2. Get All Documents
Purpose: Retrieve all documents.
 Endpoint: GET /documents
 Request Example:
 ```bash
curl --location 'http://localhost:3000/documents' \
--header 'Authorization: Bearer <access-token>'
```


#### 3. Get Document by ID
Purpose: Retrieve details of a specific document by its ID.
 Endpoint: GET /documents/:documentId
 Request Example:
 ```bash
curl --location 'http://localhost:3000/documents/<documentId>' \
--header 'Authorization: Bearer <access-token>'
```


#### 4. Update Document
Purpose: Update an existing document.
 Endpoint: PATCH /documents/:documentId
 Request Example:
 ```bash
curl --location --request PATCH 'http://localhost:3000/documents/<documentId>' \
--header 'Content-Type: application/json' \
--data '{"title":"Updated Title","description":"Updated Description","author":"Updated Author"}'
```

Access Control: Admin and Editor only.

#### 5. Delete Document
Purpose: Delete a specific document.
 Endpoint: DELETE /documents/:documentId
 Request Example:
 ```bash
curl --location --request DELETE 'http://localhost:3000/documents/<documentId>' \
--header 'Authorization: Bearer <access-token>'
```

Access Control: Admin only.

### Ingestion Management APIs
#### 1. Trigger Ingestion
Purpose: Start an ingestion process for a document.
 Endpoint: POST /ingestion/trigger/:documentId
 Request Example:
 ```bash
curl --location --request POST 'http://localhost:3000/ingestion/trigger/<documentId>' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <access-token>'
```

Access Control: Admin and Editor only.

#### 2. Get Ingestion Status
Purpose: Retrieve the status of a specific ingestion process.
 Endpoint: GET /ingestion/:documentId/status
 Request Example:
 ```bash
curl --location 'http://localhost:3000/ingestion/<documentId>/status' \
--header 'Authorization: Bearer <access-token>'
```


#### 3. Get All Ingestion Processes
Purpose: Retrieve all ingestion processes.
 Endpoint: GET /ingestion/all
 Request Example:
 ```bash
curl --location 'http://localhost:3000/ingestion/all' \
--header 'Authorization: Bearer <access-token>'
```

Access Control: Admin only.

#### 4. Mark Ingestion Complete
Purpose: Mark a specific ingestion process as complete.
 Endpoint: PATCH /ingestion/:documentId/complete
 Request Example:
 ```bash
curl --location --request PATCH 'http://localhost:3000/ingestion/<documentId>/complete' \
--header 'Authorization: Bearer <access-token>'
```

Access Control: Admin only.

#### 5. Mark Ingestion Failed
Purpose: Mark a specific ingestion process as failed.
 Endpoint: PATCH /ingestion/:documentId/fail
 Request Example:
 ```bash
curl --location --request PATCH 'http://localhost:3000/ingestion/<documentId>/fail' \
--header 'Authorization: Bearer <access-token>'
```

Access Control: Admin only.



## Deployment Plan

This section outlines how to deploy the NestJS backend using **AWS EC2**, connect to **AWS RDS (PostgreSQL)**, and set up **CI/CD** for automatic deployment.

---

### Infrastructure Overview

- **Backend**: NestJS Application
- **Database**: AWS RDS PostgreSQL
- **Server**: AWS EC2 (Amazon Linux 2 or Ubuntu)
- **CI/CD**: GitHub Actions (or your preferred CI/CD provider)

---

### 1. Provision AWS Resources

#### a. Set up RDS (PostgreSQL)

Refer to the [RDS Setup](#option-b-aws-rds-postgresql) section to create and configure your PostgreSQL database on RDS.

Make sure:
- The instance is publicly accessible or accessible within a VPC subnet.
- The security group allows inbound traffic on **port 5432** from the EC2 instance’s IP or security group.

#### b. Launch EC2 Instance

##### 1. Go to **EC2 > Launch Instance**
##### 2. Choose **Ubuntu 22.04** or **Amazon Linux 2**
##### 3. Configure the instance:
   - Minimum: `t2.micro` (for test) or `t3.medium` (for production)
   - Attach a security group that allows:
     - SSH: Port `22` from your IP
     - HTTP: Port `80` or app port `3000` (optional)
##### 4. Generate or use an existing **key pair**
##### 5. Connect via SSH after the instance is ready


ssh -i your-key.pem ec2-user@<your-ec2-public-ip>

### 2. Deploy the Application
#### a. Install Node.js, Git, PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```
```bash
sudo apt-get install -y nodejs git
```
```bash
npm install -g pm2
```
#### b. Clone your Repository

```bash
git clone https://github.com/your-org/user_document_management.git
```
```bash
cd user_document_management
```
#### c. Set up Environment File
Create .env.stage.prod in the root directory:

```bash
nano .env.stage.prod
```
Include RDS DB and AWS S3 credentials (as defined in previous sections).

#### d. Install & Build the Project

```bash
npm install
```
```bash
npm run build
```
#### e. Start with PM2

```bash
pm2 start dist/main.js --name user-docs-api
```
```bash
pm2 save
```
```bash
pm2 startup
```
### 3. Set Up CI/CD (GitHub Actions Example)
In your project root, create .github/workflows/deploy.yml:

```bash
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repo
      uses: actions/checkout@v3

    - name: Copy Files to EC2
      uses: appleboy/scp-action@v0.1.4
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ec2-user
        key: ${{ secrets.EC2_KEY }}
        source: "."
        target: "/home/ec2-user/user_document_management"

    - name: SSH and Restart App
      uses: appleboy/ssh-action@v0.1.10
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ec2-user
        key: ${{ secrets.EC2_KEY }}
        script: |
          cd /home/ec2-user/user_document_management
          npm install
          npm run build
          pm2 restart user-docs-api || pm2 start dist/main.js --name user-docs-api
    
 ```         
Add your secrets (EC2_HOST, EC2_KEY) in GitHub > Settings > Secrets and Variables > Actions.


### 4. Post-Deployment Checklist
  #### i) Database connectivity is verified

  #### ii) S3 upload credentials work

  #### iii) Application is reachable via EC2 public IP or domain

  #### iv) pm2 ensures application restarts on reboot

  #### v) Logs available via pm2 logs
