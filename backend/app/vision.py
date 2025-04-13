import io
import os
from typing import Dict, List, Optional, Tuple
import cv2
from google.cloud import vision
import numpy as np
from google.cloud.vision_v1 import AnnotateImageResponse
from PIL import Image
import logging
import traceback
import re

# Configure logging
logger = logging.getLogger(__name__)

class VisionProcessor:
    def __init__(self):
        """Initialize the Google Cloud Vision client"""
        try:
            # Initialize the Google Cloud Vision client
            self.client = vision.ImageAnnotatorClient()
            logger.info("Successfully initialized Vision API client")
        except Exception as e:
            logger.error(f"Failed to initialize Vision API client: {str(e)}")
            raise
        
    def preprocess_image(self, image_bytes: bytes) -> bytes:
        """
        Preprocess the image to improve OCR results
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Processed image bytes
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Failed to decode image")
            
            # Image preprocessing to improve OCR
            # 1. Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # 2. Apply threshold to get black and white image
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # 3. Optional: Noise removal
            kernel = np.ones((1, 1), np.uint8)
            opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
            
            # Convert back to bytes
            processed_img = Image.fromarray(opening)
            buffer = io.BytesIO()
            processed_img.save(buffer, format="PNG")
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def detect_text(self, image_bytes: bytes, preprocess: bool = True) -> List[str]:
        """
        Detect text in the provided image using Google Cloud Vision API
        
        Args:
            image_bytes: Raw image bytes
            preprocess: Whether to preprocess the image before OCR
            
        Returns:
            List of extracted text strings
        """
        try:
            # Preprocess image if requested
            if preprocess:
                logger.info("Preprocessing image before text detection")
                image_bytes = self.preprocess_image(image_bytes)
            
            # Prepare image for Google Cloud Vision
            image = vision.Image(content=image_bytes)
            
            # Perform text detection
            logger.info("Sending request to Vision API for text detection")
            response = self.client.text_detection(image=image)
            
            # Check for errors
            if response.error.message:
                error_msg = f"Vision API error: {response.error.message}"
                logger.error(error_msg)
                raise Exception(error_msg)
            
            # Extract text from the response
            texts = []
            for text in response.text_annotations:
                texts.append(text.description)
            
            logger.info(f"Successfully detected {len(texts)} text blocks")
            # The first text annotation contains the entire detected text
            return texts[1:] if len(texts) > 0 else []
            
        except Exception as e:
            logger.error(f"Error in text detection: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def detect_nutrition_facts(self, image_bytes: bytes) -> Dict:
        """
        Extract nutrition facts from an image using Google Cloud Vision API
        This is specialized for nutrition facts tables
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Dictionary containing nutrition information
        """
        try:
            # Prepare image for Google Cloud Vision
            image = vision.Image(content=image_bytes)
            
            # Get text detection results
            logger.info("Sending request to Vision API for nutrition facts detection")
            response = self.client.text_detection(image=image)
            
            if response.error.message:
                error_msg = f"Vision API error: {response.error.message}"
                logger.error(error_msg)
                raise Exception(error_msg)
            
            # Extract the full text
            if not response.text_annotations:
                logger.warning("No text detected in the image")
                return {"error": "No text detected in the image"}
            
            full_text = response.text_annotations[0].description
            logger.info("Successfully extracted text from nutrition facts")
            
            # Parse nutrition facts from the text using helper method
            return self._parse_nutrition_facts(full_text)
            
        except Exception as e:
            logger.error(f"Error in nutrition facts detection: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def _parse_nutrition_facts(self, text: str) -> Dict:
        """
        Parse nutrition facts from detected text
        
        Args:
            text: The raw text from OCR
            
        Returns:
            Dictionary with parsed nutrition information
        """
        try:
            # Initialize result dictionary
            result = {
                "calories": None,
                "fat": None,
                "carbohydrates": None,
                "protein": None,
                "ingredients": [],
                "raw_text": text
            }
            
            # Split text into lines for easier processing
            lines = text.split('\n')
            
            # Look for common nutrition fact patterns
            for i, line in enumerate(lines):
                line_lower = line.lower()
                
                # Extract calories with more flexible patterns
                if "calories" in line_lower:
                    patterns = [
                        r'calories[:\s]*(\d+)',      # "Calories: 100"
                        r'(\d+)\s*calories',         # "100 calories"
                        r'kcal[:\s]*(\d+)',          # "kcal: 100"
                        r'(\d+)\s*kcal',             # "100 kcal"
                        r'calories.*?(\d+)'          # "calories (100)"
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, line_lower)
                        if match:
                            result["calories"] = int(match.group(1))
                            logger.debug(f"Found calories: {result['calories']}")
                            break
                
                # Extract fat with more flexible patterns
                if "fat" in line_lower and not "saturated" in line_lower:
                    patterns = [
                        r'fat[:\s]*(\d+\.?\d*)\s*g',         # "Fat: 10g"
                        r'(\d+\.?\d*)\s*g\s*fat',            # "10g fat"
                        r'total fat[:\s]*(\d+\.?\d*)\s*g',   # "Total fat: 10g"
                        r'fat.*?\((\d+\.?\d*)g\)'            # "fat (10g)"
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, line_lower)
                        if match:
                            result["fat"] = float(match.group(1))
                            logger.debug(f"Found fat: {result['fat']}g")
                            break
                
                # Extract carbohydrates with more flexible patterns
                if "carbohydrate" in line_lower or "carbs" in line_lower:
                    patterns = [
                        r'carb[^:]*[:\s]*(\d+\.?\d*)\s*g',   # "Carbohydrates: 20g"
                        r'(\d+\.?\d*)\s*g\s*carb',           # "20g carb"
                        r'carbs[:\s]*(\d+\.?\d*)\s*g',       # "Carbs: 20g"
                        r'carbohydrates.*?\((\d+\.?\d*)g\)',  # "carbohydrates (20g)"
                        r'high in carbohydrates.*?\((\d+\.?\d*)g\)'  # "high in carbohydrates (20g)"
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, line_lower)
                        if match:
                            result["carbohydrates"] = float(match.group(1))
                            logger.debug(f"Found carbohydrates: {result['carbohydrates']}g")
                            break
                
                # Extract protein with more flexible patterns
                if "protein" in line_lower:
                    patterns = [
                        r'protein[:\s]*(\d+\.?\d*)\s*g',     # "Protein: 5g"
                        r'(\d+\.?\d*)\s*g\s*protein',        # "5g protein"
                        r'total protein[:\s]*(\d+\.?\d*)\s*g', # "Total protein: 5g"
                        r'protein.*?\((\d+\.?\d*)g\)',        # "protein (5g)"
                        r'contains.*?protein.*?\((\d+\.?\d*)g\)'  # "contains some protein (5g)"
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, line_lower)
                        if match:
                            result["protein"] = float(match.group(1))
                            logger.debug(f"Found protein: {result['protein']}g")
                            break
                
                # Check for ingredients list
                if "ingredients" in line_lower:
                    # Ingredients typically follow the "Ingredients:" label
                    if i < len(lines) - 1:
                        ingredients_text = lines[i+1]
                        # Split by commas or periods
                        ingredients = [ing.strip() for ing in re.split(r'[,.]', ingredients_text) if ing.strip()]
                        result["ingredients"] = ingredients
                        logger.debug(f"Found {len(ingredients)} ingredients")
            
            logger.info("Successfully parsed nutrition facts")
            return result
            
        except Exception as e:
            logger.error(f"Error parsing nutrition facts: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def analyze_product_image(self, image_bytes: bytes) -> Dict:
        """
        Complete analysis of a product image - extract text, nutrition facts
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Dictionary with complete analysis results
        """
        try:
            logger.info("Starting product image analysis")
            
            # Extract general text
            all_text = self.detect_text(image_bytes)
            
            # Extract nutrition facts
            nutrition = self.detect_nutrition_facts(image_bytes)
            
            logger.info("Successfully completed product image analysis")
            
            # Combine results
            return {
                "success": True,
                "detected_text": all_text,
                "nutrition_facts": nutrition
            }
            
        except Exception as e:
            error_msg = f"Error analyzing product image: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": error_msg
            }


# Usage example
if __name__ == "__main__":
    # Test with a local image
    vision_processor = VisionProcessor()
    
    with open("backend/app/sample_images/sample1.jpg", "rb") as image_file:
        image_bytes = image_file.read()
        
    result = vision_processor.analyze_product_image(image_bytes)
    print(result)