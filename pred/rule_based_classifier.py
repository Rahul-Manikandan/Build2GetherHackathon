import cv2
import numpy as np
import sys
import os

def classify_erosion(image_path):
    if not os.path.exists(image_path):
        return {"error": "File not found"}

    # 1. Load Image
    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Invalid image"}
    
    # Resize for consistent processing
    img = cv2.resize(img, (500, 500))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Extract Features
    
    # A. Vegetation Coverage (Greenery)
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    mask_green = cv2.inRange(hsv, lower_green, upper_green)
    veg_ratio = np.sum(mask_green > 0) / (500 * 500)

    # B. Edge/Texture Density (Roughness)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (500 * 500)

    # C. Line Detection (Rills)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=40, maxLineGap=10)
    line_count = len(lines) if lines is not None else 0

    # D. "Dark Cavity" Detection (Gullies)
    _, dark_mask = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
    dark_ratio = np.sum(dark_mask > 0) / (500 * 500)

    # E. Soil Color & Type Detection
    # Calculate dominant color in non-vegetation areas
    mask_soil = cv2.bitwise_not(mask_green)
    avg_color_hsv = cv2.mean(hsv, mask=mask_soil)[:3]
    h, s, v = avg_color_hsv
    
    soil_color = "Brown"
    soil_type = "Alluvial / Loamy"
    
    if s < 30 and v < 80:
        soil_color = "Black"
        soil_type = "Black Cotton Soil (Clay)"
    elif (h < 20 or h > 160) and s > 50:
        soil_color = "Red"
        soil_type = "Laterite / Red Soil"
    elif 20 <= h <= 45 and s > 50:
        soil_color = "Yellow"
        soil_type = "Sandy / Desert Soil"
    elif v > 200:
        soil_color = "Light / Sandy"
        soil_type = "Sandy Soil"

    # 3. Rule-Based Logic
    prediction = "Slight (Sheet)"
    confidence = 0.5
    reasoning = []

    if veg_ratio > 0.4:
        prediction = "None"
        confidence = 0.8 + (veg_ratio * 0.2)
        reasoning.append(f"High vegetation coverage ({veg_ratio:.1%})")
    elif dark_ratio > 0.12 or (edge_density > 0.12 and line_count > 12):
        prediction = "Severe (Gully)"
        confidence = 0.7 + (dark_ratio * 0.3)
        reasoning.append(f"Significant deep shadows/voids ({dark_ratio:.1%}) or high ruggedness")
    elif line_count > 4 or dark_ratio > 0.03:
        prediction = "Moderate (Rill)"
        confidence = 0.6 + (line_count * 0.01)
        reasoning.append(f"Visible linear drainage patterns or surface irregularities")
    else:
        prediction = "Slight (Sheet)"
        confidence = 0.6
        reasoning.append("Minimal vegetation with uniform soil surface texture")

    return {
        "prediction": prediction,
        "confidence": min(float(confidence), 1.0),
        "soil_analysis": {
            "type": soil_type,
            "color": soil_color
        },
        "metrics": {
            "vegetation": float(veg_ratio),
            "edge_density": float(edge_density),
            "line_count": int(line_count),
            "darkness": float(dark_ratio)
        },
        "reasoning": reasoning
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python rule_based_classifier.py <image_path>")
    else:
        result = classify_erosion(sys.argv[1])
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"Prediction: {result['prediction']}")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"Soil Type: {result['soil_analysis']['type']} ({result['soil_analysis']['color']})")
            print(f"Reasoning: {', '.join(result['reasoning'])}")
            print("Processing Metrics:", result['metrics'])
