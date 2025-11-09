# MMLL - Machine Learning Lifecycle Management

A comprehensive platform for managing machine learning models, predictions, and monitoring throughout their lifecycle.

## 🚀 Features

- **Model Management**: Upload, version, and deploy ML models
- **Real-time Monitoring**: Track model performance and system metrics
- **Prediction Pipeline**: Make predictions with deployed models
- **Anomaly Detection**: Identify unusual patterns in your data
- **Maintenance Scheduling**: Plan and track system maintenance
- **Interactive Dashboard**: Visualize data and metrics
- **User Authentication**: Secure access with JWT tokens

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.8+
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy with Alembic migrations
- **Authentication**: JWT tokens with bcrypt hashing
- **API Documentation**: Automatic OpenAPI/Swagger docs

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Charts**: Chart.js, Recharts, Nivo
- **Forms**: React Hook Form with validation

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/MallamTeja/MMLL.git
cd MMLL
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example .env
# Edit .env with your configuration

# Initialize database
python init_db.py

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm start
```

## 🚀 Usage

1. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

2. **Create an Account**
   - Register a new user account
   - Login with your credentials

3. **Upload Models**
   - Navigate to Models page
   - Upload your trained ML models
   - Configure deployment settings

4. **Monitor Performance**
   - View real-time metrics on the Dashboard
   - Set up alerts for anomalies
   - Schedule maintenance tasks

## 🗃️ Database Schema

### Core Tables
- `users`: User accounts and authentication
- `machines`: Machine/device information
- `models`: ML model metadata and versions
- `predictions`: Prediction requests and results
- `sensor_data`: Time-series sensor measurements
- `alerts`: System alerts and notifications
- `maintenance`: Maintenance schedules and records

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh tokens

### Models
- `GET /api/v1/models` - List all models
- `POST /api/v1/models` - Upload new model
- `GET /api/v1/models/{id}` - Get model details
- `PUT /api/v1/models/{id}` - Update model
- `DELETE /api/v1/models/{id}` - Delete model

### Predictions
- `POST /api/v1/predictions` - Create prediction
- `GET /api/v1/predictions` - List predictions
- `GET /api/v1/predictions/{id}` - Get prediction details

### Machines
- `GET /api/v1/machines` - List all machines
- `POST /api/v1/machines` - Add new machine
- `GET /api/v1/machines/{id}` - Get machine details
- `PUT /api/v1/machines/{id}` - Update machine

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Set production environment variables
2. Build frontend: `npm run build`
3. Configure web server (nginx/Apache)
4. Use production WSGI server (gunicorn)
5. Set up SSL certificates
6. Configure production database

## 🔒 Security

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- SQL injection prevention with ORM
- File upload restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

See `.env.example` files in root and frontend directories for all available configuration options.

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Kill existing processes or change ports
2. **Database connection**: Check database URL and credentials
3. **CORS errors**: Verify frontend URL is in CORS_ORIGINS
4. **Module not found**: Ensure all dependencies are installed

### Logs
- Backend logs: Check `logs/app.log`
- Frontend logs: Browser developer console
- Database logs: Check database server logs

## 📊 Monitoring

- Health check endpoint: `/health`
- Metrics endpoint: `/metrics`
- Status dashboard: Built into frontend

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent async web framework
- Material-UI for beautiful React components
- SQLAlchemy for robust database ORM
- All contributors and open-source libraries used

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

---

Made with ❤️ by [MallamTeja](https://github.com/MallamTeja)