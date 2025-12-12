# Salary and Tax Calculator Project

## Project Overview

This project is a Next.js web application designed to help users calculate and visualize salary data, tax information, and inflation effects. The application provides interactive tools for salary planning, tax calculation, and understanding how inflation impacts purchasing power over time.

The core functionality includes:

- Salary calculations based on pay points
- Tax calculations according to Norwegian tax rules
- Inflation impact visualization with honest data representation
- Interactive charts for data representation (no interpolation - only actual user data)
- Responsive design for both desktop and mobile experiences
- Onboarding experience with demo data for new users
- Mobile-optimized navigation

## Technical Stack

- **Framework**: Next.js 16 with TypeScript and App Router
- **Caching**: Next.js 16 `"use cache"` directive with `cacheComponents: true`
- **Styling**: CSS Modules and Tailwind CSS
- **Data Visualization**: Chart.js (configured in lib/chartjs.ts)
- **State Management**: React Context and custom hooks
- **API**: Server-side API routes with function-level caching
- **Package Manager**: Bun

## Recent Major UX Improvements (December 2025)

### 1. Removed Chart Interpolation for Data Honesty

- **Changed**: Removed `interpolateYearly` function from `usePaypointChartData.ts`
- **Why**: Users should only see their actual entered data points, not computer-generated estimates
- **Impact**: Charts now display only real user data, with lines connecting between points
- **Files**: `features/salary/hooks/usePaypointChartData.ts`
- Chart x-axis still shows all years in range (via Chart.js `stepSize: 1` and `type: 'linear'`)
- Lines connect sparse data points directly (`showLine: true`, `spanGaps: true`)

### 2. Net/Gross Mode Toggle Visibility

- **Changed**: Moved toggle from bottom of dashboard to chart header with visual badge
- **Why**: Mode selection is critical for understanding - users need to see it clearly
- **Components Updated**:
  - `components/dashboard/ChartSection.tsx`: Added toggle and badge to header
  - `components/dashboard/Dashboard.tsx`: Removed bottom toggle section
  - `lib/constants/text.ts`: Added `modeBadgeGross`, `modeBadgeNet`, `modeToggleLabel`
- **Badge Display**: Shows "Brutto" or "Netto" next to chart title using `Badge` component
- **User Benefit**: Immediately clear which mode is active; no confusion about what numbers represent

### 3. Onboarding with Ephemeral Demo Data

- **New Feature**: Created `features/onboarding/` module
- **Files Created**:
  - `features/onboarding/OnboardingEmptyState.tsx`: Welcome screen with explanation
  - `features/onboarding/demoData.ts`: Sample salary progression (2020-2024, 550k-680k)
- **Behavior**:
  - Demo data loads on user request ("Prøv med eksempeldata" button)
  - Blue info banner shows when in demo mode
  - Demo data automatically clears when user adds first real salary point (via page reload)
  - "Legg til min egen lønn" button scrolls to form
- **Educational Value**: Users immediately see what the app does before entering personal data
- **Text Constants**: Added `onboarding` section with `welcomeTitle`, `welcomeMessage`, `kjopekraftExplanation`, etc.

### 4. Help Tooltips for Key Concepts

- **Added**: Info icons with native browser tooltips on metric cards
- **Updated Components**:
  - `components/dashboard/MetricCard.tsx`: Changed `title` prop to accept `React.ReactNode`
  - `components/dashboard/MetricGrid.tsx`: Added info icons to "Reell årsverdi" and "Årlig endring"
- **Text Constants**: Added `help` section with `realAnnualValue`, `inflationAdjusted`, `yearlyChange`
- **User Benefit**: Inline explanations of complex concepts like "inflasjonsjustert lønn" and "reell verdi"

### 5. Strengthened Form Validation

- **Enhanced**: Year validation now checks against actual inflation data range
- **Updated Components**:
  - `components/dashboard/SalaryPointForm.tsx`: Added `inflationData` prop, validates against min inflation year
  - `components/dashboard/RightPanel.tsx`: Passes `inflationData` to form
  - `components/dashboard/Dashboard.tsx`: Passes `inflationData` to `RightPanel`
