"""
Simplified ML Service using Pre-trained Models
This version uses DeepFace library which includes pre-trained models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import base64
import io
import numpy as np
from PIL import Image
from deepface import DeepFace
import cv2

app = FastAPI(title="Emotion Detection ML Service - DeepFace")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Emotion mapping (DeepFace to our labels)
EMOTION_MAPPING = {
    'angry': 'anger',
    'disgust': 'disgust',
    'fear': 'fear',
    'happy': 'joy',
    'sad': 'sadness',
    'surprise': 'surprise',
    'neutral': 'neutral'
}


class EmotionRequest(BaseModel):
    image_base64: str
    target_emotions: List[str]


class EmotionResult(BaseModel):
    emotion: str
    confidence: float


class EmotionResponse(BaseModel):
    emotions: List[EmotionResult]
    faces_detected: int


@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Emotion Detection ML Service (DeepFace)",
        "models": "Pre-trained emotion detection models"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "backend": "DeepFace",
        "supported_emotions": list(EMOTION_MAPPING.values())
    }


@app.post("/detect-emotions", response_model=EmotionResponse)
async def detect_emotions(request: EmotionRequest):
    """
    Detect emotions using DeepFace library
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # If image is RGBA, convert to RGB
        if img_array.shape[-1] == 4:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
        
        # Analyze emotions using DeepFace
        result = DeepFace.analyze(
            img_path=img_array,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv'
        )
        
        # Handle both single face and multiple faces
        if isinstance(result, list):
            analysis = result[0]  # Use first detected face
            num_faces = len(result)
        else:
            analysis = result
            num_faces = 1
        
        # Extract emotions
        detected_emotions = analysis['emotion']
        
        # Filter by target emotions and format response
        emotions = []
        for deepface_emotion, confidence in detected_emotions.items():
            mapped_emotion = EMOTION_MAPPING.get(deepface_emotion, deepface_emotion)
            
            if mapped_emotion in request.target_emotions:
                emotions.append(
                    EmotionResult(
                        emotion=mapped_emotion,
                        confidence=confidence / 100.0  # Convert to 0-1 range
                    )
                )
        
        # Sort by confidence
        emotions.sort(key=lambda x: x.confidence, reverse=True)
        
        return EmotionResponse(
            emotions=emotions,
            faces_detected=num_faces
        )
        
    except Exception as e:
        # If face detection fails, return empty results instead of error
        print(f"Error processing image: {str(e)}")
        
        # Return default low-confidence predictions for development
        emotions = [
            EmotionResult(emotion=emotion, confidence=0.1)
            for emotion in request.target_emotions
        ]
        
        return EmotionResponse(
            emotions=emotions,
            faces_detected=0
        )


@app.post("/batch-detect")
async def batch_detect_emotions(requests: List[EmotionRequest]):
    """
    Process multiple frames in batch
    """
    try:
        results = []
        for req in requests:
            response = await detect_emotions(req)
            results.append(response)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error in batch processing: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)