# Emotion Stream - Video Emotion Detection

An emotion detection system that analyzes videos and identifies emotional moments using deep learning.

## 🎯 Features

- **Automatic Emotion Detection**: Detects 7 emotions (joy, sadness, anger, fear, surprise, disgust, neutral)
- **Video Processing**: Upload videos and extract emotional moments
- **Real-time Analysis**: Process video frames using pre-trained models
- **Interactive UI**: Select specific emotions to find in your videos
- **Docker-based**: Fully containerized for easy development and deployment

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend  │─────▶│  ML Service  │─────▶│   DeepFace   │
│  (React +   │      │  (FastAPI)   │      │    Models    │
│   Vite)     │◀─────│              │◀─────│              │
└─────────────┘      └──────────────┘      └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- 4GB+ RAM (for ML models)
- 2GB+ free disk space

### Running the Project

1. **Clone the repository**

```bash
git clone <your-repo>
cd emotion-stream
```

2. **Start all services**

```bash
docker-compose up --build
```

3. **Access the application**
   - Frontend: http://localhost:8080
   - ML Service API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### First Run

On the first run, the ML service will download pre-trained models (~100MB). This may take a few minutes.

## 📁 Project Structure

```
emotion-stream/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   ├── dockerfile          # Frontend Dockerfile
│   └── package.json
│
├── backend/
│   ├── ml-service/         # ML inference service
│   │   ├── main.py         # FastAPI application
│   │   ├── Dockerfile      # ML service Dockerfile
│   │   ├── requirements.txt
│   │   └── models/         # Model storage
│   │
│   └── supabase/           # Supabase functions (optional)
│       └── functions/
│           └── detect-emotions/
│
└── compose.yaml            # Docker Compose configuration
```

## 🛠️ Development

### Frontend Development

```bash
cd frontend
bun install
bun run dev
```

### ML Service Development

```bash
cd backend/ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### Hot Reloading

Both services support hot reloading in Docker:

- Frontend: Changes to `src/` files trigger automatic reload
- ML Service: Code changes restart the service automatically

## 🔧 Configuration

### Environment Variables

#### Frontend

- `VITE_ML_SERVICE_URL`: URL of ML service (default: `http://ml-service:8000`)

#### ML Service

- `PYTHONUNBUFFERED`: Enable Python output (set to `1`)

### Docker Compose Services

- **ml-service**: FastAPI service for emotion detection

  - Port: 8000
  - Health check enabled
  - Auto-restart on failure

- **frontend**: React application
  - Port: 8080
  - Volume mounts for hot reloading
  - Depends on ml-service

## 🧪 Testing

### Test ML Service Directly

```bash
curl -X POST http://localhost:8000/detect-emotions \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "<base64-encoded-image>",
    "target_emotions": ["joy", "sadness", "anger"]
  }'
```

### Health Check

```bash
curl http://localhost:8000/health
```

## 📊 API Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Main Endpoints

#### `POST /detect-emotions`

Detect emotions in a single frame.

**Request:**

```json
{
  "image_base64": "base64-encoded-image-data",
  "target_emotions": ["joy", "sadness", "anger"]
}
```

**Response:**

```json
{
  "emotions": [
    {
      "emotion": "joy",
      "confidence": 0.87
    }
  ],
  "faces_detected": 1
}
```

#### `GET /health`

Check service health status.

## 🐛 Troubleshooting

### ML Service Issues

**Problem**: Models not downloading

```bash
# Check logs
docker-compose logs ml-service

# Restart with clean state
docker-compose down -v
docker-compose up --build
```

**Problem**: Out of memory

- Increase Docker memory limit to 4GB+
- Check Docker Desktop settings

### Frontend Issues

**Problem**: Hot reload not working

```bash
# Rebuild the frontend container
docker-compose up --build frontend
```

**Problem**: Cannot connect to ML service

- Check if ml-service is healthy: `docker-compose ps`
- Verify network: `docker network inspect emotion-stream-network`

## 🚀 Production Deployment

### Building for Production

```bash
# Build optimized images
docker-compose -f compose.prod.yaml build

# Deploy to your platform
# (Instructions vary by platform)
```

### Recommendations

- Use GPU-enabled instances for better performance
- Set up proper logging and monitoring
- Configure CORS properly for your domain
- Use environment-specific configuration files

## 📝 Technologies Used

### Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui components
- React Router
- TanStack Query

### Backend

- FastAPI
- DeepFace
- TensorFlow
- OpenCV
- Python 3.10

### DevOps

- Docker
- Docker Compose

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions:

- Open an issue on GitHub
- Check existing issues first
- Provide logs and reproduction steps

## 🎓 Learning Resources

- [DeepFace Documentation](https://github.com/serengil/deepface)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
