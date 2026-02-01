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
  // Fixed character appearance - same across ALL pages
  appearance?: CharacterAppearance
}

/**
 * Fixed character appearance that MUST remain identical across all story pages
 * This is generated once for the first page and reused for all subsequent pages
 */
export interface CharacterAppearance {
  hairColor: string      // e.g., "golden blonde", "dark brown", "bright red"
  hairStyle: string      // e.g., "short curly", "long straight with bangs", "messy spiky"
  eyeColor: string       // e.g., "bright blue", "warm brown", "green"
  skinTone: string       // e.g., "fair with rosy cheeks", "warm tan", "dark brown"
  clothing: string       // e.g., "red hoodie with white stripes and blue jeans"
  accessories?: string   // e.g., "small backpack, baseball cap"
  distinctiveFeatures?: string  // e.g., "freckles on nose, missing front tooth"
}

export interface ImagePromptParams {
  sceneDescription: string  // From GPT-4o imagePrompt
  character: CharacterParams
  style: string  // watercolor, cartoon, realistic, fantasy, minimalist
  isFirstImage: boolean
  isChildPhoto?: boolean  // True if reference image is an uploaded photo of the real child
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
    name: "Photorealistic Portrait Photography",
    description: "Ultra-realistic photograph of a real child. Professional children's portrait photography with sharp focus, natural skin texture, and lifelike details. Looks like an actual photograph taken by a professional photographer, not an illustration or digital art.",
    colorPalette: "True-to-life natural colors, accurate skin tones with natural variations, realistic eye colors with light reflections, natural hair color with individual strands visible",
    technique: "Photorealistic rendering, sharp focus on face, natural skin pores and texture, realistic fabric textures on clothing, depth of field with soft background blur, high resolution details",
    mood: "Warm, genuine, authentic, heartfelt, capturing real childhood moments",
    lighting: "Natural soft lighting like golden hour photography, realistic shadows, catchlights in eyes, professional portrait lighting setup"
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
  },
  anime: {
    name: "Japanese Anime Style",
    description: "Classic Japanese anime art style with expressive large eyes, stylized features, and dynamic compositions. Similar to Studio Ghibli or modern anime aesthetics. Appealing character designs with emotional expressiveness.",
    colorPalette: "Vibrant anime colors, soft gradients on skin and hair, bright eye colors with detailed iris highlights, pastel backgrounds with saturated character colors",
    technique: "Anime-style large expressive eyes with detailed highlights, small nose and mouth, stylized hair with flowing strands, clean linework, cel-shaded coloring, manga-inspired expressions",
    mood: "Cute, expressive, heartwarming, adventurous, emotionally engaging",
    lighting: "Anime-style lighting with soft shadows, hair shine highlights, glowing rim lights, dramatic backlighting for emotional scenes"
  },
  handdrawn: {
    name: "Child's Hand-Drawn Art",
    description: "Charming naive art style that looks like it was drawn by a talented child. Imperfect but endearing drawings with wobbly lines, simple shapes, and innocent creativity. Like crayon or colored pencil drawings from a child's imagination.",
    colorPalette: "Bright crayon colors, uneven color fills that go outside the lines, primary colors mixed with unexpected combinations, white paper showing through",
    technique: "Wobbly hand-drawn lines, stick-figure inspired proportions, simple circle heads with dot eyes, uneven coloring like crayon or colored pencil, charming imperfections, naive perspective",
    mood: "Innocent, joyful, playful, imaginative, heartwarming in its simplicity",
    lighting: "Flat childlike rendering, no complex shadows, simple sun in corner, basic day/night indication"
  }
}

/**
 * Generate random but consistent character appearance
 * This creates specific, memorable features that will be used across ALL pages
 */
