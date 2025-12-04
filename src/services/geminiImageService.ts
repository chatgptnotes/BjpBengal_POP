/**
 * Gemini Image Generation Service
 * Generates AI-powered infographic images for constituencies using Gemini API
 */

// Types
export interface InfographicData {
  constituency: {
    name: string;
    district: string;
    cluster: string;
    isUrban: boolean;
    totalVoters: number;
  };
  demographics: {
    population: number;
    literacyRate: number;
    urbanPercentage: number;
    sexRatio: number;
    ageDistribution: {
      age_0_18: number;
      age_18_35: number;
      age_35_60: number;
      age_60_plus: number;
    };
    genderRatio: {
      male: number;
      female: number;
    };
    castePercentages: {
      sc: number;
      st: number;
      obc: number;
      general: number;
    };
    religionPercentages: {
      hindu: number;
      muslim: number;
      christian: number;
      others: number;
    };
  };
  electionHistory: {
    year2021: {
      winner: string;
      party: string;
      margin: string;
      voteShare?: number;
    };
    year2016: {
      winner: string;
      party: string;
      margin: string;
    };
  };
  currentMLA: {
    name: string;
    party: string;
    votes?: number;
    margin?: number;
  };
  runnerUp?: {
    name: string;
    party: string;
    votes?: number;
  };
  topIssues: Array<{
    label: string;
    score: number;
    trend: string;
  }>;
  segmentSentiments: Array<{
    name: string;
    sentiment: {
      pos: number;
      neg: number;
      neu: number;
    };
    top: string[];
  }>;
  partyStrength: Array<{
    name: string;
    val: number;
    color: string;
  }>;
  infrastructure: {
    wards: number;
    booths: number;
    sensitive: number;
    voters: string;
  };
  socialMedia: {
    total: string;
    sentimentSplit: number[];
    hashtags: string[];
  };
  strategy?: {
    incumbentShield: Array<{ name: string; effect: string; desc: string }>;
    bjpFrictionPoints: Array<{ issue: string; severity: string; desc: string }>;
    pathToVictory: string[];
  };
}

export interface ImageGenerationResult {
  success: boolean;
  imageData?: string; // Base64 encoded image
  mimeType?: string;  // 'image/png' or 'image/jpeg'
  error?: string;
}

export type GenerationStage =
  | 'idle'
  | 'collecting-data'
  | 'generating-prompt'
  | 'calling-api'
  | 'processing-response'
  | 'complete'
  | 'error';

// API Configuration
// Support both env variable names for flexibility
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API || '';

// Image generation models to try (in order of preference)
const IMAGE_MODELS = [
  'gemini-3-pro-image-preview',              // Nano Banana Pro - Primary (best for infographics)
  'gemini-2.0-flash-exp-image-generation',   // Gemini 2.0 Flash fallback
];

function getApiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

/**
 * Build the infographic prompt from constituency data
 */
export function buildInfographicPrompt(data: InfographicData): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `Generate a professional political constituency infographic image with the following specifications:

DESIGN REQUIREMENTS:
- Modern, clean infographic style with a dark slate/blue gradient background (#1e293b to #0f172a)
- Professional political campaign aesthetic suitable for strategy briefings
- Clear visual hierarchy with distinct sections
- Use appropriate icons/symbols for each data category
- Color coding: TMC=green (#10b981), BJP=orange (#f97316), CPI(M)=red (#dc2626), INC=blue (#3b82f6), Neutral=gray
- 16:9 landscape orientation
- High contrast white/light text for readability on dark background
- Include subtle grid patterns or geometric shapes for visual interest

CONSTITUENCY HEADER (Top Banner):
- Large bold title: "${data.constituency.name}"
- Subtitle: "District: ${data.constituency.district} | Cluster: ${data.constituency.cluster}"
- Badge: "${data.constituency.isUrban ? 'Urban' : 'Rural'} Constituency"

KEY STATISTICS PANEL (Below Header):
Display as stat cards with icons:
- Population: ${data.demographics.population?.toLocaleString() || 'N/A'}
- Total Voters: ${data.infrastructure.voters}
- Literacy Rate: ${data.demographics.literacyRate || 'N/A'}%
- Urban: ${data.demographics.urbanPercentage || 'N/A'}%

CURRENT MLA SECTION (Left Side):
- Name: ${data.currentMLA.name}
- Party: ${data.currentMLA.party} (use party color)
- Victory Margin: ${data.currentMLA.margin?.toLocaleString() || 'N/A'} votes
${data.runnerUp ? `- Runner-up: ${data.runnerUp.name} (${data.runnerUp.party})` : ''}

DEMOGRAPHICS SECTION (Visual Charts):
Age Distribution (Horizontal bar chart):
- 0-18 years: ${data.demographics.ageDistribution.age_0_18}%
- 18-35 years: ${data.demographics.ageDistribution.age_18_35}%
- 35-60 years: ${data.demographics.ageDistribution.age_35_60}%
- 60+ years: ${data.demographics.ageDistribution.age_60_plus}%

Religion (Donut/Pie chart):
- Hindu: ${data.demographics.religionPercentages.hindu}%
- Muslim: ${data.demographics.religionPercentages.muslim}%
- Christian: ${data.demographics.religionPercentages.christian}%
- Others: ${data.demographics.religionPercentages.others}%

Caste Composition (Stacked bar):
- SC: ${data.demographics.castePercentages.sc}%
- ST: ${data.demographics.castePercentages.st}%
- OBC: ${data.demographics.castePercentages.obc}%
- General: ${data.demographics.castePercentages.general}%

ELECTION HISTORY (Comparison Section):
2021 Election:
- Winner: ${data.electionHistory.year2021.winner} (${data.electionHistory.year2021.party})
- Margin: ${data.electionHistory.year2021.margin}

2016 Election:
- Winner: ${data.electionHistory.year2016.winner} (${data.electionHistory.year2016.party})
- Margin: ${data.electionHistory.year2016.margin}

TOP 5 VOTER CONCERNS (Horizontal bar chart with trend indicators):
${data.topIssues.slice(0, 5).map((issue, i) =>
  `${i + 1}. ${issue.label}: ${issue.score}% (${issue.trend === 'up' ? 'Rising' : issue.trend === 'down' ? 'Declining' : 'Stable'})`
).join('\n')}

VOTER SEGMENT SENTIMENT (Sentiment meters/gauges):
${data.segmentSentiments.map(seg =>
  `${seg.name}: +${seg.sentiment.pos}% positive / -${seg.sentiment.neg}% negative`
).join('\n')}

PARTY STRENGTH (Horizontal stacked bar):
${data.partyStrength.map(p => `${p.name}: ${p.val}%`).join(' | ')}

SOCIAL MEDIA PULSE (Bottom right corner):
- Total Mentions: ${data.socialMedia.total}
- Sentiment: Positive ${data.socialMedia.sentimentSplit[0]}%, Negative ${data.socialMedia.sentimentSplit[1]}%
- Trending: ${data.socialMedia.hashtags.slice(0, 4).join(', ')}

INFRASTRUCTURE QUICK STATS (Bottom bar):
- Wards: ${data.infrastructure.wards}
- Polling Booths: ${data.infrastructure.booths}
- Sensitive Booths: ${data.infrastructure.sensitive}

FOOTER:
"Bengal Pulse of People | Political Intelligence Report | Generated: ${currentDate}"

STYLE NOTES:
- Use clean sans-serif fonts (similar to Inter or Roboto)
- Maintain consistent spacing and alignment
- Include subtle shadows and depth for cards
- Use gradient fills for charts where appropriate
- The overall design should look professional enough for executive presentations
- Make sure all text is clearly readable
- Use icons from a consistent icon set`;
}

