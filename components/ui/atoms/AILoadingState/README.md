# AILoadingState

A reusable AI loading state component that displays a spinner with rotating movie-inspired quotes.

## Features

- Animated spinner with customizable size
- Rotating quotes that change at configurable intervals
- Movie and sci-fi themed quotes for engaging user experience
- Fully typed with TypeScript
- Accessible with proper ARIA attributes

## Usage

### Basic Usage

```tsx
import { AILoadingState } from '@/components/ui/atoms'

function MyComponent() {
  return <AILoadingState />
}
```

### With Custom Styling

```tsx
<AILoadingState
  size="md"
  className="text-lg font-bold"
  spinnerClassName="border-blue-500 border-t-transparent"
/>
```

### Without Quotes

```tsx
<AILoadingState showQuote={false} />
```

### Custom Quote Rotation Interval

```tsx
<AILoadingState quoteRotationInterval={5000} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Size of the spinner |
| `className` | `string` | `''` | Custom class name for the container |
| `spinnerClassName` | `string` | `''` | Custom class name for the spinner |
| `quoteRotationInterval` | `number` | `3000` | Interval in milliseconds to rotate quotes |
| `showQuote` | `boolean` | `true` | Whether to show the quote |

## Example Integration

```tsx
function GenerateButton({ isGenerating }: { isGenerating: boolean }) {
  return (
    <button disabled={isGenerating}>
      {isGenerating ? (
        <AILoadingState
          size="sm"
          className="text-sm"
          spinnerClassName="border-green-900 border-t-transparent"
        />
      ) : (
        'Generate Content'
      )}
    </button>
  )
}
```

## Quotes

The component displays random quotes from popular movies and sci-fi references including:
- Pulp Fiction
- Marvel Cinematic Universe
- The Matrix
- Star Wars
- Star Trek
- Inception
- Back to the Future

See `/lib/constants/aiQuotes.ts` for the complete list of quotes.