export function generateRandomAppearance(gender: "boy" | "girl", age: number): CharacterAppearance {
  const hairColors = ["golden blonde", "dark brown", "light brown", "black", "auburn red", "strawberry blonde"]
  const boyHairStyles = ["short messy", "short neat with side part", "curly short", "spiky", "wavy medium-length"]
  const girlHairStyles = ["long straight", "shoulder-length wavy", "two braids", "ponytail with bangs", "short bob", "curly long"]
  const eyeColors = ["bright blue", "warm brown", "hazel green", "dark brown", "light gray-blue"]
  const skinTones = ["fair with rosy cheeks", "light with freckles", "warm olive", "tan", "medium brown", "dark brown"]

  // Varied clothing options without specific patterns that models might fixate on
  const boyClothing = [
    "bright red t-shirt and blue jeans",
    "green hoodie with gray shorts",
    "blue polo shirt with khaki pants",
    "yellow sweater and dark jeans",
    "orange jacket over white t-shirt and brown pants",
    "navy blue long-sleeve shirt and cargo shorts",
    "striped green and white t-shirt with black pants",
    "turquoise hoodie and denim shorts",
    "red plaid flannel shirt and jeans",
    "plain white t-shirt with blue vest and tan shorts"
  ]
  const girlClothing = [
    "pink dress with white shoes",
    "blue denim overalls over a yellow t-shirt",
    "purple sweater and pink leggings",
    "red cardigan over a white dress",
    "teal t-shirt and purple skirt",
    "orange sundress with sandals",
    "light blue blouse and navy skirt",
    "green hoodie with pink shorts",
    "yellow t-shirt and denim skirt",
    "lavender dress with white cardigan"
  ]

  const boyAccessories = ["small blue backpack", "baseball cap", "wristband", "watch", ""]
  const girlAccessories = ["hair bow", "small backpack", "hair clips", "bracelet", "headband", ""]

  const distinctiveFeatures = [
    "small dimples when smiling",
    "a few light freckles on the nose",
    "slightly chubby cheeks",
    "a warm, bright smile",
    ""
  ]

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  return {
    hairColor: pick(hairColors),
    hairStyle: gender === "girl" ? pick(girlHairStyles) : pick(boyHairStyles),
    eyeColor: pick(eyeColors),
    skinTone: pick(skinTones),
    clothing: gender === "girl" ? pick(girlClothing) : pick(boyClothing),
    accessories: gender === "girl" ? pick(girlAccessories) : pick(boyAccessories),
    distinctiveFeatures: pick(distinctiveFeatures)
  }
}

/**
 * Generate age-appropriate character description with FIXED appearance details
 * Children's proportions and features change significantly by age
 */
export function getCharacterDescription(character: CharacterParams): string {
  const { name, gender, age, appearance } = character

  const genderWord = gender === "girl" ? "girl" : "boy"
  const pronoun = gender === "girl" ? "she" : "he"
  const possessive = gender === "girl" ? "her" : "his"

  // Age-based physical characteristics
  let proportions: string
  let expression: string

  if (age >= 2 && age <= 4) {
    proportions = "toddler proportions with a large head relative to body, chubby cheeks, short limbs"
    expression = "wide curious eyes, innocent expression"
  } else if (age >= 5 && age <= 7) {
    proportions = "young child proportions, slightly oversized head, small stature, soft rounded features"
    expression = "bright expressive eyes, cheerful smile"
  } else if (age >= 8 && age <= 10) {
    proportions = "school-age child proportions, more balanced head-to-body ratio, slender build"
    expression = "confident eyes, friendly smile"
  } else {
    proportions = "pre-teen proportions, longer limbs, more defined features"
    expression = "expressive eyes, natural smile"
  }

  // If we have fixed appearance, use it for exact consistency
  if (appearance) {
    const parts = [
      `${name} is a ${age}-year-old ${genderWord} with ${proportions}.`,
      ``,
      `EXACT APPEARANCE (MUST BE IDENTICAL IN EVERY IMAGE):`,
      `- Hair: ${appearance.hairColor} ${appearance.hairStyle}`,
      `- Eyes: ${appearance.eyeColor}`,
      `- Skin: ${appearance.skinTone}`,
      `- Outfit: ${appearance.clothing}`,
    ]

    if (appearance.accessories) {
      parts.push(`- Accessories: ${appearance.accessories}`)
    }
    if (appearance.distinctiveFeatures) {
      parts.push(`- Distinctive features: ${appearance.distinctiveFeatures}`)
    }

    parts.push(``, `${name} has ${expression}. ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} is the main character and must be instantly recognizable in every scene.`)

    return parts.join("\n")
  }

  // Fallback for legacy calls without appearance
  const defaultHair = gender === "girl" ? "medium-length hair" : "short neat hair"
  const defaultClothing = gender === "girl" ? "colorful comfortable clothes" : "comfortable casual clothes"

  return `${name} is a ${age}-year-old ${genderWord} with ${proportions}. ` +
    `${name} has ${defaultHair} and wears ${defaultClothing}. ` +
    `${expression}. ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} appears friendly, relatable, and age-appropriate.`
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
  parts.push(`Create a ${styleConfig.name} children's book illustration.`)
  parts.push(styleConfig.description)

  // 2. Character description (critical for consistency)
  parts.push(`\n\n=== MAIN CHARACTER (MUST BE EXACTLY AS DESCRIBED) ===`)
  parts.push(characterDesc)

  if (isFirstImage && character.appearance) {
    parts.push(
      `\n\nFIRST IMAGE REQUIREMENTS:`,
      `This is the FIRST illustration establishing ${character.name}'s appearance.`,
      `The character design you create here will be the REFERENCE for all subsequent pages.`,
      `Make ${character.name} visually memorable and distinctive.`,
      `IMPORTANT: Use EXACTLY the appearance details listed above - do not change or improvise any features.`
    )
  } else if (!isFirstImage && character.appearance) {
    parts.push(
      `\n\n⚠️ CRITICAL CHARACTER CONSISTENCY:`,
      `${character.name} MUST look EXACTLY identical to previous illustrations:`,
      `- Same hair: ${character.appearance.hairColor} ${character.appearance.hairStyle}`,
      `- Same eyes: ${character.appearance.eyeColor}`,
      `- Same skin tone: ${character.appearance.skinTone}`,
      `- Same outfit: ${character.appearance.clothing}`,
      character.appearance.accessories ? `- Same accessories: ${character.appearance.accessories}` : '',
      `DO NOT change ANY aspect of ${character.name}'s appearance. Only pose and expression change.`
    )
  }

  // 3. Scene description (the specific content for this page)
  parts.push(`\n\n=== SCENE TO ILLUSTRATE ===`)
  parts.push(sceneDescription)
  parts.push(`\nShow ${character.name} as the main focus of this scene.`)

  // 4. Technical requirements
  parts.push(`\n\n=== ART STYLE REQUIREMENTS ===`)
  parts.push(`Color palette: ${styleConfig.colorPalette}`)
  parts.push(`Technique: ${styleConfig.technique}`)
  parts.push(`Mood: ${styleConfig.mood}`)
  parts.push(`Lighting: ${styleConfig.lighting}`)

  // 5. Quality and safety
  parts.push(`\n\n=== QUALITY REQUIREMENTS ===`)
  parts.push(`- High-quality professional children's book illustration`)
  parts.push(`- Safe and appropriate for young children`)
  parts.push(`- ${character.name} must be clearly visible and recognizable as the hero`)
  parts.push(`- Engaging composition with ${character.name} as the focal point`)

  return parts.filter(p => p).join("\n")
}