/**
 * Generate constituency infographic using Gemini API
 */
export async function generateConstituencyInfographic(
  data: InfographicData,
  onStageChange?: (stage: GenerationStage, progress: number) => void
): Promise<ImageGenerationResult> {

  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured. Please check your environment settings.'
    };
  }

  const maxRetries = 3;

  // Stage 1: Building prompt
  onStageChange?.('generating-prompt', 20);
  const prompt = buildInfographicPrompt(data);

  // Stage 2: Calling API
  onStageChange?.('calling-api', 40);

  const requestPayload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "4K"
      }
    }
  };

  // Try each model in order until one works
  for (const model of IMAGE_MODELS) {
    let attempt = 0;
    console.log(`[GeminiImageService] Trying model: ${model}`);

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${getApiUrl(model)}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 429) {
          // Rate limited - wait longer
          attempt++;
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 2000));
            continue;
          }
          return {
            success: false,
            error: 'Rate limited. Please wait a moment before generating another infographic.'
          };
        }

        if (response.status === 400) {
          return {
            success: false,
            error: `Invalid request: ${errorText}`
          };
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Stage 3: Processing response
      onStageChange?.('processing-response', 80);

      const responseData = await response.json();

      // Extract image from response
      const candidates = responseData?.candidates;
      if (!candidates || candidates.length === 0) {
        return {
          success: false,
          error: 'No response generated from the API.'
        };
      }

      const parts = candidates[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        return {
          success: false,
          error: 'Empty response from the API.'
        };
      }

      // Find the image part in the response
      for (const part of parts) {
        if (part.inlineData) {
          onStageChange?.('complete', 100);
          return {
            success: true,
            imageData: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png'
          };
        }
      }

      // If no image found, check if there's text explaining why
      const textPart = parts.find((p: any) => p.text);
      if (textPart) {
        return {
          success: false,
          error: `Image generation failed: ${textPart.text}`
        };
      }

      return {
        success: false,
        error: 'No image was generated in the response.'
      };

    } catch (error) {
      attempt++;
      console.error(`[GeminiImageService] Model ${model}, Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Try next model
        console.log(`[GeminiImageService] Model ${model} failed after ${maxRetries} attempts, trying next model...`);
        break;
      }

      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
    }
  }

  // All models failed
  onStageChange?.('error', 0);
  return {
    success: false,
    error: 'Failed to generate image after trying all available models. Please try again later.'
  };
}

/**
 * Convert base64 image data to Blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Download the generated image
 */
export function downloadImage(
  imageData: string,
  mimeType: string,
  filename: string
): void {
  const blob = base64ToBlob(imageData, mimeType);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Get image data URL from base64
 */
export function getImageDataUrl(imageData: string, mimeType: string): string {
  return `data:${mimeType};base64,${imageData}`;
}

export default {
  generateConstituencyInfographic,
  buildInfographicPrompt,
  downloadImage,
  base64ToBlob,
  getImageDataUrl
};
