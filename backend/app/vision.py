import io
import os
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
from google.cloud import vision
from google.cloud.vision_v1 import AnnotateImageResponse
from PIL import Image


class VisionProcessor:
    def __init__(self):
        # Initialize the Google Cloud Vision client
        # Make sure you have set GOOGLE_APPLICATION_CREDENTIALS environment variable
        # or explicitly provide credentials
        self.client = vision.ImageAnnotatorClient()
        
    def preprocess_image(self, image_bytes: bytes) -> bytes:
        """
        Preprocess the image to improve OCR results
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Processed image bytes
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
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
    
    def detect_text(self, image_bytes: bytes, preprocess: bool = True) -> List[str]:
        """
        Detect text in the provided image using Google Cloud Vision API
        
        Args:
            image_bytes: Raw image bytes
            preprocess: Whether to preprocess the image before OCR
            
        Returns:
            List of extracted text strings
        """
        # Preprocess image if requested
        if preprocess:
            image_bytes = self.preprocess_image(image_bytes)
        
        # Prepare image for Google Cloud Vision
        image = vision.Image(content=image_bytes)
        
        # Perform text detection
        response = self.client.text_detection(image=image)
        
        # Check for errors
        if response.error.message:
            raise Exception(f"Error detecting text: {response.error.message}")
        
        # Extract text from the response
        texts = []
        for text in response.text_annotations:
            texts.append(text.description)
        
        # The first text annotation contains the entire detected text
        return texts[1:] if len(texts) > 0 else []
    
    def detect_nutrition_facts(self, image_bytes: bytes) -> Dict:
        """
        Extract nutrition facts from an image using Google Cloud Vision API
        This is specialized for nutrition facts tables
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Dictionary containing nutrition information
        """
        # Prepare image for Google Cloud Vision
        image = vision.Image(content=image_bytes)
        
        # Get text detection results
        response = self.client.text_detection(image=image)
        
        if response.error.message:
            raise Exception(f"Error detecting nutrition facts: {response.error.message}")
        
        # Extract the full text
        if not response.text_annotations:
            return {"error": "No text detected in the image"}
        
        full_text = response.text_annotations[0].description
        
        # Parse nutrition facts from the text using helper method
        return self._parse_nutrition_facts(full_text)
    
    def _parse_nutrition_facts(self, text: str) -> Dict:
        """
        Parse nutrition facts from detected text
        
        Args:
            text: The raw text from OCR
            
        Returns:
            Dictionary with parsed nutrition information
        """
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
            
            # Extract calories
            if "calories" in line_lower:
                # Try to extract numeric value using various patterns
                import re
                calorie_match = re.search(r'calories[:\s]*(\d+)', line_lower)
                if calorie_match:
                    result["calories"] = int(calorie_match.group(1))
            
            # Extract other nutrition facts
            if "fat" in line_lower and not "saturated" in line_lower:
                # Extract fat content
                fat_match = re.search(r'fat[:\s]*(\d+\.?\d*)g', line_lower)
                if fat_match:
                    result["fat"] = float(fat_match.group(1))
            
            if "carbohydrate" in line_lower or "carbs" in line_lower:
                # Extract carbohydrate content
                carb_match = re.search(r'carb[^:]*[:\s]*(\d+\.?\d*)g', line_lower)
                if carb_match:
                    result["carbohydrates"] = float(carb_match.group(1))
            
            if "protein" in line_lower:
                # Extract protein content
                protein_match = re.search(r'protein[:\s]*(\d+\.?\d*)g', line_lower)
                if protein_match:
                    result["protein"] = float(protein_match.group(1))
            
            # Check for ingredients list
            if "ingredients" in line_lower:
                # Ingredients typically follow the "Ingredients:" label
                if i < len(lines) - 1:
                    ingredients_text = lines[i+1]
                    # Split by commas or periods
                    ingredients = [ing.strip() for ing in re.split(r'[,.]', ingredients_text) if ing.strip()]
                    result["ingredients"] = ingredients
        
        return result
    
    def analyze_product_image(self, image_bytes: bytes) -> Dict:
        """
        Complete analysis of a product image - extract text, nutrition facts
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Dictionary with complete analysis results
        """
        try:
            # Extract general text
            all_text = self.detect_text(image_bytes)
            
            # Extract nutrition facts
            nutrition = self.detect_nutrition_facts(image_bytes)
            
            # Combine results
            return {
                "success": True,
                "detected_text": all_text,
                "nutrition_facts": nutrition
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Usage example
if __name__ == "__main__":
    # Test with a local image
    vision_processor = VisionProcessor()
    
    with open("backend/app/sample_images/sample1.jpg", "rb") as image_file:
        image_bytes = image_file.read()
        
    result = vision_processor.analyze_product_image(image_bytes)
    print(result)