# Quick Start Guide - Emotion Stream

## 🎉 Your Project is Ready!

Both services are now running successfully:

- **Frontend**: http://localhost:8080
- **ML Service API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 What Was Fixed

1. **requirements.txt** - Cleaned up corrupted content with proper Python dependencies
2. **Frontend Dockerfile** - Optimized to use official Bun image
3. **ML Service Dockerfile** - Fixed package names for newer Debian versions
4. **compose.yaml** - Added proper networking and service dependencies
5. **Added .dockerignore** files for both services

## 🚀 Common Commands

### Start the project

```bash
docker-compose up
```

### Start in background (detached mode)

```bash
docker-compose up -d
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f ml-service
```

### Stop the project

```bash
docker-compose down
```

### Rebuild after code changes

```bash
docker-compose up --build
```

### Check service status

```bash
docker-compose ps
```

## 🧪 Testing the Services

### Test ML Service Health

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy",
  "backend": "DeepFace",
  "supported_emotions": [
    "anger",
    "disgust",
    "fear",
    "joy",
    "sadness",
    "surprise",
    "neutral"
  ]
}
```

### Test Emotion Detection

```bash
curl -X POST http://localhost:8000/detect-emotions \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "<your-base64-image>",
    "target_emotions": ["joy", "sadness"]
  }'
```

### Access Frontend

Open your browser and navigate to:

```
http://localhost:8080
```

## 📊 Service Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser       │────▶│   Frontend       │────▶│  ML Service     │
│  localhost:8080 │     │  React + Vite    │     │  FastAPI        │
│                 │◀────│  Port: 8080      │◀────│  Port: 8000     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               │                          │
                               ▼                          ▼
                        Docker Network            DeepFace Models
                   emotion-stream-network         (Auto-downloaded)
```

## 🔍 Service Details

### Frontend Service

- **Technology**: React 18 + Vite + TypeScript + Bun
- **Port**: 8080
- **Hot Reload**: ✅ Enabled
- **Volume Mounts**: Source code mounted for development

### ML Service

- **Technology**: FastAPI + DeepFace + TensorFlow
- **Port**: 8000
- **Models**: Pre-trained emotion detection models
- **Health Check**: ✅ Enabled (checks every 30s)
- **Supported Emotions**:
  - joy
  - sadness
  - anger
  - fear
  - surprise
  - disgust
  - neutral

## 🐛 Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs ml-service
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Port already in use

```bash
# Check what's using the ports
lsof -i :8000  # ML Service
lsof -i :8080  # Frontend

# Kill the process or change ports in compose.yaml
```

### ML Service downloading models (first run)

The first time you run the ML service, it will download pre-trained models (~100MB).
This is normal and only happens once. You'll see:

```
Directory /root/.deepface created
Directory /root/.deepface/weights created
```

### Frontend hot reload not working

```bash
# Rebuild the frontend
docker-compose up --build frontend
```

### Out of memory

Increase Docker memory limit:

- Docker Desktop → Settings → Resources → Memory: 4GB minimum

## 📝 Development Workflow

1. **Make code changes** in your editor
2. **Frontend changes**: Auto-reload (no restart needed)
3. **Backend changes**:
   ```bash
   docker-compose restart ml-service
   ```
4. **Dependency changes**:
   ```bash
   docker-compose up --build
   ```

## 🔐 Environment Variables

You can customize behavior by editing `compose.yaml`:

```yaml
environment:
  # Frontend
  - NODE_ENV=development
  - VITE_ML_SERVICE_URL=http://ml-service:8000

  # ML Service
  - PYTHONUNBUFFERED=1
```

## 📦 Project Structure

```
emotion-stream/
├── frontend/              # React frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── dockerfile        # Frontend Dockerfile
│   └── .dockerignore     # Ignore patterns
│
├── backend/
│   └── ml-service/       # ML service
│       ├── main.py       # FastAPI app
│       ├── models/       # Model storage
│       ├── Dockerfile    # ML Dockerfile
│       ├── requirements.txt
│       └── .dockerignore
│
├── compose.yaml          # Docker Compose config
└── README.md             # Full documentation
```

## 🎯 Next Steps

1. ✅ Services are running
2. 📱 Open http://localhost:8080 in your browser
3. 🎬 Upload a video and test emotion detection
4. 🔧 Customize emotions in the UI
5. 📊 View detected emotional moments

## 💡 Pro Tips

- **API Documentation**: Visit http://localhost:8000/docs for interactive API testing
- **Debug Mode**: Check `docker-compose logs -f` for real-time debugging
- **Clean Restart**: Use `docker-compose down -v && docker-compose up --build` for a fresh start
- **Production Build**: Use separate production Dockerfiles when deploying

## 🆘 Need Help?

- Check the logs: `docker-compose logs -f`
- Verify containers: `docker-compose ps`
- Test health: `curl http://localhost:8000/health`
- Read full docs: See README.md

---

**Status**: ✅ All systems operational
**Frontend**: http://localhost:8080
**ML Service**: http://localhost:8000
**API Docs**: http://localhost:8000/docs
