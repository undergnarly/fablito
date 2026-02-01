/**
 * Image Prompt Utilities
 *
 * Based on Google Gemini/Nano Banana Pro best practices:
 * - Describe scenes narratively, not as keyword lists
 * - Use detailed, specific descriptions instead of generic terms
 * - Include: style + subject + characteristics + color palette + lighting + mood
 * - Maintain character consistency with detailed descriptions in every prompt
 *
 * Sources:
 * - https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/
 * - https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide
 */

export interface CharacterParams {
  name: string
  gender: "boy" | "girl"
  age: number
}

export interface ImagePromptParams {
  sceneDescription: string  // From GPT-4o imagePrompt
  character: CharacterParams
  style: string  // watercolor, cartoon, realistic, fantasy, minimalist
  isFirstImage: boolean
}

/**
 * Detailed style descriptions for children's book illustrations
 * Each style has comprehensive visual instructions for consistent generation
 */
export const ILLUSTRATION_STYLES: Record<string, {
  name: string
  description: string
  colorPalette: string
  technique: string
  mood: string
  lighting: string
}> = {
  watercolor: {
    name: "Watercolor Children's Book",
    description: "Soft, dreamy watercolor painting style with gentle color washes and organic brushstrokes. Delicate paper texture visible through transparent layers. Reminiscent of classic children's book illustrations like Beatrix Potter.",
    colorPalette: "Soft pastels with occasional vibrant accents, muted earth tones, gentle gradients, colors bleeding softly into each other",
    technique: "Wet-on-wet watercolor technique, visible brushstrokes, soft edges, layered transparent washes, white paper showing through",
    mood: "Warm, nostalgic, gentle, comforting, magical",
    lighting: "Soft diffused natural light, gentle shadows, warm golden undertones"
  },
  cartoon: {
    name: "Modern Cartoon Animation",
    description: "Bold, vibrant cartoon style with clean vector-like lines and flat color areas. Expressive characters with exaggerated features and dynamic poses. Similar to modern animated shows like Bluey or Paw Patrol.",
    colorPalette: "Bright, saturated primary and secondary colors, bold contrasts, cheerful palette with pops of neon accents",
    technique: "Clean black outlines, cel-shading, flat color fills with minimal gradients, smooth curves, bold shapes",
    mood: "Playful, energetic, fun, adventurous, upbeat",
    lighting: "Bright, even lighting with simple cast shadows, high visibility"
  },
  realistic: {
    name: "Semi-Realistic Digital Painting",
    description: "Detailed digital painting with realistic proportions but stylized for children. Soft, rendered appearance with attention to texture and depth. Similar to Disney concept art or Pixar storybook illustrations.",
    colorPalette: "Rich, natural colors with cinematic color grading, balanced saturation, realistic skin tones with warm undertones",
    technique: "Detailed digital brushwork, soft blending, realistic textures, subtle gradients, painterly finish",
    mood: "Magical yet grounded, immersive, emotionally resonant",
    lighting: "Cinematic lighting with depth, rim lights, ambient occlusion, dramatic but child-friendly"
  },
  fantasy: {
    name: "Magical Fantasy Illustration",
    description: "Enchanting fantasy art style with glowing magical elements and ethereal atmosphere. Rich details with sparkling effects and dreamy backgrounds. Reminiscent of fairy tale book illustrations.",
    colorPalette: "Deep jewel tones (purple, teal, gold) with magical glowing accents, starlight whites, mystical blues and pinks",
    technique: "Luminous glow effects, particle sparkles, soft focus backgrounds, detailed foreground, magical auras around characters",
    mood: "Mystical, wondrous, enchanting, dreamlike, awe-inspiring",
    lighting: "Magical inner glow, soft moonlight, sparkle effects, bioluminescent accents, fairy lights"
  },
  minimalist: {
    name: "Minimalist Scandinavian",
    description: "Clean, simple illustration style with essential shapes and limited color palette. Geometric simplification with charming character design. Similar to modern Scandinavian children's books.",
    colorPalette: "Limited palette of 3-5 colors, muted tones with one accent color, lots of white space, soft grays and warm neutrals",
    technique: "Simple geometric shapes, minimal details, clean lines, flat colors, thoughtful negative space, no outlines or thin lines only",
    mood: "Calm, modern, sophisticated yet playful, peaceful",
    lighting: "Flat, even lighting, minimal shadows, clean and bright"
  }
}

/**
 * Generate age-appropriate character description
 * Children's proportions and features change significantly by age
 */
