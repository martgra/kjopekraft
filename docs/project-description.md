# Salary and Tax Calculator Project

## Project Overview

This project is a Next.js web application designed to help users calculate and visualize salary data, tax information, and inflation effects. The application provides interactive tools for salary planning, tax calculation, and understanding how inflation impacts purchasing power over time.

The core functionality includes:

- Salary calculations based on pay points
- Tax calculations according to Norwegian tax rules
- Inflation impact visualization
- Interactive charts for data representation
- Responsive design for both desktop and mobile experiences

## Technical Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: CSS Modules (based on folder structure)
- **Data Visualization**: Chart.js (configured in lib/chartjs.ts)
- **State Management**: React Context and custom hooks
- **API**: Server-side API routes for data fetching

## Recent Fixes

- Fixed time range toggle (1Y, 3Y, ALL) in ChartSection to properly filter both payPoints and inflationData
- Fixed chart container sizing by removing flex-1 and min-h-[400px], now uses fixed h-[300px] to prevent overflow
- Changed default time range to 'ALL' for better initial UX
- Fixed import path in `features/tax/config/TRYGDE_CONFIG.ts` to correctly import `TrygdeConfig` type from the parent directory's `taxCalculator.ts` (changed import path from './taxCalculator' to '../taxCalculator')
- Fixed import path in `features/tax/config/YEARLY_TAX_CONFIG.ts` to correctly import `YearlyTaxConfig` type from the parent directory's `taxCalculator.ts` (changed import path from './taxCalculator' to '../taxCalculator')
- Fixed responsive card scaling issues:
  - Updated MetricCard component to use responsive padding (p-4 sm:p-5 md:p-6), font sizes, and icon sizes
  - Updated MetricGrid to use better responsive grid layout (1 column mobile, 2 columns small screens, 3 columns large screens)
  - Added responsive typography with smaller base sizes and scaling at breakpoints
  - Made trend indicators wrap properly and scale with viewport
- **Package Manager**: Bun

## Project Structure

The project follows a feature-based architecture aligned with Next.js App Router patterns:

### Feature-Based Organization

The codebase is organized around feature modules, each with its own components, hooks, and utilities:

#### Salary Feature (`/features/salary/`)

- **Components**
  - `SalaryDashboard.client.tsx`: Main dashboard component integrating salary data
  - `PayPointForm.tsx`: Form for entering and editing pay point data
  - `PayPointListItem.tsx`: Component for displaying individual pay points
  - `SalaryStats.tsx`: Component for displaying statistical information about salary data

- **Hooks**
  - `useSalaryData.ts`: Unified hook for managing salary data, calculations, and chart preparation with proper memoization and caching
  - `usePaypointChartData.ts`: Prepares chart data from pay points
  - `useSalaryCalculations.ts`: Performs salary calculations
  - `useSalaryPoints.ts`: Manages salary point data

#### Tax Feature (`/features/tax/`)

- **Components**
  - `TaxSummary.tsx`: Component for summarizing tax calculations

- **Utils**
  - `taxCalculator.ts`: Logic for tax calculations
  - `taxService.ts`: Service class with caching mechanism for tax calculations

- **Config**
  - `TRYGDE_CONFIG.ts`: Configuration for Norwegian social security calculations
  - `YEARLY_TAX_CONFIG.ts`: Yearly tax rates and brackets configuration

#### Inflation Feature (`/features/inflation/`)

- **Utils**
  - `inflationCalc.ts`: Logic for inflation calculations
  - `inflationParser.ts`: Parser for inflation data

- **Hooks**
  - `useInflation.ts`: Custom hook for accessing inflation data and calculations

#### Visualization Feature (`/features/visualization/`)

- **Components**
  - `DesktopPayChart.tsx`: Chart visualization optimized for desktop view
  - `MobilePayChart.tsx`: Chart visualization optimized for mobile devices
  - `PaypointChart.tsx`: Chart for displaying pay point data visualizations
  - `ResponsiveChartWrapper.tsx`: Wrapper component that conditionally renders the appropriate chart based on screen size

