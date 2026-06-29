
# Offerly — Placement Application Tracker
>>>>>>> 23e344a (Update README.md for improved clarity and structure)

> A full-stack web application to track, manage, and analyze campus placement applications — with separate Student and Admin dashboards.

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=flat-square&logo=vercel)](https://offerly-puce.vercel.app)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)

---

## 📌 What is Offerly?

Campus placements are chaotic — multiple companies, multiple rounds, shifting statuses. Offerly gives students one place to log every application and understand their placement journey through data.

Administrators get a bird's-eye view across all students and companies.

---

## ✨ Features

### Student
- Add and manage job / internship applications
- Track status: **In Progress · Offer · Rejected**
- Inline update of status and current interview round
- Global search by company, role, or round
- Filter by application status
- **Analytics dashboard**
  - Total applications, offer rate, rejection rate
  - Company-wise application breakdown
>>>>>>> 23e344a (Update README.md for improved clarity and structure)
  - Interview round drop-off analysis

### Admin
- View all student applications across the platform
- Filter by status · Global search (company, role, student email)
- Read-only application detail view
- **Admin analytics**
  - Total users and total applications
  - Status distribution across platform
  - Top companies by application volume

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (HttpOnly Cookies) |
| Validation | Zod |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🔐 Security Highlights
>>>>>>> 23e344a (Update README.md for improved clarity and structure)

- JWT tokens stored in **HttpOnly cookies** — not localStorage (XSS-safe)
- Protected routes using custom auth middleware
- **Role-based access control** — `student` and `admin` roles
- Input validated with **Zod** on every API endpoint
- MongoDB ObjectId ownership checks on data access

---

## 📁 Project Structure

```
offerly/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── context/         # Auth context
│   │   └── utils/           # Axios instance, helpers
│   └── package.json
│
├── server/                  # Node.js backend
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── middleware/          # Auth, role-check middleware
│   └── index.js
│
└── README.md
```

---

## ⚙️ Local Setup
>>>>>>> 23e344a (Update README.md for improved clarity and structure)

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)

### 1. Clone the repo
```bash
git clone https://github.com/gajanan-shinde16/offerly.git
cd offerly
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development

```

```bash
npm start
```

### 3. Frontend setup
```bash
cd ../client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register student/admin | ❌ |
| POST | `/api/auth/login` | Login & set cookie | ❌ |
| POST | `/api/auth/logout` | Clear auth cookie | ✅ |
| GET | `/api/applications` | Get all applications (student) | ✅ Student |
| POST | `/api/applications` | Add new application | ✅ Student |
| PATCH | `/api/applications/:id` | Update status/round | ✅ Student |
| DELETE | `/api/applications/:id` | Delete application | ✅ Student |
| GET | `/api/admin/applications` | Get all applications (admin) | ✅ Admin |
| GET | `/api/analytics/student` | Student analytics data | ✅ Student |
| GET | `/api/analytics/admin` | Admin analytics data | ✅ Admin |

---

## 🔮 Planned Features

- [ ] CSV export of applications
- [ ] Email notification on status change (Nodemailer)
- [ ] Resume upload per application (Cloudinary)
- [ ] CI/CD via GitHub Actions
>>>>>>> 23e344a (Update README.md for improved clarity and structure)