export function getCharacterDescription(character: CharacterParams): string {
  const { name, gender, age } = character

  const genderDetails = gender === "girl"
    ? {
        pronoun: "she",
        possessive: "her",
        features: "soft, friendly facial features",
        defaultHair: "medium-length hair",
        defaultClothing: "colorful comfortable clothes"
      }
    : {
        pronoun: "he",
        possessive: "his",
        features: "friendly, expressive facial features",
        defaultHair: "short neat hair",
        defaultClothing: "comfortable casual clothes"
      }

  // Age-based physical characteristics
  let ageDescription: string
  let proportions: string
  let expression: string

  if (age >= 2 && age <= 4) {
    proportions = "toddler proportions with a large head relative to body, chubby cheeks, short limbs"
    ageDescription = `a ${age}-year-old toddler`
    expression = "wide curious eyes, innocent expression, rosy cheeks"
  } else if (age >= 5 && age <= 7) {
    proportions = "young child proportions, slightly oversized head, small stature, soft rounded features"
    ageDescription = `a ${age}-year-old young child`
    expression = "bright expressive eyes, cheerful smile, animated expressions"
  } else if (age >= 8 && age <= 10) {
    proportions = "school-age child proportions, more balanced head-to-body ratio, slender build"
    ageDescription = `a ${age}-year-old child`
    expression = "confident eyes, friendly smile, thoughtful expressions"
  } else {
    proportions = "pre-teen proportions, longer limbs, more defined features"
    ageDescription = `a ${age}-year-old pre-teen`
    expression = "expressive eyes showing emotion, natural smile"
  }

  return `${name} is ${ageDescription} ${gender === "girl" ? "girl" : "boy"} with ${proportions}. ` +
    `${genderDetails.features.charAt(0).toUpperCase() + genderDetails.features.slice(1)}, ${expression}. ` +
    `${name} has ${genderDetails.defaultHair} and wears ${genderDetails.defaultClothing}. ` +
    `${genderDetails.pronoun.charAt(0).toUpperCase() + genderDetails.pronoun.slice(1)} appears friendly, relatable, and age-appropriate.`
}

/**
 * Build a complete image generation prompt following Gemini best practices
 * Structure: Style context → Character description → Scene description → Technical requirements
 */
export function buildImagePrompt(params: ImagePromptParams): string {
  const { sceneDescription, character, style, isFirstImage } = params

  const styleConfig = ILLUSTRATION_STYLES[style] || ILLUSTRATION_STYLES.watercolor
  const characterDesc = getCharacterDescription(character)

  // Build comprehensive prompt following narrative description principle
  const parts: string[] = []

  // 1. Style and technique (set the visual context first)
  parts.push(`Create a ${styleConfig.name} illustration.`)
  parts.push(styleConfig.description)

  // 2. Character description (critical for consistency)
  parts.push(`\n\nMAIN CHARACTER: ${characterDesc}`)

  if (isFirstImage) {
    parts.push(
      `This is the first illustration - establish ${character.name}'s distinctive appearance that will remain EXACTLY consistent throughout all story pages. ` +
      `Design memorable, recognizable features: specific hairstyle, clothing colors and patterns, and any accessories.`
    )
  } else {
    parts.push(
      `CRITICAL: ${character.name} must appear EXACTLY as established in previous illustrations - ` +
      `identical face, hairstyle, clothing, colors, and all visual details. Only the pose and scene changes.`
    )
  }

  // 3. Scene description (the specific content for this page)
  parts.push(`\n\nSCENE: ${sceneDescription}`)

  // 4. Technical requirements
  parts.push(`\n\nVISUAL STYLE REQUIREMENTS:`)
  parts.push(`- Color palette: ${styleConfig.colorPalette}`)
  parts.push(`- Technique: ${styleConfig.technique}`)
  parts.push(`- Mood: ${styleConfig.mood}`)
  parts.push(`- Lighting: ${styleConfig.lighting}`)

  // 5. Quality and safety
  parts.push(`\n\nQUALITY: High-quality children's book illustration, safe and appropriate for young children, ` +
    `professional polish, engaging composition that draws the eye to ${character.name}.`)

  return parts.join(" ")
}

/**
 * Build prompt for subsequent images with reference
 * Focuses on maintaining character consistency from the reference image
 */
export function buildReferenceImagePrompt(params: ImagePromptParams): string {
  const { sceneDescription, character, style } = params

  const styleConfig = ILLUSTRATION_STYLES[style] || ILLUSTRATION_STYLES.watercolor

  return `Using the character from the reference image above, create a new ${styleConfig.name} illustration.

CRITICAL CHARACTER CONSISTENCY:
- ${character.name} must look EXACTLY identical to the reference image
- Same face shape, eye color, hair style and color
- Same clothing colors, patterns, and accessories
- Same body proportions and overall appearance
- ONLY the pose, expression, and scene should change

NEW SCENE TO ILLUSTRATE:
${sceneDescription}

MAINTAIN STYLE:
- ${styleConfig.technique}
- ${styleConfig.colorPalette}
- ${styleConfig.lighting}
- ${styleConfig.mood}

Create a cohesive illustration that seamlessly continues the visual story while preserving perfect character consistency.`
}