#### Onboarding Feature (`/features/onboarding/`)

- **Components**
  - `DataEntryGuide.client.tsx`: Guide to help users understand how to enter data into the system

- **Hooks**
  - `useOnboarding.ts`: Manages onboarding state and logic

### Shared Resources

#### Common UI Components (`/components/ui/common/`)

- `Footer.tsx`: Application footer
- `LoadingSpinner.tsx`: Loading indicator for asynchronous operations
- `MobileMetaScript.tsx`: Script handling mobile-specific metadata
- `TabBar.tsx`: Navigation tab bar component

#### Context Providers (`/contexts/`)

- `DisplayModeContext.tsx`: Context provider for toggling between net and gross salary modes

#### Models (`/lib/models/`)

- `salary.ts`: Type definitions for salary data
- `inflation.ts`: Type definitions for inflation data
- `types.ts`: Consolidated type definitions used across features

#### Constants (`/lib/constants/`)

- `text.ts`: Text constants for the application UI

#### API Routes

- `/api/inflation/route.ts`: API endpoint for fetching inflation data

### App Router Structure

The application follows Next.js App Router patterns:

- `/app/page.tsx`: Main page component
- `/app/layout.tsx`: Root layout with providers
- `/app/globals.css`: Global styles
- `/app/api/`: API routes

## Component Relationships

### Data Flow

1. **User Input Flow**:
   - Users input salary data through `PayPointForm.tsx`
   - Data is centrally managed by `useSalaryData.ts` hook, which integrates functionality that was previously split across multiple hooks
   - The `useSalaryData` hook handles validation, data transformation, and memoizes calculations for performance
   - Results are displayed in charts and summaries

2. **Visualization Flow**:
   - Raw data is processed by hooks in the features directory
   - `usePaypointChartData.ts` transforms data for chart consumption
   - `ResponsiveChartWrapper.tsx` determines which chart to display
   - Either `DesktopPayChart.tsx` or `MobilePayChart.tsx` renders the data

3. **Tax Calculation Flow**:
   - Salary data is processed by `taxCalculator.ts`
   - Configuration from `YEARLY_TAX_CONFIG.ts` and `TRYGDE_CONFIG.ts` is applied
   - Results are displayed in `TaxSummary.tsx`

4. **Inflation Analysis Flow**:
   - Inflation data is fetched through the API route
   - Data is processed by `inflationCalc.ts` and `inflationParser.ts`
   - `useInflation.ts` hook provides the processed data to components
   - Charts visualize the inflation impact on salary

### State Management

1. **Display Mode Context**:
   - `DisplayModeContext.tsx` manages the toggle between net and gross salary modes
   - Persists user preference in localStorage
   - Provides context across the application

2. **Local Component State**:
   - Each component maintains its own state for UI interactions
   - Custom hooks manage feature-specific state
   - `useSalaryData.ts` provides a unified interface for salary-related state management

3. **Data Fetching**:
   - The SWR library is used for data fetching and caching
   - API routes provide server-side data processing

## Configuration and Utilities

The project uses several configuration files and utilities:

- **Tax and Social Security Configuration**:
  - `YEARLY_TAX_CONFIG.ts` defines tax brackets and rates
  - `TRYGDE_CONFIG.ts` defines social security contribution rates

- **Scripts**:
  - Various scripts in the `/scripts` directory for calculating specific tax components:
    - `get_bracket.js`
    - `get_general_income.js`
    - `get_standard_deduction.js`
    - `get_surtax.js`
    - `get_trygdeavgift.js`

- **Constants**:
  - Text constants in `lib/constants/text.ts`
  - Chart.js configuration in `lib/chartjs.ts`

## Recent Refactoring Work

### Unified State Management

The application recently underwent refactoring to improve code organization and performance:

1. **Unified Salary Data Hook**:
   - Created `useSalaryData.ts` hook that combines functionality from multiple hooks
   - Implemented proper memoization for calculations to reduce unnecessary re-renders
   - Added consistent validation patterns for user input

