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

# In-memory user profile storage
current_user_profile = None

# Models for request/response
class ScanResponse(BaseModel):
    success: bool
    product_name: Optional[str] = None
    nutrition_data: Optional[Dict] = None
    analysis: Optional[Dict] = None
    visual_verdict: Optional[Dict] = None
    error: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    weight_goal: Optional[str] = None
    dietary_restrictions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None
    daily_calorie_target: Optional[int] = None
    activity_level: Optional[str] = None

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
):
    """Analyze a product image and provide nutrition insights"""
    try:
        # Read the image file
        contents = await file.read()
        
        # Process the image with Vision API
        vision_result = vision_processor.analyze_product_image(contents)
        
        if not vision_result.get("success"):
            return ScanResponse(
                success=False,
                error=vision_result.get("error", "Failed to analyze image")
            )
        
        # Get nutrition data
        nutrition_data = vision_result.get("nutrition_facts", {})
        
        # Analyze nutrition with user profile context
        analysis = nutrition_analyzer.analyze_nutrition(
            nutrition_data=nutrition_data,
            user_profile=current_user_profile,  # Pass the current user profile
            product_name=product_name
        )
        
        # Get visual verdict
        visual_verdict = nutrition_analyzer.get_visual_verdict(analysis)
        
        return ScanResponse(
            success=True,
            product_name=product_name,
            nutrition_data=nutrition_data,
            analysis=analysis,
            visual_verdict=visual_verdict
        )
        
    except Exception as e:
        logger.error(f"Error in scan_product: {str(e)}")
        logger.error(traceback.format_exc())
        return ScanResponse(
            success=False,
            error=str(e)
        )

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

@app.post("/api/user/profile")
async def update_user_profile(profile: UserProfileUpdate):
    """Update the current user's profile"""
    try:
        global current_user_profile
        
        # Create or update the user profile
        if current_user_profile is None:
            current_user_profile = UserProfile(
                user_id="demo_user",  # Fixed user ID for demo
                **profile.dict(exclude_unset=True)
            )
        else:
            # Update existing profile
            for field, value in profile.dict(exclude_unset=True).items():
                setattr(current_user_profile, field, value)
        
        logger.info(f"Updated user profile: {current_user_profile.dict()}")
        return {"success": True, "profile": current_user_profile.dict()}
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/profile")
async def get_current_profile():
    """Get the current user's profile"""
    if current_user_profile is None:
        return {"success": False, "message": "No profile set"}
    return {"success": True, "profile": current_user_profile.dict()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)