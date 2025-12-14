# Functional Description

This document describes Kjøpekraft's features, user workflows, and business logic from a user perspective.

## Application Overview

**Kjøpekraft** (Norwegian for "Purchasing Power") is a personal salary tracking and analysis tool designed specifically for the Norwegian market. It helps users understand how their salary has evolved over time when accounting for inflation, and provides tools for salary negotiation preparation.

### Core Value Proposition

- **Track Real Purchasing Power**: Not just salary growth, but actual purchasing power after adjusting for inflation
- **Norwegian-Specific**: Uses official SSB (Statistics Norway) data and accurate Norwegian tax calculations
- **Honest Data Visualization**: Shows only your actual data points, no artificial interpolation or estimates
- **Negotiation Support**: Generate professional negotiation materials based on your salary history and arguments
- **Privacy-First**: All data stored locally in your browser, no account required

## User Personas

### Primary User: Norwegian Salary Earner

- **Age**: 25-55
- **Goal**: Understand if their salary is keeping up with inflation and cost of living
- **Use Case**: Track salary development across job changes, raises, and career progression
- **Pain Point**: Can't easily see if raises are "real" or just matching inflation

### Secondary User: Job Seeker / Career Changer

- **Goal**: Prepare for salary negotiations with data-backed arguments
- **Use Case**: Generate professional negotiation emails and talking points
- **Pain Point**: Difficulty articulating salary expectations and justifications

## Features

### 1. Salary Dashboard

The main view showing your salary development over time with modern, polished UI based on professional design standards.

#### Visual Design Features

- **Metric Cards**: Three key metrics displayed with colored icon pills (blue, indigo, orange)
  - Total Annual Salary with trend indicator
  - Real Annual Value (inflation-adjusted) with help tooltip
  - Yearly Change percentage with absolute value
  - Hover effects on cards for interactive feedback (border color transition)

- **Chart Section**: Interactive visualization with:
  - Professional badge styling in header (BRUTTO/NETTO, REFERANSE AKTIV)
  - Clean chart area with legend integrated in the visualization
  - Controls menu below chart with:
    - Reference salary comparison dropdown (e.g., "Sykepleiere")
    - Toggle for gross/net view
    - Toggle for reference comparison

- **Activity Timeline**: Recent salary additions with:
  - Vertical timeline line connecting entries
  - Relative time labels ("I år", "I fjor", "2 år siden")
  - Hover-revealed edit/delete actions
  - Green badges for salary amounts with ring-inset design

- **Year Selector**: Header widget showing current fiscal year with calendar icon

