/**
 * SSB Tools for AI Agents
 * Defines Vercel AI SDK tools that enable autonomous querying of SSB salary data
 * Tools use Zod schemas for parameter validation and type safety
 */

import { tool } from 'ai'
import { z } from 'zod'
import { queryMedianSalary, querySalaryTrend, calculateMarketGap } from './ssbQueryFunctions'
import { mapJobTitleToOccupation, getOccupationByCode } from './occupationMapper'

/**
 * Tool: Get median salary for a Norwegian occupation from SSB
 * Accepts either SSB occupation code (e.g., "2223") or free-text job title
 */
const getMedianSalary = tool({
  description:
    'Get median salary for a Norwegian occupation from SSB (Statistics Norway). ' +
    'Accepts SSB occupation code (e.g., "2223" for nurses) or job title in Norwegian (e.g., "sykepleier"). ' +
    'Returns monthly and yearly median salary with data source and confidence level.',
  inputSchema: z.object({
    occupation: z
      .string()
      .describe(
        'SSB occupation code (e.g., "2223") or job title in Norwegian (e.g., "sykepleier", "utvikler")',
      ),
    year: z
      .number()
      .int()
      .min(2015)
      .max(2025)
      .describe('Year to query salary data for (2015-2025). Use 2024 for latest official data.'),
  }),
  execute: async ({ occupation, year }) => {
    try {
      // Try direct code lookup first
      let occupationCode = occupation
      let occupationInfo = getOccupationByCode(occupation)

      // If not a direct code, try mapping from job title
      if (!occupationInfo) {
        const mapped = mapJobTitleToOccupation(occupation)
        if (!mapped) {
          return {
            error: true,
            message: `Kunne ikke finne SSB-data for yrket "${occupation}". Støttede yrker: Sykepleiere (2223), Programvareutviklere (2512), Lærere (2330), Ingeniører (2146).`,
          }
        }
        occupationCode = mapped.code
        occupationInfo = mapped
      }

      // Query SSB
      const salaryData = await queryMedianSalary(occupationCode, year)

      return {
        occupation: {
          code: occupationCode,
          label: occupationInfo.label,
          labelEn: occupationInfo.labelEn,
          isApproximate: occupationInfo.isApproximate,
          confidence: occupationInfo.confidence,
        },
        year,
        monthly: salaryData.monthly,
        yearly: salaryData.yearly,
        source: salaryData.source,
        dataConfidence: salaryData.confidence,
        notice:
          occupationInfo.isApproximate && occupationInfo.confidence < 1.0
            ? `Bruker nærmeste yrkeskategori: ${occupationInfo.label}`
            : undefined,
      }
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Kunne ikke hente SSB-data',
      }
    }
  },
})

/**
 * Tool: Get salary trend over time for an occupation
 * Analyzes salary development and calculates growth rates
 */
const getSalaryTrend = tool({
  description:
    'Get salary trend over a time period for a Norwegian occupation from SSB. ' +
    'Returns time series data and calculated growth rates (total and annual average). ' +
    'Useful for analyzing salary development and market trends.',
  inputSchema: z.object({
    occupation: z.string().describe('SSB occupation code or job title in Norwegian'),
    fromYear: z.number().int().min(2015).max(2024).describe('Start year for trend analysis'),
    toYear: z.number().int().min(2016).max(2025).describe('End year for trend analysis'),
  }),
  execute: async ({ occupation, fromYear, toYear }) => {
    try {
      // Map occupation
      let occupationCode = occupation
      let occupationInfo = getOccupationByCode(occupation)

      if (!occupationInfo) {
        const mapped = mapJobTitleToOccupation(occupation)
        if (!mapped) {
          return {
            error: true,
            message: `Kunne ikke finne SSB-data for yrket "${occupation}".`,
          }
        }
        occupationCode = mapped.code
        occupationInfo = mapped
      }

      // Query trend
      const trendData = await querySalaryTrend(occupationCode, fromYear, toYear)

      return {
        occupation: {
          code: occupationCode,
          label: occupationInfo.label,
        },
        period: { from: fromYear, to: toYear },
        series: trendData.series,
        growth: {
          total: trendData.totalGrowth,
          annual: trendData.annualGrowth,
        },
        source: 'SSB Table 11418',
      }
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Kunne ikke hente trenddata',
      }
    }
  },
})

/**
 * Tool: Compare user's salary to market median
 * Calculates position relative to market and provides gap analysis
 */
const compareToMarket = tool({
  description:
    'Compare a salary to the market median for a Norwegian occupation from SSB. ' +
    'Calculates how far above or below market the salary is (absolute and percentage). ' +
    'Returns position indicator (e.g., "above market", "below market").',
  inputSchema: z.object({
    occupation: z.string().describe('SSB occupation code or job title in Norwegian'),
    salary: z.number().int().min(0).describe('Annual salary to compare in NOK'),
    year: z
      .number()
      .int()
      .min(2015)
      .max(2025)
      .describe('Year for market comparison (use 2024 for latest)'),
  }),
  execute: async ({ occupation, salary, year }) => {
    try {
      // Map occupation
      let occupationCode = occupation
      let occupationInfo = getOccupationByCode(occupation)

      if (!occupationInfo) {
        const mapped = mapJobTitleToOccupation(occupation)
        if (!mapped) {
          return {
            error: true,
            message: `Kunne ikke finne SSB-data for yrket "${occupation}".`,
          }
        }
        occupationCode = mapped.code
        occupationInfo = mapped
      }

      // Calculate gap
      const gapData = await calculateMarketGap(occupationCode, salary, year)

      return {
        occupation: {
          code: occupationCode,
          label: occupationInfo.label,
          isApproximate: occupationInfo.isApproximate,
        },
        userSalary: salary,
        marketMedian: gapData.medianSalary,
        difference: gapData.difference,
        position: gapData.position,
        year,
        source: 'SSB Table 11418',
        notice: occupationInfo.isApproximate
          ? `Sammenligner med nærmeste yrkeskategori: ${occupationInfo.label}`
          : undefined,
      }
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Kunne ikke sammenligne med markedet',
      }
    }
  },
})

/**
 * Tool: Find SSB occupation code from job title
 * Helps translate free-text job descriptions to SSB occupation codes
 */
const findOccupationCode = tool({
  description:
    'Find the SSB occupation code for a job title. ' +
    'Useful when you need to translate a Norwegian job title (e.g., "sykepleier", "utvikler") ' +
    'into an SSB occupation code for use with other tools. ' +
    'Returns code, label, and confidence score.',
  inputSchema: z.object({
    jobTitle: z
      .string()
      .describe('Job title in Norwegian (e.g., "sykepleier", "programvareutvikler", "lærer")'),
  }),
  execute: async ({ jobTitle }) => {
    const match = mapJobTitleToOccupation(jobTitle)

    if (!match) {
      return {
        error: true,
        message: `Kunne ikke finne SSB-kode for "${jobTitle}". Støttede yrker: Sykepleiere, Programvareutviklere, Lærere, Ingeniører.`,
      }
    }

    return {
      code: match.code,
      label: match.label,
      labelEn: match.labelEn,
      confidence: match.confidence,
      isApproximate: match.isApproximate,
      notice: match.isApproximate
        ? `Dette er en tilnærmet match (${Math.round(match.confidence * 100)}% sikkerhet)`
        : undefined,
    }
  },
})

/**
 * SSB Toolset for AI Agents
 * Export as object for use with Vercel AI SDK generateText()
 */
export const ssbToolset = {
  getMedianSalary,
  getSalaryTrend,
  compareToMarket,
  findOccupationCode,
}
