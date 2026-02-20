# Offerly 🎯  
*A Placement Application Tracker*

Offerly is a full-stack web application built to help students track, manage, and analyze their placement applications in one place.  
It also provides administrators with a centralized view of student applications and overall placement analytics.

This project was developed as a practical full-stack system focusing on real-world features such as authentication, role-based access, analytics, and clean UI/UX.

---

## 🚀 Features

### 👨‍🎓 Student Features
- Add and manage job/internship applications
- Track application status: **In-Progress, Offer, Rejected**
- Inline update of application status and current interview round
- Global search (company, role, round)
- Status-based filtering
- Analytics dashboard:
  - Total applications
  - Offers vs rejections
  - Company-wise statistics
  - Interview round drop-off analysis
- Secure authentication using JWT (HttpOnly cookies)

---

### 🛠 Admin Features
- View all student applications
- Filter by status
- Global search (company, role, student email)
- Application detail view (read-only)
- Admin analytics dashboard:
  - Total users
  - Total applications
  - Status distribution
  - Top companies by applications
- Role-based access control

---

## 🧱 Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS**
- React Router
- Recharts (for analytics & graphs)
- Axios

### Backend
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- JWT Authentication (HttpOnly Cookies)
- Zod (schema validation)
- Role-based middleware
- MVC-based folder structure

---

---

## 🔐 Authentication & Security

- JWT stored in **HttpOnly cookies**
- Protected routes using middleware
- Role-based access (`student`, `admin`)
- Input validation using **Zod**
- Secure cookies enabled in production
- MongoDB ObjectId ownership checks for data access

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development