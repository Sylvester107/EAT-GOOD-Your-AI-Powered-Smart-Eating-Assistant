from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import json
import os
import logging
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Import our modules
from vision import VisionProcessor
from gpt_handler import NutritionAnalyzer, UserProfile, get_user_profile

# Initialize FastAPI app
app = FastAPI(
    title="NutriScan API",
    description="API for analyzing food product images with nutrition information",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize our processors
vision_processor = VisionProcessor()
nutrition_analyzer = NutritionAnalyzer()

# Models for request/response
class ScanResponse(BaseModel):
    success: bool
    product_name: Optional[str] = None
    nutrition_data: Optional[Dict] = None
    analysis: Optional[Dict] = None
    visual_verdict: Optional[Dict] = None
    error: Optional[str] = None

# Error handling middleware
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "Internal server error"}
        )

# Get user from header (simple auth)
async def get_current_user(x_user_id: Optional[str] = Header(None)) -> Optional[UserProfile]:
    """Get user profile from header"""
    if not x_user_id:
        logger.warning("No user ID provided in request")
        return None
    try:
        user = get_user_profile(x_user_id)
        if not user:
            logger.warning(f"User not found: {x_user_id}")
        return user
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return None

@app.post("/api/scan", response_model=ScanResponse)
async def scan_product(
    file: UploadFile = File(...),
    product_name: Optional[str] = Form(None),
    current_user: Optional[UserProfile] = Depends(get_current_user)
):
    """
    Scan a product image and analyze nutrition information
    
    - **file**: Image file containing nutrition facts
    - **product_name**: Optional product name
    - **current_user**: User profile (from header)
    """
    try:
        logger.info(f"Starting product scan for user: {current_user.user_id if current_user else 'anonymous'}")
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            logger.warning(f"Invalid file type: {file.content_type}")
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read the image
        image_bytes = await file.read()
        
        # Process with vision API
        logger.info("Processing image with Vision API")
        vision_result = vision_processor.analyze_product_image(image_bytes)
        
        if not vision_result.get("success", False):
            error_msg = vision_result.get("error", "Failed to process image")
            logger.error(f"Vision API error: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }
        
        # Get nutrition facts from vision result
        nutrition_data = vision_result.get("nutrition_facts", {})
        
        # If no product name provided, try to guess from detected text
        if not product_name:
            all_text = vision_result.get("detected_text", [])
            if all_text and len(all_text) > 0:
                product_name = all_text[0]
                logger.info(f"Extracted product name from image: {product_name}")
        
        # Analyze nutrition data with Gemini
        logger.info("Analyzing nutrition data with Gemini")
        analysis_result = nutrition_analyzer.analyze_nutrition(
            nutrition_data=nutrition_data,
            user_profile=current_user,
            product_name=product_name
        )
        
        if not analysis_result.get("success", False):
            error_msg = analysis_result.get("error", "Failed to analyze nutrition data")
            logger.error(f"Gemini API error: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }
        
        # Generate visual verdict for frontend
        visual_verdict = nutrition_analyzer.get_visual_verdict(analysis_result)
        
        logger.info("Successfully completed product scan and analysis")
        
        # Return complete response
        return {
            "success": True,
            "product_name": product_name or "Unknown Product",
            "nutrition_data": nutrition_data,
            "analysis": analysis_result.get("analysis", {}),
            "visual_verdict": visual_verdict
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in scan_product: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": f"Error processing request: {str(e)}"
        }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Add basic system checks here if needed
        return {
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)