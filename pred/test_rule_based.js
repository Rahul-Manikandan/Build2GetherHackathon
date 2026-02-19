const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

/**
 * Node.js implementation of the Rule-Based Soil Erosion Classifier
 * Uses the same logic as rule_based_classifier.py
 */
async function classifyErosion(imagePath) {
    try {
        if (!fs.existsSync(imagePath)) {
            console.error("Error: File not found");
            return;
        }

        const image = await Jimp.read(imagePath);
        image.resize(500, 500);

        let greenPixels = 0;
        let darkPixels = 0;
        let rSum = 0, gSum = 0, bSum = 0, soilPixels = 0;
        let totalPixels = 500 * 500;

        // Simple pixel-based feature extraction for Node.js verification
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            const isGreen = g > r && g > b && g > 50;
            if (isGreen) {
                greenPixels++;
            } else {
                rSum += r;
                gSum += g;
                bSum += b;
                soilPixels++;
            }

            // 2. Darkness Detection (Heuristic: Deep shadows/voids)
            const brightness = (r + g + b) / 3;
            if (brightness < 60) {
                darkPixels++;
            }
        });

        const vegRatio = greenPixels / totalPixels;
        const darkRatio = darkPixels / totalPixels;

        // Soil Type Heuristic (RGB based for Node.js simplified version)
        const avgR = rSum / (soilPixels || 1);
        const avgG = gSum / (soilPixels || 1);
        const avgB = bSum / (soilPixels || 1);

        let soilColor = "Brown";
        let soilType = "Alluvial / Loamy";

        if (avgR < 50 && avgG < 50 && avgB < 50) {
            soilColor = "Black";
            soilType = "Black Cotton Soil (Clay)";
        } else if (avgR > avgG * 1.5 && avgR > avgB * 1.5) {
            soilColor = "Red";
            soilType = "Laterite / Red Soil";
        } else if (avgR > 200 && avgG > 180 && avgB < 150) {
            soilColor = "Yellow";
            soilType = "Sandy / Desert Soil";
        }

        let prediction = "Slight (Sheet)";
        let reasoning = "";

        if (vegRatio > 0.4) {
            prediction = "None";
            reasoning = `High vegetation coverage detected (${(vegRatio * 100).toFixed(1)}%)`;
        } else if (darkRatio > 0.12) {
            prediction = "Severe (Gully)";
            reasoning = `Significant deep shadows/voids detected (${(darkRatio * 100).toFixed(1)}%)`;
        } else if (darkRatio > 0.03) {
            prediction = "Moderate (Rill)";
            reasoning = `Visible drainage patterns or cracks detected (${(darkRatio * 100).toFixed(1)}% dark areas)`;
        } else {
            prediction = "Slight (Sheet)";
            reasoning = "Minimal vegetation with mostly uniform soil surface texture";
        }

        return {
            prediction,
            reasoning,
            soil: { type: soilType, color: soilColor },
            metrics: {
                vegRatio,
                darkRatio
            }
        };
    } catch (err) {
        console.error("Processing Error:", err.message);
    }
}

// Test with any image from the seeds folder
const TEST_IMAGE = process.argv[2];

if (!TEST_IMAGE) {
    console.log("Usage: node ai/test_rule_based.js <path_to_image>");
} else {
    classifyErosion(TEST_IMAGE).then(result => {
        if (result) {
            console.log("--- Rule-Based Classification Result ---");
            console.log("Prediction:", result.prediction);
            console.log("Soil Type: ", `${result.soil.type} (${result.soil.color})`);
            console.log("Reasoning: ", result.reasoning);
            console.log("Metrics:   ", result.metrics);
        }
    });
}
