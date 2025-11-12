# Online Examination System

A comprehensive online examination platform built with React, Node.js, Express, and MongoDB. Features include role-based authentication, AI-powered grading, real-time exam taking, and advanced admin dashboard.

## Features

### For Students
- **Secure Authentication** - JWT-based login system
- **Real-time Exams** - Take exams with timer and auto-submission
- **AI Grading** - Automated grading for short answers using OpenAI
- **Results Dashboard** - View exam results and performance analytics
- **Responsive Design** - Works on desktop, tablet, and mobile

### For Instructors
- **Exam Creation** - Create and manage exams with multiple question types
- **Student Management** - View and manage enrolled students
- **Grading Tools** - Manual and AI-assisted grading options
- **Analytics** - Detailed performance analytics and reports

### For Administrators
- **User Management** - Complete CRUD operations for users
- **System Analytics** - Comprehensive dashboard with key metrics
- **Reports Generation** - Usage, performance, and security reports
- **Activity Monitoring** - Real-time system activity tracking
- **Role Management** - Assign and manage user roles

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Smooth animations
- **Redux Toolkit** - State management
- **Wouter** - Lightweight routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **OpenAI API** - AI-powered grading

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OnlineExamination
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   ```

4. **Required Environment Variables**
   ```env
   # Essential variables (must be set)
   DATABASE_URL=mongodb://localhost:27017/online_examination
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Optional but recommended
   OPENAI_API_KEY=your-openai-api-key-for-ai-grading
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Application: http://localhost:5000
   - Health Check: http://localhost:5000/health
   
   > **Note**: The application runs on a **single port (5000)** in development mode. Both the client and API are served together. See [SINGLE_PORT_SETUP.md](SINGLE_PORT_SETUP.md) for details.

## Configuration

### Database Setup
The application supports MongoDB. Update your `DATABASE_URL` in the environment file:

```env
# For local MongoDB
DATABASE_URL=mongodb://localhost:27017/online_examination

# For MongoDB Atlas
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/online_examination
```

### OpenAI Integration
For AI-powered grading, add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Email Configuration
For email notifications, configure SMTP settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Project Structure

```
OnlineExamination/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Redux store
│   │   └── api/           # API utilities
│   └── index.html
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── services/         # Business logic
├── shared/               # Shared types and schemas
├── config/               # Build configuration
└── docs/                 # Documentation
```

## Core Features

### Key Algorithms
- **Authentication** - JWT-based stateless authentication with bcrypt password hashing
- **Question Management** - Efficient CRUD operations with MongoDB indexing
- **Exam Creation** - Dynamic exam generation with validation
- **Result Calculation** - Automated scoring with hybrid grading
- **AI Proctoring** - Real-time face detection using TensorFlow.js BlazeFace
- **Notifications** - Event-driven real-time notifications

### Performance & Security
- Optimized for security, scalability, accuracy, and real-time performance
- MongoDB indexing for fast queries
- JWT tokens with 24-hour expiration
- bcrypt password hashing with salt rounds
- Role-based access control (RBAC)
- Input validation and sanitization

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable salt rounds
- **Role-Based Access Control** - Admin, Instructor, Student roles
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Configurable allowed origins
- **Input Validation** - Comprehensive data validation
- **Session Management** - Secure session handling

## Admin Dashboard Features

### System Overview
- Total users, students, instructors, and exams
- Active users and system health monitoring
- Real-time performance metrics

### User Management
- Create, edit, and delete users
- Role and status management
- Advanced filtering and search
- Bulk operations support

### Reports & Analytics
- Usage analytics with date filtering
- Academic performance reports
- Security audit logs
- Export capabilities (PDF, CSV, JSON)

### Activity Monitoring
- Real-time activity feed
- Categorized system events
- User action tracking
- IP address logging

## Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

The application will run on the PORT specified in your environment variables (default: 5000).

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run check
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Admin Endpoints
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/stats/overview` - System statistics
- `GET /api/reports` - Generate reports
- `GET /api/activities` - System activities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the API endpoints in the code

## Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced admin dashboard
- **v1.2.0** - AI grading integration
- **v1.3.0** - Advanced reporting system

---

Built using modern web technologies