- **New Error Message**: "Inflasjonsdata er kun tilgjengelig fra {minYear}. Vennligst velg et senere år."
- **Text Constants**: Added `inflationDataUnavailable` to `forms.validation`
- **User Benefit**: Clear feedback when trying to enter years outside available inflation data (instead of silent failure)

### 6. Mobile Bottom Navigation

- **New Component**: `components/layout/MobileBottomNav.tsx`
- **Features**:
  - Fixed bottom navigation bar on mobile (<768px)
  - Two tabs: "Oversikt" (Dashboard) and "Forhandling" (Negotiation)
  - Active state highlighting with icons and labels
  - Hidden on desktop (lg breakpoint)
- **Layout Updates**:
  - `app/layout.tsx`: Added `MobileBottomNav` component
  - `components/layout/DashboardLayout.tsx`: Added `pb-20` padding on mobile to prevent content overlap
  - `features/negotiation/components/NegotiationPage.tsx`: Added `pb-20` padding on mobile
- **User Benefit**: Easy navigation between main sections on mobile without hamburger menu or back button confusion

### 7. Mobile Metric Card Optimization - Expandable Summary View

- **Changed**: Replaced full metric card grid with expandable compact summary bar on mobile to maximize chart space
- **Mobile Layout** (`Dashboard.tsx`):
  - Full `MetricGrid` hidden on mobile (`hidden md:block`)
  - New expandable summary bar shown on mobile only (`md:hidden`)
  - **Collapsed state** (default): Shows 2 key metrics (Annual Salary and vs Inflation %)
  - **Expanded state**: Shows additional metrics (Real Annual Value, detailed Yearly Change)
  - Expand/collapse toggle with chevron icon (`expand_more` / `expand_less`)
  - State managed with `isMetricsExpanded` hook
  - Takes ~60% less vertical space than previous card grid when collapsed
  - Imports `calculateNetIncome` to support net mode in summary
- **Chart Optimization** (`ChartSection.tsx`):
  - Reduced padding from `p-6` to `p-4` on mobile for more chart area
  - Reduced header margin from `mb-4` to `mb-3` on mobile
  - Chart title reduced from `text-lg` to `text-base` on mobile
  - Chart subtitle hidden on mobile (`hidden md:block`)
  - Gap reduced from `gap-4` to `gap-3` on mobile
- **Card Styling for Desktop** (`MetricCard.tsx`):
  - Optimized for 2-column grid on small screens, 3-column on large
  - Reduced padding and font sizes at small breakpoints
  - Full detail view remains on tablet/desktop (md+)
- **User Benefit**:
  - Chart gets maximum screen space on mobile (primary focus)
  - Essential metrics visible by default, more detail on demand
  - User controls information density via expand/collapse
  - ~70% more vertical space for chart compared to previous full-card layout
  - Desktop users still see full detailed metric cards
  - Better mobile-first approach prioritizing data visualization

### 8. Reference Salary Comparison (December 2025)

- **New Feature**: Toggleable reference salary line in main chart for external benchmarking
- **Implementation**:
  - Created `features/referenceSalary/` module with extensible architecture
  - SSB API integration via `/app/api/ssb/salary/route.ts` (table 11418 for official data, table 11654 for wage index)
  - Context-based toggle (`ReferenceModeContext.tsx`) with localStorage persistence (default: disabled)
  - Third dataset conditionally rendered in both mobile and desktop charts
  - **Server-side caching**: Next.js 16 `"use cache"` directive with 1h cache (`cacheLife("hours")`)
  - Cache is shared across all users (efficient, no redundant SSB API calls)
  - Tagged with `cacheTag("ssb-salary")` for on-demand invalidation via `updateTag()`
