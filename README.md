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

Create the database:



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

   - Create a `.env.stage.dev` file:
     ```bash
     cp .env.example .env.stage.dev
     ```
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
