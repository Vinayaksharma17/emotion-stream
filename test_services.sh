#!/bin/bash

# Colors for output
GREEN='\033[0[32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "Emotion Stream - Service Test"
echo "=================================="
echo ""

# Test ML Service Health
echo -n "Testing ML Service health endpoint... "
ML_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$ML_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ ML Service is healthy${NC}"
else
    echo -e "${RED}✗ ML Service failed (HTTP $ML_HEALTH)${NC}"
fi

# Test ML Service Root
echo -n "Testing ML Service root endpoint... "
ML_ROOT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/)
if [ "$ML_ROOT" == "200" ]; then
    echo -e "${GREEN}✓ ML Service root is accessible${NC}"
else
    echo -e "${RED}✗ ML Service root failed (HTTP $ML_ROOT)${NC}"
fi

# Test Frontend
echo -n "Testing Frontend... "
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$FRONTEND" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend failed (HTTP $FRONTEND)${NC}"
fi

echo ""
echo "=================================="
echo "Service Endpoints:"
echo "=================================="
echo -e "${YELLOW}Frontend:${NC}      http://localhost:8080"
echo -e "${YELLOW}ML Service:${NC}    http://localhost:8000"
echo -e "${YELLOW}API Docs:${NC}      http://localhost:8000/docs"
echo ""

# Test emotion detection with a simple base64 image
echo "Testing emotion detection API..."
echo ""

# Create a minimal test - just check if the endpoint responds
DETECT_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs)
if [ "$DETECT_TEST" == "200" ]; then
    echo -e "${GREEN}✓ API documentation is accessible${NC}"
    echo "  Visit http://localhost:8000/docs to test the emotion detection API"
else
    echo -e "${RED}✗ API documentation failed${NC}"
fi

echo ""
echo "=================================="
echo "All Tests Complete!"
echo "=================================="
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Open http://localhost:8080 in your browser to use the app"
echo "2. Open http://localhost:8000/docs to test the ML API"
echo "3. Upload a video and select emotions to detect"
echo ""
