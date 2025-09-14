# React-Django LMS (Learning Management System)

A modern Learning Management System built with React frontend and Django backend.

## Project Structure

```
react-django-lms/
├── frontend/          # React frontend application
├── backend/           # Django backend API
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## Features

- **Frontend (React)**
  - Modern React with TypeScript
  - Responsive design
  - Component-based architecture
  - State management with Redux Toolkit
  - Routing with React Router

- **Backend (Django)**
  - Django REST Framework
  - PostgreSQL database
  - JWT authentication
  - API documentation with Swagger
  - Admin interface

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- PostgreSQL
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

## Development

### Frontend Development
- Uses Create React App with TypeScript
- ESLint and Prettier for code formatting
- Jest for testing

### Backend Development
- Django REST Framework for API development
- PostgreSQL for database
- Django Debug Toolbar for development
- pytest for testing

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