2. **Tax Calculation Optimization**:
   - Added caching via `taxService.ts` to avoid redundant calculations
   - Improved type safety with consolidated types in `/lib/models/types.ts`

3. **Type System Improvements**:
   - Consolidated related types in a central location
   - Enhanced component interfaces for better type checking

4. **Bug Fixes**:
   - Fixed issues with the loading states in `app/page.tsx`
   - Implemented proper wrapper functions to ensure type compatibility between hooks and components

## Recent Modifications

### Salary Editing Fix (May 20, 2025)

Fixed a bug where editing a salary entry would sometimes result in a duplicate year error. The issue was resolved by:

1. Ensuring that the PayPoint ID is properly preserved and used during the editing process
2. Updating the validation logic in DataEntryGuide.client.tsx to correctly handle year duplication checks
3. Improving the editPoint function in useSalaryData.ts to use IDs for point identification when available
4. Fixed a React warning for an unnecessary dependency in the useMemo hook

This fix ensures users can now edit their salary entries without encountering the "You already have a payment for (year)" error when editing an entry without changing its year.

### Stats Cards Layout Improvement (May 20, 2025)

Improved the responsive layout of the stats cards to optimize space usage across different screen sizes:

1. Changed from a 2-column grid to a 4-column grid on desktop screens for a more compact single-row layout
2. Maintained 2-column grid on mobile for better readability on smaller screens
3. Optimized padding and text sizes to ensure all information is easily readable on all devices
4. Made the stats cards container take the full width of the parent container for better alignment

These changes improve the user interface by using screen space more efficiently while maintaining a clean, readable layout across all device sizes.

## [2025-05-20] Type Consolidation

- Removed the duplicate `SalaryDataPoint` interface from `features/inflation/inflationCalc.ts`.
- Now using the shared `SalaryDataPoint` type from `lib/models/types.ts` throughout the codebase for consistency and maintainability.
- All other interfaces/types remain local or private unless they are used across multiple features, in line with separation of concerns and to avoid circular imports.

## Conclusion

This application provides a comprehensive solution for salary and tax planning with a focus on Norwegian tax rules and inflation impacts. The feature-based architecture promotes:

1. **Cohesive organization**: Related code is grouped together
2. **Separation of concerns**: Each feature module is self-contained
3. **Maintainability**: Changes to one feature minimally impact others
4. **Scalability**: New features can be added with minimal changes to existing code
5. **Performance**: Memoization and caching strategies reduce unnecessary calculations

The application is built with responsive design principles, ensuring a good user experience on both desktop and mobile devices.

---

## Recent Changes: Negotiation Tab & Filtering Reversion

### Overview

- **Negotiation Tab:** Implemented and integrated into main navigation. Allows adding/removing negotiation points and generating negotiation materials.
- **Validation/Filtering Reverted:** All filtering/validation logic for valid tax years in salary data and chart components has been **undone**. All components now use the original `payPoints` array as provided by the user, per user request.
- **Feature Files:** Added Cucumber feature files for negotiation tab and flows.
- **Loading Indicators & Accessibility (May 21, 2025):** Enhanced the user experience during AI content generation:
  - Added visual loading indicators using the LoadingSpinner component
  - Implemented inline loading spinners with accessible aria attributes
  - Enhanced error states with improved user guidance
  - Added responsive layout adjustments for mobile devices
  - Optimized the UI to remain responsive during generation
- **Enhanced UX & Accessibility (May 22, 2025):** Further improved the negotiation tab:
  - Added better visual feedback for loading states and errors
  - Enhanced keyboard navigation and focus management
  - Improved screen reader support with proper ARIA attributes
  - Enhanced error messages with more detailed guidance
  - Added accessibility-focused SVG icons for warnings and errors
  - Enhanced styling of list items for better visual hierarchy
  - Improved responsive design for better mobile experience
