import os
import json
from typing import Dict, List, Any, Optional
from google import genai
from pydantic import BaseModel, Field

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(vertexai=True,project="eat-good-vsion",location="us-central1")


class UserProfile(BaseModel):
    """User profile containing dietary preferences and health goals"""
    user_id: str
    name: Optional[str] = None
    weight_goal: Optional[str] = None  # "lose", "maintain", "gain"
    dietary_restrictions: List[str] = Field(default_factory=list)  # e.g., ["vegan", "gluten-free"]
    allergies: List[str] = Field(default_factory=list)
    health_conditions: List[str] = Field(default_factory=list)  # e.g., ["diabetes", "hypertension"]
    daily_calorie_target: Optional[int] = None
    activity_level: Optional[str] = None  # "sedentary", "moderate", "active", "very active"


class NutritionAnalyzer:
    def __init__(self, model_name="gemini-2.0-flash"):
        """Initialize the Nutrition Analyzer with Gemini model"""
        self.model_name = model_name
        self.client = client
        
    def _create_analysis_prompt(self, nutrition_data: Dict, user_profile: Optional[UserProfile] = None) -> str:
        """
        Create a detailed prompt for the Gemini model based on nutrition data and user profile
        
        Args:
            nutrition_data: Dictionary containing nutrition facts
            user_profile: Optional user profile for personalized recommendations
            
        Returns:
            Structured prompt for the Gemini model
        """
        # Extract nutrition information
        calories = nutrition_data.get("calories", "unknown")
        fat = nutrition_data.get("fat", "unknown")
        carbs = nutrition_data.get("carbohydrates", "unknown")
        protein = nutrition_data.get("protein", "unknown")
        ingredients = nutrition_data.get("ingredients", [])
        ingredients_text = ", ".join(ingredients) if ingredients else "unknown"
        
        # Base prompt structure
        prompt = f"""
        # Nutrition Analysis Task
        
        ## Product Information
        - Calories: {calories} kcal
        - Fat: {fat}g
        - Carbohydrates: {carbs}g
        - Protein: {protein}g
        - Ingredients: {ingredients_text}
        - Raw OCR Text: {nutrition_data.get("raw_text", "Not provided")}
        
        ## Analysis Requirements
        
        1. Provide a comprehensive health assessment of this food item 
        2. Identify both positive nutritional aspects and potential concerns
        3. Use a friendly, conversational tone with short, impactful statements
        4. Include emoji where appropriate to make the analysis visually engaging
        5. Format your analysis for easy scanning on a mobile app
        """
        
        # Add personalized sections if user profile is available
        if user_profile:
            prompt += f"""
            ## User Profile
            - Name: {user_profile.name if user_profile.name else "User"}
            - Weight Goal: {user_profile.weight_goal if user_profile.weight_goal else "Not specified"}
            - Dietary Restrictions: {', '.join(user_profile.dietary_restrictions) if user_profile.dietary_restrictions else "None"}
            - Allergies: {', '.join(user_profile.allergies) if user_profile.allergies else "None"}
            - Health Conditions: {', '.join(user_profile.health_conditions) if user_profile.health_conditions else "None"}
            - Daily Calorie Target: {user_profile.daily_calorie_target if user_profile.daily_calorie_target else "Not specified"}
            - Activity Level: {user_profile.activity_level if user_profile.activity_level else "Not specified"}
            
            ## Personalization Requirements
            1. Evaluate if this food aligns with the user's dietary preferences and restrictions
            2. Assess if any ingredients conflict with the user's allergies (highlight these as warnings)
            3. Determine if this food is appropriate for their weight goal and health conditions
            4. Suggest how this food might fit into their daily calorie target
            """
            
        # Output structuring requirements
        prompt += """
        ## Output Format
        Structure your response in JSON format with the following fields:
        
        ```json
        {
          "summary": "One-sentence overview with emoji",
          "health_score": "A number from 1-10 with 10 being extremely healthy",
          "positive_aspects": ["List of 2-3 positive nutritional aspects with emoji"],
          "concerns": ["List of 2-3 nutritional concerns with emoji"],
          "allergen_warnings": ["List of potential allergens found in ingredients"],
          "alternatives": ["List of 2-3 healthier alternatives if applicable"],
          "tips": ["1-2 tips on how to enjoy this food in a balanced way"],
          "fit_for_user": "Whether this food fits the user's profile (Yes/No/Partially)",
          "explanation": "2-3 sentences explaining the fit assessment"
        }
        ```
        
        Return ONLY the JSON object without any additional text or explanations. Ensure the JSON is valid and properly formatted.
        """
        
        return prompt
        
    def analyze_nutrition(self, 
                         nutrition_data: Dict, 
                         user_profile: Optional[UserProfile] = None,
                         product_name: Optional[str] = None) -> Dict:
        """
        Analyze nutrition data using Gemini API
        
        Args:
            nutrition_data: Dictionary containing nutrition facts
            user_profile: Optional user profile for personalized analysis
            product_name: Optional product name
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Add product name to nutrition data if provided
            if product_name:
                enriched_data = {**nutrition_data, "product_name": product_name}
            else:
                enriched_data = nutrition_data
            
            # Generate the prompt
            prompt = self._create_analysis_prompt(enriched_data, user_profile)
            
            # Get response from Gemini using the updated method
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            
            # Parse the JSON response
            try:
                # Remove any markdown formatting if present (```json and ```)
                response_text = response.text
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()
                
                analysis_result = json.loads(response_text)
                return {
                    "success": True,
                    "product_name": product_name or "Food Item",
                    "nutrition_data": nutrition_data,
                    "analysis": analysis_result
                }
            except json.JSONDecodeError as e:
                # If JSON parsing fails, return the raw text
                return {
                    "success": False,
                    "error": "Failed to parse Gemini response as JSON",
                    "raw_response": response.text
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_visual_verdict(self, analysis_result: Dict) -> Dict:
        """
        Generate a visually appealing verdict for frontend display
        
        Args:
            analysis_result: The analysis result from analyze_nutrition
            
        Returns:
            Dictionary with frontend-friendly display data
        """
        if not analysis_result.get("success", False):
            return {
                "title": "Analysis Failed",
                "color": "#F44336",  # Red
                "icon": "error",
                "message": analysis_result.get("error", "Unable to analyze nutrition data")
            }
        
        analysis = analysis_result.get("analysis", {})
        health_score = int(analysis.get("health_score", 5))
        
        # Define color scale based on health score
        if health_score >= 8:
            color = "#4CAF50"  # Green
            icon = "thumb_up"
        elif health_score >= 6:
            color = "#FFC107"  # Amber
            icon = "thumbs_up_down"
        else:
            color = "#F44336"  # Red
            icon = "thumb_down"
        
        # Generate a concise verdict for display
        return {
            "title": analysis.get("summary", "Food Analysis"),
            "color": color,
            "icon": icon,
            "health_score": health_score,
            "positive_aspects": analysis.get("positive_aspects", []),
            "concerns": analysis.get("concerns", []),
            "alternatives": analysis.get("alternatives", []),
            "tips": analysis.get("tips", []),
            "fit_for_user": analysis.get("fit_for_user", "Unknown"),
            "explanation": analysis.get("explanation", "")
        }


# Mock function to get user profile from database (in real app)
def get_user_profile(user_id: str) -> Optional[UserProfile]:
    """
    Retrieve user profile from database
    Mock implementation - replace with actual database call
    """
    # Mock user profile for demonstration
    mock_profiles = {
        "user123": UserProfile(
            user_id="user123",
            name="Alex",
            weight_goal="lose",
            dietary_restrictions=["vegetarian"],
            allergies=["peanuts", "shellfish"],
            health_conditions=["high_cholesterol"],
            daily_calorie_target=1800,
            activity_level="moderate"
        )
    }
    
    return mock_profiles.get(user_id)


# Example usage
if __name__ == "__main__":
    # Sample nutrition data (similar to what we'd get from vision.py)
    sample_nutrition = {
        "calories": 240,
        "fat": 12,
        "carbohydrates": 30,
        "protein": 5,
        "ingredients": ["Wheat Flour", "Sugar", "Palm Oil", "Cocoa", "Salt"],
        "raw_text": "Nutrition Facts\nServing Size 1 bar (40g)\nCalories 240\nTotal Fat 12g\nSaturated Fat 6g\nSodium 150mg\nTotal Carbohydrate 30g\nDietary Fiber 2g\nSugars 15g\nProtein 5g"
    }
    
    # Initialize analyzer
    analyzer = NutritionAnalyzer()
    
    # Get mock user profile
    user = get_user_profile("user123")
    
    # Analyze nutrition
    analysis = analyzer.analyze_nutrition(
        nutrition_data=sample_nutrition,
        user_profile=user,
        product_name="Chocolate Cookie Bar"
    )
    
    # Generate visual verdict for frontend
    verdict = analyzer.get_visual_verdict(analysis)
    
    print(json.dumps(verdict, indent=2))