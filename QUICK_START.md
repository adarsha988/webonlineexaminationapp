# Quick Start Guide - Online Examination System

## 🚀 Starting the Application

### Option 1: Using PowerShell Script (Recommended)
```powershell
.\start-server.ps1
```

### Option 2: Manual Start
```powershell
npm run dev
```

## 🌐 Access the Application

Once the server starts, open your browser and navigate to:
- **Application URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📋 Prerequisites

### Required Services
1. **MongoDB** - Must be running on port 27017
   - Check status: `Get-Service MongoDB`
   - The application uses local MongoDB by default

2. **Node.js** - Version 18.x or higher
   - Check version: `node --version`

### Environment Configuration
The application uses the `.env` file in the root directory. Key settings:
- `DATABASE_URL` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for authentication
- `NODE_ENV` - Environment (development/production)

## 🔐 Default Credentials

The system seeds default users on first run. Check the seed data files in `server/data/` for credentials.

Common test accounts:
- **Admin**: Check `comprehensiveSeedData.js`
- **Instructor**: Check `comprehensiveSeedData.js`
- **Student**: Check `seedStudents.js`

## 🛠️ Troubleshooting

### Server Won't Start
1. **Check MongoDB**: Ensure MongoDB service is running
   ```powershell
   Get-Service MongoDB
   ```

2. **Check Port 5000**: Make sure no other process is using it
   ```powershell
   netstat -ano | Select-String ":5000"
   ```

3. **Kill Existing Node Processes**:
   ```powershell
   Stop-Process -Name node -Force
   ```

### Database Connection Issues
1. Verify MongoDB is running on `localhost:27017`
2. Check your `.env` file has correct `DATABASE_URL`
3. Test connection:
   ```powershell
   node test-connection.js
   ```

### API Returning 500 Errors
1. Check server logs in the terminal
2. Verify MongoDB has proper data seeded
3. Restart the server

## 📁 Project Structure

```
webOnlineExamination/
├── client/              # React frontend (served by Vite)
├── server/              # Express backend
│   ├── routes/          # API routes
│   ├── models/          # MongoDB models
│   ├── data/            # Seed data
│   └── index.ts         # Server entry point
├── .env                 # Environment variables
├── package.json         # Root dependencies
└── start-server.ps1     # Startup script
```

## 🔄 Development Workflow

1. **Start Server**: `npm run dev` or `.\start-server.ps1`
2. **Access Application**: http://localhost:5000
3. **Make Changes**: Edit files in `client/` or `server/`
4. **Hot Reload**: Vite automatically reloads frontend changes
5. **Backend Changes**: Server restarts automatically (if using nodemon)

## 📊 Key Features

- **Role-Based Access**: Admin, Instructor, Student
- **Exam Management**: Create, edit, publish exams
- **Question Banks**: Shared question repositories
- **Exam Taking**: Timed exams with proctoring
- **Results & Analytics**: Performance tracking
- **Notifications**: Real-time updates

## 🆘 Getting Help

If you encounter issues:
1. Check the server terminal for error messages
2. Review browser console for frontend errors
3. Verify MongoDB is running and accessible
4. Check the `.env` configuration

## 📝 Notes

- The server uses **Vite integration** - both API and frontend are served on port 5000
- **No separate client server needed** - everything runs on one port
- Seed data is automatically loaded on first run
- The application uses **MongoDB** for data persistence