- **Stateful Negotiation Data (May 22, 2025):** Implemented complete stateful persistence for the negotiation tab:
  - Persists negotiation points, email content, and playbook content across page refreshes
  - Tracks generation counts for both email and playbook in a unified way
  - Enhanced useNegotiationData hook with localStorage integration
  - Implemented backward compatibility with previous localStorage schema
  - Added helpful methods for state management and validation

- **Robust localStorage Implementation (May 22, 2025):** Fixed persistence issues with an improved architecture:
  - Implemented granular storage keys for each piece of state to prevent conflicts
  - Added lazy initialization with getter functions for proper hydration
  - Separated concerns with individual useEffects for each piece of state
  - Built type-safe helper functions for localStorage operations
  - Added error handling for all localStorage interactions

### File Structure (Negotiation Tab)

- `app/HomeClient.tsx`: Main navigation and tab logic.
- `features/negotiation/components/NegotiationTab.client.tsx`: Negotiation tab UI with enhanced accessibility.
- `features/negotiation/hooks/useNegotiationData.ts`: Negotiation points state management.
- `features/salary/hooks/useSalaryData.ts`: Salary data logic (no filtering for valid tax years).
- `features/salary/components/SalaryDashboard.client.tsx`: Dashboard for salary/inflation comparison.
- `features/visualization/components/PaypointChart.tsx`, `MobilePayChart.tsx`, `DesktopPayChart.tsx`: Chart components for pay/inflation visualization.
- `components/ui/common/LoadingSpinner.tsx`: Reusable loading spinner component used for visual feedback.
- `tests/features/negotiation/`: Cucumber feature files for negotiation flows.
- `app/api/generate/email/route.ts`: Server endpoint for email generation.
- `app/api/generate/playbook/route.ts`: Server endpoint for playbook generation.

### Next Steps

- ✓ Enhance loading indicators for generation processes (Completed)
- ✓ Improve accessibility for negotiation tab components (Completed)
- ✓ Enhance error handling with better user guidance (Completed)
- ✓ Add persistence for negotiation points (Completed May 22, 2025)
- Implement E2E tests for negotiation flows.
- (Optional) Add user-facing validation for year ranges in the UI if requested.

### Coding Principles (Reminder)

- Decoupled, best-practice React/Next.js frontend.
- No new libraries without justification.
- All user-facing text in `lib/constants/text.ts`.
- Code is easily testable.
- Use `bun` for app commands.

## [2025-05-21] User Data Reset & Last Tab Persistence

- The reset function (triggered from the footer) now clears all app-specific localStorage keys, including:
  - Salary points (`salary-calculator-points`)
  - Display mode (`salaryDisplayMode`)
  - Onboarding flags (`salary-onboarding-v1`, `salary-calculator-onboarded`)
  - Negotiation tab state (`negotiation_data_points`, `negotiation_data_email`, `negotiation_data_playbook`, `negotiation_data_email_count`, `negotiation_data_playbook_count`)
  - Last active tab (`salary-last-tab`)
- This ensures a true reset of all user data and state.
- The HomeClient now persists the last active tab to localStorage and restores it for returning users, improving user experience.
- These changes further decouple user state management and make the app easier to maintain and test.

## [2025-05-21] UI Library Simplification

- Removed DaisyUI dependency in favor of custom-styled Tailwind components
- Replaced DaisyUI-specific components with standard React implementations
- Enhanced the custom CollapsibleSection component for email and playbook outputs
- Simplified overall dependency management and reduced package size
- Improved customization options by using standard Tailwind classes directly
- This change aligns better with the project's goal of having a minimal dependency footprint

## [2025-05-21] Centralized AI Prompt Builders

- Factored out prompt construction for AI SDK routes into `lib/prompts.ts`.
- API routes for email and playbook generation now use these shared prompt builder functions.
- This improves maintainability and ensures all prompt logic is in one place, following separation of concerns.

---

## Negotiation Tab Changes

### Overview

