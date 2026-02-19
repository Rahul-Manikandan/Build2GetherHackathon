export interface AnalysisResult {
    prediction: string;
    reasoning: string;
    soil: {
        type: string;
        color: string;
    };
    metrics: {
        vegRatio: number;
        darkRatio: number;
    };
}

export async function analyzeErosionImage(imageElement: HTMLImageElement): Promise<AnalysisResult> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error("Could not get canvas context");
    }

    // Standardize size for analysis (as in test_rule_based.js)
    canvas.width = 500;
    canvas.height = 500;
    ctx.drawImage(imageElement, 0, 0, 500, 500);

    const imageData = ctx.getImageData(0, 0, 500, 500);
    const data = imageData.data;

    let greenPixels = 0;
    let darkPixels = 0;
    let rSum = 0, gSum = 0, bSum = 0, soilPixels = 0;
    const totalPixels = 500 * 500;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 1. Vegetation Detection
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
    }

    const vegRatio = greenPixels / totalPixels;
    const darkRatio = darkPixels / totalPixels;

    // Soil Type Heuristic
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
}

export async function processFileForAnalysis(file: File): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                analyzeErosionImage(img).then(resolve).catch(reject);
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