/**
 * Build prompt for subsequent images with reference
 * Focuses on maintaining character consistency from the reference image
 */
export function buildReferenceImagePrompt(params: ImagePromptParams): string {
  const { sceneDescription, character, style, isChildPhoto } = params

  const styleConfig = ILLUSTRATION_STYLES[style] || ILLUSTRATION_STYLES.watercolor

  // Special prompt when reference is an actual photo of the child
  if (isChildPhoto) {
    return `Look at the photo of the real child above. Create a ${styleConfig.name} illustration where the main character looks EXACTLY like this child.

CRITICAL - MATCH THE CHILD'S APPEARANCE:
- The illustrated character ${character.name} must look like the child in the photo
- PRESERVE: exact face shape, eye shape and color, nose shape, hair color and style
- PRESERVE: skin tone, any distinctive features (freckles, dimples, etc.)
- PRESERVE: the child's clothing style, colors, and any accessories visible in the photo
- Transform the real child into an illustrated character in ${styleConfig.name} style
- The character should be instantly recognizable as the child from the photo

SCENE TO ILLUSTRATE:
${sceneDescription}

ART STYLE:
- ${styleConfig.description}
- ${styleConfig.technique}
- ${styleConfig.colorPalette}
- ${styleConfig.lighting}
- ${styleConfig.mood}

Create a beautiful children's book illustration where ${character.name} (the child from the photo) is the hero of this scene. The character must be recognizable as the same child throughout the story.`
  }

  // Build detailed character reminder from appearance
  let characterReminder = ""
  if (character.appearance) {
    characterReminder = `
EXACT CHARACTER APPEARANCE (DO NOT DEVIATE):
- Hair: ${character.appearance.hairColor} ${character.appearance.hairStyle}
- Eyes: ${character.appearance.eyeColor}
- Skin: ${character.appearance.skinTone}
- Outfit: ${character.appearance.clothing}
${character.appearance.accessories ? `- Accessories: ${character.appearance.accessories}` : ''}
${character.appearance.distinctiveFeatures ? `- Distinctive features: ${character.appearance.distinctiveFeatures}` : ''}`
  }

  // Standard prompt for generated image reference
  return `Look at the reference image above showing ${character.name}. Create a new ${styleConfig.name} illustration with ${character.name} in a NEW SCENE.

⚠️ CRITICAL - CHARACTER MUST BE IDENTICAL TO REFERENCE IMAGE:
${character.name} must look EXACTLY the same as in the reference image:
- SAME face shape and features - no changes
- SAME eye color and shape - no changes
- SAME hair color and style - no changes
- SAME clothing and colors - no changes (${character.appearance?.clothing || 'same outfit'})
- SAME accessories - no changes
- SAME skin tone - no changes
${characterReminder}

The ONLY things that change are:
- Pose and body position (for the new scene)
- Facial expression (to match the scene emotion)
- Camera angle and composition
- Background and environment

=== NEW SCENE TO ILLUSTRATE ===
${sceneDescription}

Show ${character.name} as the hero of this scene. ${character.name} must be instantly recognizable as the SAME character from the reference image.

ART STYLE (maintain consistency):
- ${styleConfig.technique}
- ${styleConfig.colorPalette}
- ${styleConfig.lighting}
- ${styleConfig.mood}

Create a cohesive illustration where ${character.name} looks EXACTLY like the reference - same child, new adventure.`
}
