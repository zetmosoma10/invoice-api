# Invoice API App

This is a **Invoice Api** backend application for managing invoices. The app is built with **Node.js** and **Express.js**, and the user can create and update invoices. Users also get real-time email notification on invoice status change.

## FEATURES

- User Registration & Login (JWT Auth)
- User Forgot & Reset Password
- User profile picture upload & remove ( Cloudinary )
- Delete User Acc
- CRUD operation for Invoices
- Real time Email sending notification

## TECH STACK

- Node.js
- Express.js
- MongoDB & Mongoose
- jsonwebtoken (generating token)
- Cloudinary (for uploading profile images)
- joi (for data validation)
- nodemailer (for sending emails)
- bcrypt (for hashing password)
- Vitest (unit and integration testing)

## GETTING STARTED

### 1. Clone Repository

```bash
git clone https://github.com/zetmosoma10/invoice-api.git
cd invoice-api
```

### 2. Install Dependencies

npm install

### 3. Create .env file

At the root of the project create .env file and add:

- PORT=3000
- DB_CONN_STR=your_db_con_str
- TEST_DB_CONN_STR=your_local_db_con_str
- JWT_SECRET_STR=your_secret
- JWT_EXPIRES= your_expire_time
- FRONTEND_URL=your_frontend_url
- EMAIL_USER=your_email
- EMAIL_SERVICE=your_email_service
- EMAIL_PORT=your_email_port
- EMAIL_PASSWORD=your_email_password
- EMAIL_HOST=your_email_host
- CLOUD_NAME=your_cloud_name
- API_KEY=your_cloud_api_key
- API_SECRET=your_api_secret
- CLOUDINARY_URL=your_cloudinary_conn_str

### 4. START THE SERVER

node server.js

The server will run at: http://localhost:3000

## API Endpoints

**Auth**

- POST /api/auth/register ----(Register new User)
- POST /api/auth/login ----(login User)
- POST /api/auth/forgotPassword ----(Forgot password)
- PATCH /api/auth/resetPassword ----(Reset password)

**User**

- GET /api/user/get-current-user ----(Get loggin user)
- PATCH /api/user/update-user ----(Update User details)
- DELETE /api/user/delete-user ----(Delete User)
- POST /api/user/upload-profile-image ----(Upload user profile image)
- DELETE /api/user/delete-profile-image ----(Delete user profile image)

**Invoices**

- GET /api/invoices ----(GET all invoices for logging user)
- POST /api/invoices ----(Create invoices)
- GET /api/invoices/:id ----(get invoice by id)
- PATCH /api/invoices/:id ----(update invoice)
- DELETE /api/invoices/:id ----(Delete invoice)
- PATCH /api/invoices/:id/markAsPaid ----(mark invoice as paid)
- POST /api/invoices/:id/reminder ----(send reminder invoice to client)