- **Copy Markdown Button:** Added a Copy Markdown button to both the generated email and playbook output sections in the negotiation tab.
- The button allows users to copy the original markdown output for inspection, with user feedback for success or error.
- Text for the button and feedback is managed in `lib/constants/text.ts`.
- The button is placed next to the section headings for both outputs, following modern UI/UX best practices.

### Negotiation Feature (`/features/negotiation/`)

- **Components**
  - `NegotiationTab.client.tsx`: Main negotiation UI, including user info, argument entry, and output generation
  - `NegotiationUserInfoForm.tsx`: User info form for negotiation context
- **Hooks**
  - `useNegotiationData.ts`: Manages negotiation points, output generation, and generation limits

#### Recent Enhancements (May 21, 2025)

- Email and playbook outputs are now rendered in custom collapsible sections with a clean, accessible interface
- Added copy as rich text (HTML) and download as DOCX buttons for both outputs, supporting pasting into Outlook/Word and offline use
- Markdown rendering uses GitHub's light theme for consistent appearance
- All new UI text is managed in `lib/constants/text.ts`
- Improved the CollapsibleSection component with better accessibility and keyboard support
- Enhanced UI with standard Tailwind classes for better maintainability

## Negotiation Tab Refresh Safety

The negotiation tab now persists the following state to localStorage for refresh safety:

- emailContent
- playbookContent
- emailPrompt
- playbookPrompt

On mount, these values are hydrated from localStorage if present. This ensures that generated negotiation outputs and prompts are not lost on page refresh or navigation.

# Negotiation Feature Refactor (May 2025)

## Overview

The negotiation feature was refactored to improve separation of concerns, maintainability, and testability. The main component (`NegotiationTab.client.tsx`) was split into smaller, focused subcomponents and utility files. This aligns with our frontend best practices for React/Next.js and the project's coding principles.

## New Structure

- **NegotiationTab.client.tsx**: Orchestrates the negotiation UI, manages state, and composes subcomponents.
- **NegotiationPointsInput.tsx**: Handles the input for adding new negotiation points.
- **NegotiationPointsList.tsx**: Renders the list of negotiation points and handles removal.
- **CopyPromptButton.tsx**: Button for copying prompt text to clipboard.
- **CopyRichButton.tsx**: Button for copying rich (HTML) content to clipboard.
- **DownloadDocxButton.tsx**: Button for downloading generated content as a .docx file.
- **CollapsibleSection.tsx**: Collapsible UI section for outputs.
- **utils/negotiationUtils.ts**: Utility for converting markdown to docx paragraphs.

## Reasoning

- **Separation of Concerns**: Each component now has a single responsibility, making the codebase easier to understand and maintain.
- **Type Safety**: All new components use explicit TypeScript types for props.
- **Reusability**: Utility and UI logic (copy/download/collapsible) are reusable across the negotiation feature.
- **Testability**: Smaller components are easier to test in isolation.

## Usage

- The main negotiation tab imports and composes the subcomponents.
- All user-facing text remains in `lib/constants/text.ts`.
- No new libraries were introduced; only internal refactoring was performed.

## Next Steps

- Add tests for each subcomponent.
- Continue to follow this decoupled structure for future features.

---

_Last updated: 2025-05-21_

## Negotiation Tab UI Redesign (December 2025)

### Overview

The negotiation tab received a complete visual overhaul with a new two-column layout. The new design features:

- Full-screen layout with sidebar integration
- Two-column responsive design: Details/Context on left, Argument Builder on right
- Modern card-based layout with rounded corners and subtle shadows
- Consistent styling using CSS variables for theme support
- Material Icons and Material Symbols integration
- Enhanced color scheme with green/purple action buttons
- Inline generated content panel at bottom when content exists

### Layout Structure

#### Header Section

- Application branding with logo icon
- Back navigation for mobile
- Subtitle with feature description

#### Left Column (7/12 width on desktop)

- **Details Card**: Job title, Industry, New Job dropdown, Current Salary, Desired Salary
- **Context Card**: Market Statistics textarea, Conditions/Benefits textarea
- Both cards have section icons using Material Symbols

