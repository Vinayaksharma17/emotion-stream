# DeepFace Pre-trained Models - Explanation

## Where Are the Models?

The `.gitkeep` file is just a placeholder. DeepFace stores pre-trained models in:

**Inside Docker Container:**

- `/root/.deepface/weights/` - Main model storage
- Models download automatically on first use

**Your Local System:**

- `~/.deepface/weights/` - If running locally without Docker

## Model Download Process

When you make your first emotion detection request, DeepFace will:

1. **Detect you need the emotion model**
2. **Download from GitHub/HuggingFace** (~100-200MB)
3. **Cache in `/root/.deepface/weights/`**
4. **Reuse for all future requests** (no re-download)

## Models That Will Be Downloaded

DeepFace uses these pre-trained models:

1. **Face Detection Model** (opencv or retinaface)

   - ~2-5MB
   - Detects faces in images

2. **Emotion Recognition Model**
   - ~50-100MB
   - Trained on FER2013 dataset
   - Classifies 7 emotions

## First Run Behavior

**What you'll see in logs:**

```bash
Downloading model...
model-weights.h5: 100%|██████████| 52.1M/52.1M [00:15<00:00, 3.47MB/s]
```

**After download:**

- Models cached permanently in container
- Future requests are fast (no download)
- Container restart = models still cached

## How to Trigger Download

### Option 1: Use the API Documentation

1. Go to http://localhost:8000/docs
2. Try the `/detect-emotions` endpoint
3. Use the example request body

### Option 2: Use curl

```bash
# Create a simple 1x1 pixel image (base64)
TEST_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Make API call
curl -X POST http://localhost:8000/detect-emotions \
  -H "Content-Type: application/json" \
  -d "{
    \"image_base64\": \"$TEST_IMAGE\",
    \"target_emotions\": [\"joy\", \"sadness\"]
  }"
```

### Option 3: Use the Frontend

1. Open http://localhost:8080
2. Upload any video
3. Select emotions to detect
4. Models download automatically

## Check If Models Downloaded

```bash
# Check model files
docker exec emotion-ml-service ls -lh /root/.deepface/weights/

# Should show files like:
# - emotion_model_weights.h5
# - facial_expression_model_weights.h5
# etc.
```

## Why This Directory Structure?

```
backend/ml-service/models/  ← Your project directory (volume mount)
└── .gitkeep                ← Placeholder only

/root/.deepface/weights/    ← Inside container (actual models)
└── *.h5                    ← Downloaded model files
```

The `models/` folder in your project is for:

- Custom trained models (if you train your own)
- Checkpoints
- Model exports

The DeepFace pre-trained models go to `~/.deepface/` by default.

## Making Models Persistent

Currently, models are stored **inside the container**. If you remove the container, models are deleted.

To make models persistent across container restarts, you could:

```yaml
# In compose.yaml
volumes:
  - ./backend/ml-service/models:/app/models
  - deepface-cache:/root/.deepface  # Add this line

volumes:
  deepface-cache:  # Define named volume
```

This way, models persist even if you rebuild containers.

## Summary

✅ **Current State**: Empty is normal - models not downloaded yet
✅ **Action Needed**: Make your first API call to trigger download
✅ **Download Size**: ~100-200MB (one-time only)
✅ **Download Time**: ~30-60 seconds depending on internet speed
✅ **After Download**: All future requests are fast

**The models will appear automatically when you use the emotion detection feature!**
