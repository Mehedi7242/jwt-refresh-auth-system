# 🔐 Auth Backend API

A secure, production-ready authentication backend built with **Node.js**, **Express**, and **PostgreSQL**.

---

## 🚀 Features
- **Secure Auth**: JWT-based Authentication (Access & Refresh Tokens).
- **Database**: Managed with **Sequelize ORM** for PostgreSQL.
- **Security**: Password hashing with `bcrypt` and secure cookie handling.
- **Role-Based Access**: Specialized middleware for protected routes.
- **Email Service**: OTP-based password reset via `Nodemailer`.

---

## 📁 Project Structure

```text
auth-backend-api/
├── auth/
│   └── auth.js            # Middleware for JWT verification
├── controllers/
│   └── userController.js  # Request handling logic
├── db/
│   └── dbconnection.js    # Database configuration
├── model/
│   └── userModel.js       # Sequelize schemas
├── route/
│   └── routes.js          # API Endpoints
├── utils/
│   └── mailer.js          # Email & OTP utility
├── .env                   # Environment variables (ignored)
├── index.js               # Entry point
└── package.json           # Dependencies & scripts