#### Right Column (5/12 width on desktop)

- **Argument Builder Panel**:
  - Type dropdown + description input
  - Add button with Material Icon
  - Scrollable points list with numbered badges
  - Info/warning banners
  - Generate Email/Playbook buttons with remaining count

#### Generated Content Section

- Appears at bottom when content exists
- Collapsible sections for Email and Playbook
- Copy/download action buttons

### Updated Components

#### NegotiationTab.client.tsx

- Complete rewrite with full-screen two-column layout
- Integrated sidebar from layout component
- Uses CSS variables (--background-light, --text-main, --border-light, --primary)
- Inline form management instead of separate form components
- Type-colored badges for argument list items
- Mobile-responsive with floating home button

### CSS Variables Used

The component uses design system CSS variables:

- `--background-light`: Page background
- `--text-main`: Primary text color
- `--text-muted`: Secondary text color
- `--border-light`: Border color
- `--primary`: Primary brand color

---

## Text Constants System (Updated 2025-12-11)

### Overview

All user-facing text in the application is centralized in `/lib/constants/text.ts`. This ensures:

- **Consistency**: Single source of truth for all UI text
- **Internationalization ready**: Easy to add language support in the future
- **Maintainability**: Text changes can be made in one place
- **Testing**: Text strings can be verified against constants

### TEXT Structure

The `TEXT` object is organized by feature/component area:

```typescript
TEXT = {
  common: { ... }      // Shared strings (loading, error, currency, etc.)
  sidebar: { ... }     // Navigation and sidebar labels
  dashboard: { ... }   // Dashboard-specific text
  charts: { ... }      // Chart labels and titles
  stats: { ... }       // Statistics labels
  metrics: { ... }     // Metric card labels
  forms: { ... }       // Form labels, placeholders, validation messages
  activity: { ... }    // Activity timeline text
  inflation: { ... }   // Inflation-related text
  footer: { ... }      // Footer text
  negotiationPage: { ... }  // Negotiation page headers
  negotiationForm: { ... }  // Negotiation form labels
  negotiation: { ... }      // Negotiation feature text
}
```

### Text with Placeholders

Some text strings use placeholders for dynamic values:

- `{year}` - replaced with year value
- `{min}`, `{max}` - replaced with min/max values
- `{count}` - replaced with count value

Example usage:

```typescript
TEXT.dashboard.fiscalYear.replace('{year}', String(currentYear))
TEXT.activity.yearsAgo.replace('{count}', String(diff))
```

### Recent Text Updates (2025-12-11)

**Removed "Pro Plan" references:**

- Removed `planLabel` from sidebar to eliminate misleading premium tier indication
- Updated sidebar component to conditionally show plan label only if present

**Improved frontpage clarity:**

- Changed `annualOverview` from "Årsoversikt" to "Lønnsoversikt" (Annual overview → Salary overview)
- Updated `annualOverviewSubtitle` from "Her er din lønnsutvikling for inneværende år" to "Følg din lønnsutvikling over tid sammenlignet med inflasjon" (Development for current year → Development over time compared to inflation)
- Changed `fiscalYear` from "Regnskapsår {year}" to "{year}" to avoid misleading accounting year implication - the app tracks multi-year salary development, not a single fiscal year

**Enhanced activity timeline:**

- Updated activity timeline to display year alongside relative time (e.g., "I år (2025)" instead of just "I år")
- Added edit and delete buttons to each activity item for better data management
- Added `confirmDelete` text constant for confirming deletion of individual salary points

These changes better reflect the app's actual functionality: tracking salary development across multiple years compared to inflation, rather than focusing on a single accounting year.

### Language

All text is in **Norwegian (Bokmål)** to match the target audience. The application uses `nb-NO` locale for number formatting.

### Adding New Text

When adding new text to the application:

1. Add the constant to the appropriate section in `text.ts`
2. Import `TEXT` from `@/lib/constants/text`
3. Use the constant in the component

---

_Last updated: 2025-12-11_