- **MVP Occupation**: Nurses (SSB code 2223, "Sykepleiere")
  - Monthly earnings data (`Manedslonn`) converted to yearly
  - Averages across all sectors, both sexes, all employees
  - Official data: 2015-2024 from SSB table 11418
  - **2025 Estimate**: Calculated using wage index (table 11654, health sector 86-88, Q3-to-Q3 growth)
  - Estimated data marked with `type: "estimated"` and includes methodology explanation
- **UI/UX**:
  - **NEW**: Control panel moved below chart (no layout shift when toggling)
  - Toggle controls in bottom section with "Visningsalternativer" label
  - Responsive layout: stacked on mobile, horizontal on tablet/desktop
  - Visual badge in header when enabled: "Referanse aktiv"
  - Amber reference line (#f59e0b) with dashed pattern (3px dash) for distinction
  - Reference data respects net/gross mode (same tax calculation as user data)
  - Automatically filtered to match user's salary year range
- **Data Flow**:
  - `usePaypointChartData` hook conditionally fetches via `useReferenceSalary`
  - Reference series transformed to same `ScatterDataPoint[]` format
  - Net/gross conversion applied identically to user's actual salary
  - Chart components render third dataset only when `referenceSeries.length > 0`
- **Architecture Benefits**:
  - `occupations.ts` registry allows easy addition of new occupations
  - `referenceCalculator.ts` isolates business logic for testability
  - Occupation-specific logic can be added per registry entry
  - Clean separation from core salary calculation features
  - Server-side caching shared across all users (efficient, no redundant SSB API calls)
- **Text Constants**: Added `referenceSalary` section with Norwegian labels, and `charts.controlsLabel`
- **User Benefit**:
  - Benchmark personal salary against industry standards
  - External validation for negotiation preparation
  - Context for understanding whether salary growth is competitive
  - Optional feature (off by default) - doesn't clutter primary use case
  - Stable UI (chart doesn't shift when toggling reference)

## Previous Fixes

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
- **Mobile UX Improvements**:
  - Made RightPanel (salary data entry panel) collapsible on mobile to reduce visual dominance
  - Panel is collapsed by default on mobile (<1024px) and expanded on desktop
  - Added toggle button with expand/collapse icons and badge showing number of data points
  - Smooth transitions for expand/collapse animations
  - Added text constants `showDataEntry` and `hideDataEntry` in TEXT.dashboard
  - **Chart Mobile Optimization**:
    - Separated chart rendering into dedicated `MobilePayChart.tsx` and `DesktopPayChart.tsx` components for better code organization and maintainability
    - Each chart component is optimized for its specific use case without conditional logic
    - `ResponsiveChartWrapper.tsx` handles screen size detection and component selection (768px breakpoint)
    - Mobile chart features: simplified legend, cleaner tooltips, no grid lines, compact labels (e.g., "500k")
    - Desktop chart features: full grid, detailed tooltips, complete labels, larger touch targets
    - Added `inflationLabel` text constant for simpler legend label
    - Better separation of concerns following React best practices
- **Chart Tooltip Behavior**:
  - Fixed tooltip to only display when hovering directly over data points
  - Changed tooltip mode from 'index' to 'point' and intersect from false to true in both MobilePayChart and DesktopPayChart
  - This prevents tooltips from appearing persistently or when hovering near the chart

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
  - `usePaypointChartData.ts`: Prepares chart data from pay points (NO INTERPOLATION - returns only actual user data)
  - `useSalaryCalculations.ts`: Performs salary calculations
  - `useSalaryPoints.ts`: Manages salary point data

#### Onboarding Feature (`/features/onboarding/`)

- **Components**
  - `OnboardingEmptyState.tsx`: Welcome screen with demo data option and educational content
- **Data**
  - `demoData.ts`: Sample PayPoint array for demo mode (ephemeral, clears on first user input)

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

#### Reference Salary Feature (`/features/referenceSalary/`)

**Purpose**: Allows users to compare their salary progression with reference benchmarks from external data sources (SSB - Statistics Norway).

- **Hooks**
  - `useReferenceSalary.ts`: Fetches and manages reference salary data from SSB API
    - Uses SWR for client-side caching (24h dedupe)
    - Conditional fetching based on toggle state (enabled prop)
    - Returns yearly NOK data pre-calculated by API route
    - Current implementation: Nurses (occupation code 2223) hardcoded for MVP

- **Utils**
  - `referenceCalculator.ts`: Business logic for reference data transformation
    - `filterReferenceByYearRange`: Filters data to match user's salary year range
    - `convertMonthlyToYearly`: Converts monthly to yearly values
    - `getEarliestValue`: Helper for baseline calculations
    - `hasValidCoverage`: Validates data quality (50% threshold)

- **Data**
  - `occupations.ts`: Registry of supported occupations with extensible structure
    - Current: `nurses` (code 2223, "Sykepleiere")
    - Designed for easy expansion to multiple occupations with different business logic
  - `types.ts`: Type definitions for reference salary data
    - `ReferenceDataPoint`: Year-value pairs with status markers
    - `ReferenceSalaryResponse`: Full API response structure
    - `OccupationDefinition`: Occupation metadata (code, labels)

- **Integration Points**
  - Charts automatically show reference line when toggle enabled
  - Reference data respects net/gross mode via same `calculateNetIncome` transformation
  - Conditional third dataset in both desktop and mobile charts
  - Visual styling: Amber color (#f59e0b), dashed line (3px dash), lighter weight

- **API Route**: `/app/api/ssb/salary/route.ts`
  - Fetches from SSB table 11418 (earnings by occupation)
  - Uses PxWebApi v2 with JSON-stat2 parsing
  - Default filters: occupation=2223, contents=Manedslonn (monthly earnings), stat=02 (average), sector=ALLE, sex=0 (both), hours=0 (all employees)
  - Server-side caching: `unstable_cache` with 24h revalidation (matches inflation API pattern)
  - Returns monthly series + derived yearly series (value \* 12)
  - Error handling: Returns 502 with message on SSB API failure

#### Visualization Feature (`/features/visualization/`)

- **Components**
  - `DesktopPayChart.tsx`: Chart visualization optimized for desktop view with full features, grid lines, and detailed tooltips
  - `MobilePayChart.tsx`: Chart visualization optimized for mobile devices with simplified UI, cleaner legend, and compact formatting
  - `PaypointChart.tsx`: Main chart component that handles data transformation and rendering logic
  - `ResponsiveChartWrapper.tsx`: Wrapper component that conditionally renders the appropriate chart (mobile/desktop) based on screen size (768px breakpoint)

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
  - Lazy initialization from localStorage with default 'net'
  - Persists user preference in `salaryDisplayMode` key
  - Provides `isNetMode` boolean and `toggleMode` function
  - Memoized context value to prevent unnecessary re-renders

- `ReferenceModeContext.tsx`: Context provider for toggling reference salary comparison
  - Lazy initialization from localStorage (default: false/disabled)
  - Persists user preference in `salaryReferenceEnabled` key
  - Provides `isReferenceEnabled` boolean and `toggleReference` function
  - Memoized context value following same pattern as DisplayModeContext
  - Integrated in chart data pipeline to conditionally fetch/display reference data

#### Models (`/lib/models/`)

- `salary.ts`: Type definitions for salary data
- `inflation.ts`: Type definitions for inflation data
- `types.ts`: Consolidated type definitions used across features

#### Constants (`/lib/constants/`)

- `text.ts`: Text constants for the application UI

#### API Routes

- `/api/inflation/route.ts`: API endpoint for fetching inflation data from SSB (Statistics Norway)
  - Uses Next.js 16 `"use cache"` directive with `cacheLife("hours")` and `cacheTag("inflation")`
  - Cache shared server-side across all users for 1 hour
- `/api/ssb/salary/route.ts`: API endpoint for fetching reference salary data from SSB table 11418 with configurable occupation, filters, and year range
  - Uses Next.js 16 `"use cache"` directive at function level (`getCachedSalaryData()`)
  - Cache shared server-side across all users with 1h revalidation

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
