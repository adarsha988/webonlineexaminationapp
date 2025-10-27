# Login Credentials - Online Examination System

## 🔐 Test Accounts

All accounts use the same password: **`password123`**

### Admin Account
- **Email**: `admin@test.com`
- **Password**: `password123`
- **Access**: Full system administration

### Instructor Account
- **Email**: `instructor@test.com`
- **Password**: `password123`
- **Access**: Create exams, manage questions, view student results

### Student Account
- **Email**: `student@test.com`
- **Password**: `password123`
- **Access**: Take exams, view results, notifications

---

## 📝 Additional Seeded Accounts

If the comprehensive seed data loaded successfully, these accounts may also be available:

### Admin
- Email: `alice@admin.com`
- Password: `password123`

### Instructors
- Email: `inst@example.com` - Dr. Michael Johnson
- Email: `sarah@university.edu` - Dr. Sarah Wilson
- Password: `password123` (for all)

### Students
- Email: `bob@student.edu` - Bob (GPA: 3.2)
- Email: `emma@student.edu` - Emma (GPA: 3.5)
- Email: `liam@student.edu` - Liam (GPA: 3.8)
- Email: `sophia@student.edu` - Sophia (GPA: 2.9)
- Email: `noah@student.edu` - Noah (GPA: 3.1)
- Password: `password123` (for all)

---

## 🚀 Quick Start

1. Open http://localhost:5000
2. Click "Login"
3. Enter one of the email addresses above
4. Enter password: `password123`
5. Click "Sign In"

---

## 🔄 Reset Credentials

If you need to reset or recreate users:

```powershell
node seed-database.js
```

This will create the three main test accounts if they don't exist.

---

## ⚠️ Security Note

**These are test credentials for development only!**

For production:
1. Change all passwords
2. Use strong, unique passwords
3. Enable additional security features
4. Remove test accounts
