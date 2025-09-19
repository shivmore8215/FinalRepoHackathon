# Train Plan Wise - MongoDB Backend Setup

## 🎯 Overview

This document describes the MongoDB backend system for Train Plan Wise application with super admin functionality.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally on default port 27017)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create super admin user in MongoDB
npm run seed:superuser

# Start the backend server
npm start
```

### 2. Frontend Setup

```bash
# In the root directory, start the frontend
npm run dev
```

## 🔐 Super Admin Credentials

```
Username: super_admin
Password: super_admin
Email: admin@trainplanwise.com
```

## 📊 Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  role: String (enum: ['user', 'admin', 'super_admin']),
  status: String (enum: ['pending', 'approved', 'rejected', 'suspended']),
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdBy: ObjectId (ref: User),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠 API Endpoints

### Authentication Routes

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/pending-users` - Get pending users (Super Admin only)
- `POST /api/auth/approve-user/:userId` - Approve user (Super Admin only)
- `POST /api/auth/reject-user/:userId` - Reject user (Super Admin only)

### Health Check

- `GET /health` - Server health status
- `GET /` - API information

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/train_plan_wise
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
SUPER_ADMIN_USERNAME=super_admin
SUPER_ADMIN_PASSWORD=super_admin
SUPER_ADMIN_EMAIL=admin@trainplanwise.com
FRONTEND_URL=http://localhost:5173
```

## 📝 Available Scripts

### Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm run seed:superuser  # Create only super admin user
```

## 🔒 Security Features

1. **Password Hashing**: Uses bcryptjs with salt rounds of 12
2. **JWT Authentication**: Secure token-based authentication
3. **Rate Limiting**: API rate limiting to prevent abuse
4. **Account Locking**: Automatic account lock after 5 failed login attempts
5. **Input Validation**: Comprehensive input validation using express-validator
6. **CORS Protection**: Configured CORS for frontend-backend communication

## 👥 User Management Flow

1. **User Registration**:

   - User signs up through the frontend
   - Account created with 'pending' status
   - Super admin receives notification

2. **Super Admin Approval**:

   - Super admin logs in to admin portal
   - Reviews pending user registrations
   - Approves or rejects users

3. **User Login**:
   - Only approved users can log in
   - JWT token issued upon successful authentication
   - Token stored in frontend localStorage

## 🗄 Database Management

### Create Super Admin

```bash
cd backend
npm run seed:superuser
```

### Seed Sample Data

```bash
cd backend
npm run seed
```

### Connect to MongoDB

```bash
# Using MongoDB shell
mongo
use train_plan_wise
db.users.find()
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:

   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env` file

2. **Super Admin Already Exists**:

   - The script will notify if super admin already exists
   - Check database: `db.users.find({role: 'super_admin'})`

3. **Frontend API Connection**:
   - Verify backend is running on port 5000
   - Check CORS configuration in server.js

### Error Messages

- `MongoDB connection failed` - MongoDB server not running
- `Duplicate entry` - User with username/email already exists
- `Account not approved` - User trying to login before approval
- `Invalid token` - JWT token expired or invalid

## 📊 Monitoring

### Health Check

Visit `http://localhost:5000/health` to check server status.

### Database Status

```javascript
// In MongoDB shell
use train_plan_wise
db.stats()
db.users.count()
```

## 🔄 Production Deployment

1. Update environment variables for production
2. Use a production MongoDB instance
3. Set strong JWT secret
4. Configure proper CORS origins
5. Enable HTTPS
6. Set up monitoring and logging

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review server logs
3. Verify MongoDB connection
4. Check network connectivity between frontend and backend

---

**Note**: This is a development setup. For production use, implement additional security measures, use environment-specific configurations, and follow MongoDB security best practices.