- **Color Palette**: Figma-aligned design system
  - Primary: #3b82f6 (Blue-500)
  - Semantic colors: emerald (#10b981), orange (#f97316), indigo (#6366f1)
  - Consistent light mode throughout

#### User Workflow

1. **First Visit (Onboarding)**:
   - User sees welcome screen with explanation of the app
   - Two options:
     - "Try Demo Data" (Prøv med eksempeldata) - loads example data to explore
     - "Add My Own Salary" (Legg til min egen lønn) - scrolls to form

2. **Adding Salary Data**:
   - User clicks "Add My Own Salary" or scrolls to right panel
   - Enters year (e.g., 2024)
   - Enters annual gross salary in NOK (e.g., 650000)
   - Clicks "Add Salary" (Legg til lønn)
   - Chart updates immediately with new data point

3. **Viewing the Chart**:
   - **Blue line**: Your actual salary (gross or net depending on mode)
   - **Green line**: Inflation-adjusted baseline (what your earliest salary would need to be today)
   - **Amber dashed line** (optional): Reference salary for occupation (if enabled)
   - **X-axis**: Years (shows full range even with sparse data)
   - **Y-axis**: NOK amount

4. **Understanding Metrics**:
   - **Annual Salary** (Årslønn): Your current/latest salary
   - **Real Annual Value** (Reell årsverdi): Latest salary adjusted for inflation (what it's worth in today's money)
   - **vs Inflation** (vs Inflasjon): How much better/worse than inflation your salary growth is
   - **Yearly Change** (Årlig endring): Recent salary change percentage

#### Business Logic

**Inflation Adjustment**:

- Takes your earliest salary as the baseline (year₀)
- For each subsequent year, calculates: `adjusted = baseline × (1 + cumulative_inflation)`
- Example: If you earned 500,000 NOK in 2020 and inflation from 2020-2024 was 15%, the inflation-adjusted line shows 575,000 NOK in 2024
- **This represents**: What you would need to earn in 2024 to maintain the same purchasing power as 500,000 NOK in 2020

**Real Annual Value**:

- Converts your current salary to "2020 purchasing power" (or your earliest year)
- Formula: `real_value = current_salary / (1 + cumulative_inflation_since_baseline)`
- Example: 650,000 NOK in 2024 = 565,217 NOK in 2020 purchasing power (with 15% cumulative inflation)
- **This answers**: "Is my 2024 salary actually higher than my 2020 salary in real terms?"

**vs Inflation Percentage**:

- Compares total salary growth vs total inflation over the period
- Formula: `((current/baseline) - 1) - inflation_rate`
- Example: Salary grew 30%, inflation was 15%, so you're +15% ahead of inflation
- **Positive**: Your purchasing power increased
- **Negative**: Your purchasing power decreased despite raises

### 2. Net vs Gross Mode Toggle

Users can switch between viewing salary before tax and salary after tax.

#### User Workflow

1. Click the toggle in the chart header
2. Badge updates to show "Brutto" or "Netto"
3. Chart and metrics recalculate instantly
4. All numbers reflect the selected mode
5. Preference saved in browser (persists on reload)

#### Business Logic

**Gross Mode** (default):

- Shows salary as entered by user
- Matches typical salary discussions ("I earn 650k")

**Net Mode**:

- Applies Norwegian tax calculation to each data point:
  - Step-tax (trinnskatt) - progressive brackets
  - Social security (trygdeavgift) - ~8.2%
  - Municipal tax (kommuneskatt) - ~22%
  - Standard deduction (minstefradrag)
  - Personal allowance (personfradrag)
- Uses 2024 tax rules for all years (consistent comparison)
- Shows actual take-home pay

**Why This Matters**:

- Tax rates change over time
- Comparing gross salaries across years can be misleading if tax burdens shifted
- Net mode shows "what actually hit your bank account"

**Tax Calculation Example** (2024 rates):

- Gross: 650,000 NOK
- Standard deduction: ~84,150 NOK
- Taxable income: 565,850 NOK
- Step-tax: ~9,317 NOK
- Social security: ~53,300 NOK
- Municipal tax: ~91,551 NOK
- **Net: ~495,832 NOK**

### 3. Reference Salary Comparison

Compare your salary against industry benchmarks from SSB (Statistics Norway).

#### User Workflow

1. Enable toggle: "Vis referanselønn" (Show reference salary)
2. Amber dashed line appears on chart
3. Badge appears in chart header: "Referanse aktiv"
4. Line shows median/average salary for the selected occupation
5. Respects net/gross mode (same tax calculation applied)
6. Toggle persists in browser

#### Current Implementation

**Available Occupation**:

- **Nurses** (Sykepleiere) - SSB occupation code 2223
- Data: 2015-2024 official data from SSB table 11418
- 2025: Estimated using wage index from SSB table 11654

**Data Sources**:

- **SSB Table 11418**: Monthly earnings by occupation
  - Filters: All sectors, both sexes, all employees
  - Metric: Average monthly earnings
  - Converted to yearly: `monthly × 12`
- **SSB Table 11654**: Wage index (for 2025 estimate)
  - Health sector (NACE 86-88)
  - Q3 2024 to Q3 2025 growth rate
  - Applied to 2024 data to estimate 2025

**Example Data (Nurses)**:

- 2020: 493,560 NOK (official)
- 2024: 680,520 NOK (official)
- 2025: 702,936 NOK (estimated, marked with dashed pattern)

#### Business Logic

**Year Range Filtering**:

- Reference data filtered to match your salary year range
- If you have data 2020-2024, reference shows 2020-2024
- Prevents misleading comparisons

**Net/Gross Consistency**:

- If in net mode, reference data also converted to net
- Uses same tax calculation as your salary
- Ensures apples-to-apples comparison

**Extensibility**:

- Architecture supports adding more occupations
- Registry in `features/referenceSalary/occupations.ts`
- Future: User can select occupation from dropdown

### 4. Time Range Filtering

Filter the chart to focus on specific time periods.

#### User Workflow

1. Click time range buttons: "1Y", "3Y", "ALL" (default)
2. Chart filters to show:
   - **1Y**: Last year of data only
   - **3Y**: Last 3 years of data
   - **ALL**: All your data points
3. Metrics recalculate for filtered range
4. Inflation baseline adjusts to earliest visible year

#### Business Logic

- Filter applies to both your salary data and inflation data
- Chart x-axis range adjusts to filtered years
- Statistics (metrics) recalculate based on visible data only
- Example: If you filter to 3Y, "vs Inflation" shows 3-year comparison, not lifetime

### 5. Activity Timeline

Shows your recent salary entries in chronological order.

#### User Workflow

1. Scroll to right panel
2. See list of all salary entries
3. Each entry shows:
   - Year badge (e.g., "2024")
   - Salary amount (formatted: "650 000 kr")
   - Relative time (e.g., "I år (2025)", "2 år siden")
4. Actions:
   - **Edit**: Pre-fills form, removes entry (re-add to save)
   - **Delete**: Confirms, then removes entry

#### Business Logic

**Relative Time Calculation**:

- "I år (2024)" - Current year entry
- "I fjor (2023)" - Last year
- "2 år siden" - 2+ years ago
- Includes absolute year for clarity

**Editing Flow**:

1. User clicks edit on 2022 entry (500,000 NOK)
2. Form populates with year=2022, salary=500000
3. Entry removed from list
4. User can modify values and click "Add" to re-save
5. New entry appears with updated values

**Why This Pattern**:

- Simpler than in-place editing
- Prevents duplicate year errors
- Reuses existing form validation

### 6. Negotiation Preparation

Generate professional negotiation materials based on your salary data and custom arguments.

**Note**: Requires OpenAI API key to use this feature.

#### User Workflow

1. Navigate to "Forhandling" tab (via sidebar or mobile bottom nav)
2. Fill in job details:
   - Current/target job title
   - Industry
   - Current salary (auto-filled from dashboard)
   - Desired salary
3. Add context:
   - Market statistics
   - Benefits/conditions
4. Build arguments:
   - Select argument type (Experience, Education, Performance, etc.)
   - Enter description
   - Add multiple arguments (up to 10)
5. Generate materials:
   - Click "Generate Email" → Professional negotiation email
   - Click "Generate Playbook" → Detailed negotiation strategy
6. Use generated content:
   - Copy as rich text (paste into Outlook/Word)
   - Download as DOCX
   - Copy markdown (for inspection)

#### Argument Types

Available argument categories:

1. **Experience** (Erfaring): Years in role, industry experience
2. **Education** (Utdanning): Degrees, certifications, courses
3. **Performance** (Ytelse): Achievements, KPIs, results
4. **Responsibility** (Ansvar): Team size, budget, scope
5. **Market** (Marked): Industry salary data, benchmarks
6. **Unique Skills** (Unike ferdigheter): Rare skills, specializations
7. **Other** (Annet): Custom arguments

#### Generated Content

**Negotiation Email**:

- Professional greeting and opening
- Brief context and purpose
- 2-3 key arguments highlighted
- Salary expectation stated clearly
- **[NEW] Market data analysis** (when job title provided): Automatic SSB median salary comparison
- Call to action (meeting request)
- Professional closing
- ~200-300 words, ready to send

**Negotiation Playbook**:

- Executive summary
- Detailed argument breakdown
- **[NEW] Market position analysis** (when job title provided): SSB salary trends and positioning
- Anticipate objections and counters
- Market context and benchmarks
- Negotiation strategy and tactics
- Walk-away scenarios
- Next steps checklist
- ~800-1200 words, comprehensive guide

#### Dynamic Market Data (AI-Powered SSB Integration)

**How It Works**:

When you fill in your job title (e.g., "Senior Developer", "Sykepleier"), the AI agent **autonomously queries SSB** (Statistics Norway) during generation to enrich your negotiation materials with official salary data.

**What the AI Does Automatically**:

1. **Translates Job Title → SSB Occupation Code**
   - Example: "Programvareutvikler" → SSB code 2512
   - Uses fuzzy matching for close matches (e.g., "Utvikler" → 2512)
   - Notifies you if using approximate category

2. **Fetches Median Salary**
   - Gets latest official median salary for your occupation
   - Example: Programvareutviklere median 820,000 NOK (2024)
   - Source: SSB Table 11418

3. **Compares Your Salary to Market**
   - Calculates gap: "Your 900k request is 9.8% above market median"
   - Position indicator: "above market", "at market", "below market"
   - Justifies increase/decrease based on market position

4. **Analyzes Salary Trends** (in playbook)
   - Historical growth rates
   - Example: "Median salary grew 4.2% annually 2020-2024"
   - Context for timing your negotiation

**Transparency & Notifications**:

- If AI uses approximate occupation match, you'll see: _"Basert på SSB-data for nærmeste kategori (Programvareutviklere)..."_
- All market data cites source: _"Kilde: SSB Tabell 11418"_
- If no SSB match found, AI proceeds using your manually entered market data

**Supported Occupations** (as of Dec 2024):

- Sykepleiere (Nurses) - Code 2223
- Programvareutviklere (Software Developers) - Code 2512
- Lærere (Teachers) - Code 2330
- Ingeniører (Civil Engineers) - Code 2146

**Example AI Enhancement**:

_User input_: Job title "Senior Developer", Current salary 750k, Desired 900k

_AI generates_:

> "Basert på SSB-data for Programvareutviklere er medianlønnen 820,000 NOK i 2024. Din ønskede lønn på 900,000 NOK ligger 9.8% over markedsmedianen. Dette kan forsvares dersom du har:
>
> - 5+ års erfaring (senior-nivå)
> - Spesialkompetanse innen kritiske områder
> - Dokumenterte resultater som overstiger forventninger..."

_Without AI tools, generic response_:

> "For å støtte din ønskede lønn på 900,000 NOK, bør du presentere..."

#### Business Logic

**Prompt Construction**:

- Combines job details + context + arguments
- Injects salary history summary from dashboard
- Tailored Norwegian business communication style
- Professional tone (formal but warm)

**Generation Limits**:

- Email: 3 generations per session
- Playbook: 3 generations per session
- Prevents excessive OpenAI API usage
- Resets on page reload

**AI Model**:

- Uses GPT-4 Turbo via Vercel AI SDK
- Structured generation with markdown output
- Streamed response for faster perceived performance

### 7. Data Management

#### Adding Data

**Validation Rules**:

- Year is required
- Salary is required and must be positive
- Year must be within inflation data range (typically 1900+)
- No duplicate years allowed
- Numbers can include spaces (650 000) or not (650000)

**Success Flow**:

1. User enters valid year and salary
2. Clicks "Add"
3. Data point added to internal state
4. Saved to localStorage
5. Chart updates immediately
6. Form clears
7. Activity timeline updates
8. Metrics recalculate

**Error Flow**:

1. User enters invalid data (e.g., negative salary)
2. Clicks "Add"
3. Red error message appears below form
4. Form remains filled (user can correct)
5. No data saved

#### Editing Data

1. User clicks edit button on timeline entry
2. Form pre-fills with existing year and salary
3. Entry temporarily removed from chart
4. User modifies values
5. Clicks "Add" to save changes
6. Updated entry appears in chart and timeline

#### Deleting Data

1. User clicks delete button on timeline entry
2. Confirmation dialog appears: "Er du sikker?"
3. If confirmed:
   - Entry removed from state
   - localStorage updated
   - Chart updates
   - Metrics recalculate

#### Resetting All Data

1. User clicks "Reset Data" in footer
2. Confirmation dialog appears
3. If confirmed:
   - All localStorage keys cleared:
     - Salary points
     - Display mode
     - Onboarding flags
     - Negotiation data
     - Last active tab
   - Page reloads
   - User sees onboarding screen again

### 8. Demo Mode

Allows users to explore the app with sample data before entering their own.

#### User Workflow

1. On first visit, user sees onboarding screen
2. Clicks "Try Demo Data"
3. Chart populates with 5 sample salary entries (2020-2024)
4. Blue info banner appears: "You are viewing demo data"
5. User can explore all features with sample data
6. When ready, clicks "Add My Own Salary"
7. Page reloads, demo data cleared
8. User enters first real salary
9. Demo mode exits automatically

#### Demo Data

**Sample Progression** (Nurse example):

- 2020: 550,000 NOK
- 2021: 570,000 NOK
- 2022: 595,000 NOK
- 2023: 635,000 NOK
- 2024: 680,000 NOK

**Characteristics**:

- Realistic salary progression (~5% annual growth)
- Aligned with Norwegian salary levels
- Demonstrates inflation impact clearly
- Shows both gains ahead of inflation and losses

#### Business Logic

**Ephemeral Nature**:

- Demo data NOT saved to localStorage
- Held only in component state
- Page reload clears demo data
- First real salary entry triggers reload, clearing demo

**Why This Approach**:

- Users can experiment risk-free
- No mixing of demo and real data
- Clear exit from demo mode
- Forces intentional transition to real data

## Data Privacy & Storage

### Client-Side Only

- **No server storage**: All user data stored in browser localStorage
- **No account required**: Anonymous usage, no login
- **No tracking**: No analytics or user tracking
- **GDPR friendly**: User controls their data completely

### localStorage Keys

- `salary-calculator-points`: Array of salary entries
- `salaryDisplayMode`: "net" or "gross" preference
- `salaryReferenceEnabled`: Boolean for reference toggle
- `salary-onboarding-v1`: Onboarding completion flag
- `negotiation_data_points`: Negotiation arguments
- `negotiation_data_email`: Generated email content
- `negotiation_data_playbook`: Generated playbook content
- `salary-last-tab`: Last active tab (Dashboard/Negotiation)

### Data Portability

**Export** (manual):

- User can inspect localStorage in browser DevTools
- Copy/paste JSON data
- No built-in export UI (planned future feature)

**Import** (manual):

- User can paste JSON into localStorage via DevTools
- Data will load on next page refresh

**Reset**:

- "Reset Data" button in footer
- Clears all app data
- No recovery after reset (no server backup)

## Mobile Experience

### Responsive Design

- **Breakpoint**: 768px (md in Tailwind)
- **Mobile-first**: Designed for phones, enhanced for desktop
- **Touch-friendly**: Large tap targets, swipe-friendly

### Mobile-Specific Features

1. **Bottom Navigation**:
   - Fixed bottom tab bar
   - Two tabs: Dashboard, Negotiation
   - Active state highlighting
   - Hidden on desktop

2. **Collapsible Panels**:
   - Right panel (data entry) collapsed by default on mobile
   - Maximizes chart space
   - Tap to expand/collapse
   - Smooth animations

3. **Compact Metrics**:
   - Default: Shows 2 key metrics (collapsed)
   - Expandable: Tap to see all 4 metrics
   - Conserves vertical space
   - Chart gets ~70% more screen space

4. **Simplified Charts**:
   - Separate mobile chart component
   - No grid lines (cleaner)
   - Compact axis labels (500k → 500k)
   - Simplified legend
   - Larger touch targets for data points

5. **Mobile Negotiation**:
   - Stacked form fields
   - Full-width inputs
   - Bottom padding for bottom nav
   - Scrollable argument list

## User Interface Patterns

### Typography

- **Headings**: Responsive sizing (text-lg → text-2xl on larger screens)
- **Body**: 14-16px base, scales up on desktop
- **Numbers**: Monospace for alignment, formatted with spaces (650 000 kr)
- **Language**: Norwegian (Bokmål) throughout

### Color System

Uses CSS variables for theming:

- **Primary**: Green (#10b981) - actions, success
- **Secondary**: Purple (#8b5cf6) - secondary actions
- **Reference**: Amber (#f59e0b) - reference line
- **Background**: Light gray (#f8f9fa)
- **Text**: Dark gray (#1f2937)
- **Muted**: Medium gray (#6b7280)
- **Border**: Light gray (#e5e7eb)

### Iconography

- **Material Icons**: Round style for friendly feel
- **Material Symbols**: For more detailed icons
- Semantic usage (e.g., trending_up for growth, info for help)

### Feedback

**Loading States**:

- Spinner with "Loading..." text
- Disabled buttons during operations
- Skeleton screens (planned)

**Success States**:

- Immediate visual updates (chart, metrics)
- No toast notifications (changes speak for themselves)

**Error States**:

- Inline error messages (red text below form)
- Clear error descriptions
- Actionable guidance ("Please enter a year")

**Empty States**:

- Onboarding screen with clear CTAs
- Educational content explaining the app

### Accessibility

**Keyboard Navigation**:

- All interactive elements keyboard-accessible
- Logical tab order
- Enter key submits forms

**Screen Readers**:

- Semantic HTML (headings, buttons, inputs)
- ARIA labels where needed
- Alt text for icons (decorative marked as aria-hidden)

**Contrast**:

- WCAG AA compliant color contrast
- Large touch targets (44×44px minimum on mobile)

**Help Tooltips**:

- Info icons next to complex metrics
- Native browser tooltips (title attribute)
- Explain jargon (e.g., "real annual value")

## User Journeys

### Journey 1: First-Time User Exploring

1. **Arrival**: User visits homepage
2. **Onboarding**: Sees welcome screen with explanation
3. **Demo**: Clicks "Try Demo Data"
4. **Exploration**: Views chart, toggles net/gross, filters time ranges
5. **Understanding**: Reads metric tooltips, understands inflation impact
6. **Commitment**: Clicks "Add My Own Salary"
7. **Entry**: Enters first real salary point
8. **Continuation**: Adds 2-3 more historical data points
9. **Insight**: Sees their personal inflation impact

### Journey 2: Existing User Tracking Raise

1. **Return**: User opens app (has historical data)
2. **Update**: Receives annual raise notification at work
3. **Entry**: Adds new salary entry for current year
4. **Comparison**: Checks "vs Inflation" metric
5. **Realization**: Discovers raise barely beat inflation (+0.5%)
6. **Reference**: Enables reference salary comparison
7. **Benchmark**: Sees they're below industry average
8. **Action**: Navigates to Negotiation tab

### Journey 3: Job Seeker Preparing Negotiation

1. **Context**: User has job interview next week
2. **Navigation**: Opens Negotiation tab
3. **Details**: Fills job title, industry, desired salary
4. **Context**: Adds market statistics, benefit priorities
5. **Arguments**: Adds 5 arguments (experience, education, performance)
6. **Generation**: Clicks "Generate Email"
7. **Review**: Reads generated email, makes mental notes
8. **Playbook**: Clicks "Generate Playbook"
9. **Study**: Downloads DOCX, reads strategy overnight
10. **Interview**: Uses talking points from playbook
11. **Success**: Negotiates 12% higher offer than initial

### Journey 4: Annual Salary Review

1. **Annual Ritual**: User opens app every January
2. **Entry**: Adds new salary for previous year
3. **Review**: Views full salary history (5+ years)
4. **Analysis**: Sees cumulative inflation impact
5. **Calculation**: Realizes purchasing power down 3% despite raises
6. **Documentation**: Takes screenshot of chart
7. **Meeting**: Presents data in 1-on-1 with manager
8. **Outcome**: Secures inflation-adjusted raise for next year

## Business Rules Summary

### Inflation Calculations

- **Baseline**: Always the earliest salary year in your data
- **Cumulative**: Inflation compounds year-over-year
- **Source**: Official SSB (Statistics Norway) data
- **Honesty**: No interpolation, only real data points connected

### Tax Calculations

- **Rules**: 2024 Norwegian tax code applied to all years
- **Components**: Step-tax, social security, municipal tax
- **Deductions**: Standard deduction, personal allowance
- **Simplification**: Single tax calculation (no historical tax code variations)

### Reference Data

- **Source**: SSB official statistics
- **Estimates**: 2025 data estimated via wage index, clearly marked
- **Filtering**: Auto-filtered to match your year range
- **Tax**: Same calculation as your data (net/gross consistent)

### Data Validation

- **Required**: Year and salary
- **Positive**: Salary must be > 0
- **Range**: Year must be within inflation data availability
- **Unique**: No duplicate years allowed
- **Format**: Numbers can have spaces or not

### Generation Limits

- **Email**: 3 per session
- **Playbook**: 3 per session
- **Rationale**: Prevent API abuse, encourage thoughtful use
- **Reset**: Page reload resets counters

---

## Summary

Kjøpekraft provides Norwegian salary earners with:

1. **Clarity**: Understand real salary growth vs inflation
2. **Honesty**: No fake data interpolation, only your actual numbers
3. **Context**: Compare against industry benchmarks
4. **Action**: Professional negotiation materials
5. **Privacy**: All data stays in your browser
6. **Accessibility**: Mobile-first, keyboard-friendly, screen reader support

The app follows Norwegian business culture and tax regulations, using official government data sources for accuracy.

For technical implementation details, see [ARCHITECTURE.md](ARCHITECTURE.md).  
For setup instructions, see the quick start in `README.md`.
