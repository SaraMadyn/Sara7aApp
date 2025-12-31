# Sara7a Application

Sara7a Application is a Node.js application that provides an anonymous messaging system inspired by the Sara7a concept.
The project focuses on security, scalability, and clean backend architecture.


## Project Overview

The application allows users to:
- Create secure user accounts
- Authenticate using JWT
- Send and receive anonymous messages
- Manage personal profiles and images
- Login using Google OAuth
- Protect data with multiple security layers


## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- Joi (Validation)
- Cloudinary
- Multer
- Nodemailer
- Google OAuth 2.0
- bcrypt
- Helmet
- CORS
- Express Rate Limit
- Morgan


## Key Features

- Secure authentication and authorization using JWT
- Role-based access control (USER / ADMIN)
- Email confirmation using OTP
- Password reset functionality
- Google social login integration
- Anonymous message sending between users
- User profile management
- Profile and cover image uploading via Cloudinary
- Account freeze and restore functionality
- Request validation using Joi
- API protection using Helmet, CORS, and Rate Limiting
- Centralized error handling and logging


## Prerequisites

Before running the project, make sure you have:
- Node.js installed
- MongoDB installed locally or access to MongoDB Atlas
- Any code editor (VS Code recommended)

## Installation

To run the project locally:

- Clone the repository from GitHub
- Install dependencies using npm install
- Start the development server using npm run dev


## Getting Started

After starting the server:
- The API will be available locally
- You can test all endpoints using Postman
- Authentication is required for protected routes


## API Endpoints

### Authentication

- POST /api/v1/auth/signup  
  Register a new user

- POST /api/v1/auth/login  
  Login with email and password

- PATCH /api/v1/auth/confirm-email  
  Confirm user email using OTP

- POST /api/v1/auth/refresh-token  
  Refresh access token

- POST /api/v1/auth/revoke-token  
  Logout user

- PATCH /api/v1/auth/forget-password  
  Request password reset

- PATCH /api/v1/auth/reset-password  
  Reset password

- POST /api/v1/auth/social-login  
  Login using Google OAuth


### Users

- GET /api/v1/user  
  Get all users

- PATCH /api/v1/user/update  
  Update user profile

- PATCH /api/v1/user/profile-img  
  Upload profile image

- PATCH /api/v1/user/cover-images  
  Upload cover images

- DELETE /api/v1/user/freeze-account  
  Freeze user account

- PATCH /api/v1/user/restore-account  
  Restore frozen account


### Messages

- POST /api/v1/message/send-message/:receiverId  
  Send anonymous message

- GET /api/v1/message/get-message  
  Get received messages


## Author

Sara Madyn

