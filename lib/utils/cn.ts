/**
 * Utility for conditionally joining class names together
 * Inspired by clsx/classnames
 */
type ClassValue = string | undefined | null | false | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ')
}
