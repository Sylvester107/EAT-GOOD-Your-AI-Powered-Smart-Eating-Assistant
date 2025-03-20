from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import json
import os

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

# Get user from header (simple auth)
async def get_current_user(x_user_id: Optional[str] = Header(None)) -> Optional[UserProfile]:
    """Get user profile from header"""
    if not x_user_id:
        return None
    return get_user_profile(x_user_id)

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
        # Read the image
        image_bytes = await file.read()
        
        # Process with vision API
        vision_result = vision_processor.analyze_product_image(image_bytes)
        
        if not vision_result.get("success", False):
            return {
                "success": False,
                "error": vision_result.get("error", "Failed to process image")
            }
        
        # Get nutrition facts from vision result
        nutrition_data = vision_result.get("nutrition_facts", {})
        
        # If no product name provided, try to guess from detected text
        if not product_name:
            all_text = vision_result.get("detected_text", [])
            # Simple heuristic: use first detected text chunk as product name
            if all_text and len(all_text) > 0:
                product_name = all_text[0]
        
        # Analyze nutrition data with Gemini
        analysis_result = nutrition_analyzer.analyze_nutrition(
            nutrition_data=nutrition_data,
            user_profile=current_user,
            product_name=product_name
        )
        
        # Generate visual verdict for frontend
        visual_verdict = nutrition_analyzer.get_visual_verdict(analysis_result)
        
        # Return complete response
        return {
            "success": True,
            "product_name": product_name or "Unknown Product",
            "nutrition_data": nutrition_data,
            "analysis": analysis_result.get("analysis", {}),
            "visual_verdict": visual_verdict
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error processing request: {str(e)}"
        }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)