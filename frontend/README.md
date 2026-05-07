# LeaveHub — Employee Leave Management System

A full-stack HR leave management system built with the MERN stack.

## 🚀 Live Demo
> Run locally following the setup instructions below.

## 📋 Features

- Employee self-service leave application portal
- Manager approval/rejection workflow with comments
- HR admin dashboard with company-wide visibility
- Real-time leave balance tracking (Annual, Sick, Unpaid)
- Email notifications via Nodemailer on every status change
- Company-wide leave calendar
- Monthly leave utilisation reports (JSP)
- Role-based access control (Employee / Manager / HR Admin)
- JWT authentication

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB |
| Backend | Express.js |
| Frontend | React JS |
| Runtime | Node.js |
| Email | Nodemailer (Gmail SMTP) |
| Reports | JSP (Java Server Pages) |
| Auth | JWT (JSON Web Tokens) |

## 📁 Project Structure
leave-management/
├── backend/
│   ├── server.js
│   ├── models/
│   │   ├── User.js
│   │   └── Leave.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leaves.js
│   │   ├── users.js
│   │   └── reports.js
│   └── middleware/
│       ├── auth.js
│       └── emailService.js
├── frontend/
│   └── src/
│       ├── context/
│       ├── components/
│       └── pages/
└── jsp-reports/
└── monthly-report.jsp
## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB
- Gmail account (for email notifications)

### 1. Clone the repository
```bash
git clone https://github.com/HarshithKottamasu/leave-management.git
cd leave-management
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```

### 4. Environment Variables
Create a `.env` file in the `backend/` folder:
MONGO_URI=mongodb://localhost:27017/leave_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@company.com
FROM_NAME=LeaveHub HR
PORT=5000
NODE_ENV=development
## 👥 User Roles

| Role | Permissions |
|------|-------------|
| Employee | Apply for leave, view own history, see calendar |
| Manager | Approve/reject team leaves, view team reports |
| HR Admin | Full access, adjust balances, company-wide reports |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get token |
| GET | /api/leaves | Get leave requests |
| POST | /api/leaves | Submit leave request |
| PATCH | /api/leaves/:id/status | Approve or reject |
| GET | /api/reports/monthly | Monthly utilisation |

## 📧 Email Notifications

Automated emails are sent via Nodemailer when:
- Employee submits a leave request (manager gets notified)
- Manager approves a request (employee gets notified)
- Manager rejects a request (employee gets notified)

## 🙋‍♂️ Author

**Harshith Kottamasu**  
GitHub: [@HarshithKottamasu](https://github.com/HarshithKottamasu)