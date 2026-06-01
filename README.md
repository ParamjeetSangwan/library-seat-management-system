# 📚 Library Seat Management System

A full-stack **Library Seat Management System** built with Python, Django REST Framework, React, and MySQL. Designed for self-study libraries where students come to study on assigned seats.

## 🚀 Live Features

### Admin Panel
- 🪑 **Seat Map** — Visual grid of all seats, click any seat to view full member profile
- 👥 **Member Management** — Add members, assign seats, cancel memberships
- 📅 **Attendance** — Mark daily attendance manually when member arrives
- 💰 **Payment Management** — Record cash payments, track pending dues
- 📊 **Analytics Dashboard** — Seat occupancy rate, revenue, member stats
- 📥 **Excel Export** — Download members, payments, attendance reports
- ⚙️ **Settings** — Edit monthly fee, manage total seats, update admin profile
- 🌙 **Dark Mode** — Toggle between light and dark theme

### Member Portal
- 🔐 **Registration** — Email OTP verification at signup
- 🪑 **My Seat** — View assigned seat number
- 🗺️ **Seat Map** — View all 90 seats, request seat change
- 📅 **Attendance History** — Calendar view of present days
- 💰 **Payment History** — View all past payments and receipts
- 🔔 **Notifications** — Payment confirmations, expiry alerts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Django, Django REST Framework |
| Frontend | React, JavaScript, HTML/CSS |
| Database | MySQL |
| Authentication | bcrypt password hashing, Email OTP |
| Excel Export | openpyxl |
| API Client | Axios |

## 📁 Project Structure

ibrary_project/
├── backend/          # Django project settings
├── core/             # Main Django app
│   ├── models.py     # 10 database models
│   ├── views.py      # 30+ API endpoints
│   ├── serializers.py
│   └── urls.py
├── frontend/         # React application
│   └── src/
│       ├── pages/    # All page components
│       ├── components/
│       └── services/ # API service layer
└── library_db.sql    # Complete MySQL schema

## 🗄️ Database Schema

10 tables: `members`, `seats`, `memberships`, `payments`, `attendance`, `seat_change_requests`, `notifications`, `admins`, `settings`, `email_otp`

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### Backend Setup
```bash
# Install dependencies
pip install django djangorestframework django-cors-headers mysqlclient Pillow djangorestframework-simplejwt python-decouple bcrypt openpyxl

# Configure .env file
SECRET_KEY=your-secret-key
DB_NAME=library_db
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Import database
mysql -u root -p < library_db.sql

# Run server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📊 Analytics

The system tracks and visualizes:
- Monthly seat occupancy rate
- Daily/monthly attendance trends
- Revenue reports
- Member retention rate
- Peak days analysis
- Membership expiry forecasts

## 🔑 Default Admin Credentials

Create admin account via Django shell:
```python
import bcrypt
from core.models import Admin
h = bcrypt.hashpw(b'yourpassword', bcrypt.gensalt()).decode()
Admin.objects.create(name='Admin', mobile='9999999999', email='admin@library.com', password_hash=h)
```

## 👨‍💻 Developer

**Paramjeet Sangwan**
- GitHub: [@ParamjeetSangwan](https://github.com/ParamjeetSangwan)
- LinkedIn: [linkedin.com/in/paramjeet-sangwan](https://linkedin.com/in/paramjeet-sangwan)