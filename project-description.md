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

- Fixed import path in `features/tax/config/TRYGDE_CONFIG.ts` to correctly import `TrygdeConfig` type from the parent directory's `taxCalculator.ts` (changed import path from './taxCalculator' to '../taxCalculator')
- Fixed import path in `features/tax/config/YEARLY_TAX_CONFIG.ts` to correctly import `YearlyTaxConfig` type from the parent directory's `taxCalculator.ts` (changed import path from './taxCalculator' to '../taxCalculator')
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
