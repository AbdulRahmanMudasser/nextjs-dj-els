# React Django LMS

A modern Learning Management System built with React (Next.js) frontend and Django REST Framework backend.

## 🚀 Features

- **Authentication & Authorization**: Secure user authentication with role-based access control
- **User Management**: Student, Faculty, Admin, Parent, and Librarian roles
- **Course Management**: Create and manage courses with modules
- **Assignment System**: Submit and grade assignments
- **Communication**: Messaging system between users
- **Notifications**: Real-time notifications for important events
- **Responsive Design**: Mobile-first responsive UI with Tailwind CSS
- **Security**: Industry-standard security practices and rate limiting

## 🏗️ Architecture

### Frontend (React/Next.js)
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Custom API client with error handling

### Backend (Django)
- **Framework**: Django 4.2 with Django REST Framework
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Token-based authentication
- **Security**: Rate limiting, CORS, security headers
- **API**: RESTful API with versioning

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-django-lms/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Database Configuration
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_HOST=db.cweioqxunsoopnvfbrhq.supabase.co
   DB_PORT=5432
   
   # CORS Configuration
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔐 Security Features

### Frontend Security
- Content Security Policy (CSP) headers
- XSS protection
- CSRF protection
- Secure token storage
- Input sanitization
- Rate limiting on client side

### Backend Security
- Token-based authentication
- Rate limiting middleware
- CORS configuration
- Security headers
- Input validation
- SQL injection protection
- XSS protection

## 📁 Project Structure

```
react-django-lms/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and API client
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Django backend
│   ├── core/               # Django project settings
│   ├── users/              # User management app
│   ├── courses/            # Course management app
│   ├── assignments/        # Assignment system app
│   ├── communications/     # Messaging system app
│   └── manage.py
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `DEBUG=False`
   - Configure production database
   - Set secure `SECRET_KEY`
   - Configure CORS for production domains

2. **Security**
   - Enable HTTPS
   - Configure security headers
   - Set up rate limiting
   - Configure logging

3. **Performance**
   - Enable caching
   - Optimize static files
   - Configure CDN
   - Database optimization

## 📝 API Documentation

The API documentation is available at `/api/v1/` when running the Django development server.

### Authentication Endpoints
- `POST /api/v1/users/auth/login/` - User login
- `POST /api/v1/users/auth/register/` - User registration
- `POST /api/v1/users/auth/logout/` - User logout

### User Management
- `GET /api/v1/users/` - List users (admin only)
- `GET /api/v1/users/me/` - Get current user profile
- `PUT /api/v1/users/me/` - Update user profile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.