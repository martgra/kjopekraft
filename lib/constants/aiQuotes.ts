/**
 * Quotes to display while AI is generating content
 * Inspired by movie references and sci-fi themes
 */
export const AI_GENERATION_QUOTES = [
  'Contemplating the ifs.',
  'Checking all 14,000,605 outcomes.',
  'Consulting the oracle.',
  'Running the simulation.',
  'Calculating the odds.',
  "I don't like the sound of those odds.",
  'This requires thought.',
  'Engaging analysis subroutine.',
  'Simulating a dream within a dream.',
  'Recalibrating the timeline.',
  'Plotting the course.',
  'Be cool.',
  'Now we play the waiting game.',
  'Aligning the probabilities.',
  'Searching for meaning.',
] as const

/**
 * Get a random quote from the AI generation quotes
 */
export function getRandomAIQuote(): string {
  const randomIndex = Math.floor(Math.random() * AI_GENERATION_QUOTES.length)
  return AI_GENERATION_QUOTES[randomIndex]!
}
