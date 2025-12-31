# Sara7a Backend API

This is a Node.js project that implements an anonymous messaging system inspired by the Sara7a concept.  
The application provides secure user authentication and authorization, anonymous message sending, user profile management, image uploading, and role-based access control. It also supports Google social login and includes multiple security layers to protect the API.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Joi
- Cloudinary
- Multer
- Nodemailer
- Google OAuth 2.0
- bcrypt
- Helmet
- CORS
- Express Rate Limit
- Morgan

## Features
- User authentication and authorization using JWT.
- Role-based access control (USER / ADMIN).
- Email confirmation using OTP.
- Password reset functionality.
- Google social login.
- Anonymous message sending between users.
- User profile management.
- Profile image and cover images uploading using Cloudinary.
- Account freeze and restore functionality.
- Request validation using Joi.
- Security enhancements using Helmet, CORS, and Rate Limiting.
- Centralized error handling and logging system.

## Prerequisites
- Node.js installed on your system.
- A text editor or an IDE of your choice.
- MongoDB installed on your system or access to a MongoDB Atlas account.

## Installation
Clone the repository to your local machine.  
Run `npm install` to install the required dependencies.  
Run `npm run dev` to start the server.

## Getting Started
Clone the repository to your local machine using the following command:
```bash
git clone https://github.com/SaraMadyn/Sara7aApp.git
Install the project dependencies using the following command: npm install
Start the server: npm run dev
Use the API routes with a tool like Postman.

## API Endpoints
### Authentication
POST `/api/v1/auth/signup` – Register a new user.  
POST `/api/v1/auth/login` – Log in a user.  
PATCH `/api/v1/auth/confirm-email` – Confirm user email using OTP.  
POST `/api/v1/auth/refresh-token` – Refresh access token.  
POST `/api/v1/auth/revoke-token` – Logout user.  
PATCH `/api/v1/auth/forget-password` – Request password reset.  
PATCH `/api/v1/auth/reset-password` – Reset password.  
POST `/api/v1/auth/social-login` – Login using Google OAuth.

### Users
GET `/api/v1/user` – Get all users.  
PATCH `/api/v1/user/update` – Update user profile.  
PATCH `/api/v1/user/profile-img` – Upload profile image.  
PATCH `/api/v1/user/cover-images` – Upload cover images.  
DELETE `/api/v1/user/freeze-account` – Freeze user account.  
PATCH `/api/v1/user/restore-account` – Restore frozen account.

### Messages
POST `/api/v1/message/send-message/:receiverId` – Send anonymous message.  
GET `/api/v1/message/get-message` – Get received messages.

## Authors
Sara Madyn
