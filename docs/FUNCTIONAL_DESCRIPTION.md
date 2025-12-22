# Functional Description

This document describes Kjøpekraft's features, user workflows, and business logic from a user perspective.

## Application Overview

**Kjøpekraft** (Norwegian for "Purchasing Power") is a personal salary tracking and analysis tool designed specifically for the Norwegian market. It helps users understand how their salary has evolved over time when accounting for inflation, and provides tools for salary negotiation preparation.

### Core Value Proposition

- **Track Real Purchasing Power**: Not just salary growth, but actual purchasing power after adjusting for inflation
- **Norwegian-Specific**: Uses official SSB (Statistics Norway) data and accurate Norwegian tax calculations
- **Honest Data Visualization**: Actual data points are preserved; interpolated years are clearly marked as estimates
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
  - Settings modal (gear button) that holds:
    - Net/gross toggle (Brutto/Netto)
    - Inflation base-year input (valid pay-point years or "auto")
    - Reference salary toggle + occupation selector

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
   - **Green line**: Inflation-adjusted baseline anchored to the last significant change (promotion/new job) unless that change is in the latest year, in which case the previous significant change is used
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

- Baseline defaults to the most recent significant change (promotion/new job) that is not in the latest year. If the latest point is also significant, the previous significant year is used.
- For each year, calculates: `adjusted = baseSalary × CPI_index_from_base`
- **This represents**: What you would need to earn in a given year to preserve the purchasing power you had at that baseline event. Users can override the base year in chart settings (validated against existing pay years or "auto").

**Real Annual Value**:

- Converts your current salary to purchasing power at the chosen baseline year.
- Formula: `real_value = current_salary / CPI_index_from_base`
- **This answers**: "Is my current salary actually higher than my salary at the last significant change in real terms?"

**vs Inflation Percentage**:

- Compares total salary growth vs total inflation over the period
- Formula: `((current/baseline) - 1) - inflation_rate`
- Example: Salary grew 30%, inflation was 15%, so you're +15% ahead of inflation
- **Positive**: Your purchasing power increased
- **Negative**: Your purchasing power decreased despite raises

### 2. Net vs Gross Mode Toggle

Users can switch between viewing salary before tax and salary after tax.

#### User Workflow

1. Open chart settings (gear) and toggle Brutto/Netto.
2. Badge updates to show "Brutto" or "Netto".
3. Chart and metrics recalculate instantly (shared purchasing-power hook).
4. All numbers reflect the selected mode.
5. Preference saved in browser (persists on reload).

#### Business Logic

**Gross Mode** (default):

- Shows salary as entered by user
- Matches typical salary discussions ("I earn 650k")

**Net Mode**:

- Applies Norwegian tax calculation to each data point:
  - Step-tax (trinnskatt) - progressive brackets
  - Social security (trygdeavgift)
  - Municipal tax (kommuneskatt)
  - Standard deduction (minstefradrag)
  - Personal allowance (personfradrag)
- Uses the available tax tables for the given year; if a year is missing, the gross value is used as a safe fallback so the UI never crashes.
- Shows estimated take-home pay.

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

1. Open chart settings and enable "Vis referanselønn" (Show reference salary)
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

### 4. Negotiation Preparation

Generate professional negotiation materials based on your salary data and custom arguments.

**Note**: Requires OpenAI API key + login for AI generation.

#### User Workflow

1. Navigate to "Forhandling" tab (via sidebar or mobile bottom nav)
2. Fill in job details:
   - Current/target job title
   - Industry
   - Current salary (auto-filled from dashboard pay points)
   - Desired salary (prefilled suggestion based on purchasing-power gap + inflation estimate)
3. Add context:
   - Optional market note (hidden unless no SSB match or user types)
   - Benefits/conditions checklist (collapsible list: pension, bonus, stock, extra vacation, flexible hours, home office, insurance)
4. Build arguments:
   - Suggested argument chips (achievements, responsibilities, skills/certs, market, other)
   - Add up to five focused arguments
5. Generate materials:
   - Click "Generate Email" → Professional negotiation email
6. Use generated content:
   - Copy as rich text
   - Download as DOCX
   - Copy markdown (for inspection)

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
- **No account required**: Core features are anonymous; AI generation requires login
- **No tracking**: No analytics or user tracking
- **GDPR friendly**: User controls their data completely

### localStorage Keys

- `salary-calculator-points`: Array of salary entries
- `salaryDisplayMode`: "net" or "gross" preference
- `salaryReferenceEnabled`: Boolean for reference toggle
- `salary-onboarding-v1`: Onboarding completion flag
- `negotiation_data_points`: Negotiation arguments
- `negotiation_data_email`: Generated email content
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
8. **Study**: Downloads DOCX, reads strategy overnight
9. **Interview**: Uses talking points from the email
10. **Success**: Negotiates 12% higher offer than initial

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
