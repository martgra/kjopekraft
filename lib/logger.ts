type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  action?: string
  userId?: string
  duration?: number
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context: LogContext = {}): string {
    const timestamp = new Date().toISOString()
    const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: this.isDev ? error.stack : undefined,
        },
      }),
    }

    if (this.isDev) {
      // Pretty print in development
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m', // green
        warn: '\x1b[33m', // yellow
        error: '\x1b[31m', // red
      }
      const reset = '\x1b[0m'
      const color = colors[level]

      const contextStr =
        Object.keys(context).length > 0 ? ` ${JSON.stringify(context, null, 2)}` : ''

      console[level === 'debug' ? 'log' : level](
        `${color}[${level.toUpperCase()}]${reset} ${message}${contextStr}`,
      )

      if (error) {
        console.error(error)
      }
    } else {
      // JSON in production for log aggregation services
      console[level === 'debug' ? 'log' : level](JSON.stringify(entry))
    }
  }

  /**
   * Debug level - only logs in development
   */
  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      this.log('debug', message, context)
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  /**
   * Warn level - warnings that don't stop execution
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  /**
   * Error level - errors with optional Error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorObj = error instanceof Error ? error : undefined
    const errorContext = error && !(error instanceof Error) ? { errorData: error } : {}
    this.log('error', message, { ...context, ...errorContext }, errorObj)
  }

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext)
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext,
  ) {}

  debug(message: string, context?: LogContext) {
    this.parent.debug(message, { ...this.defaultContext, ...context })
  }

  info(message: string, context?: LogContext) {
    this.parent.info(message, { ...this.defaultContext, ...context })
  }

  warn(message: string, context?: LogContext) {
    this.parent.warn(message, { ...this.defaultContext, ...context })
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    this.parent.error(message, error, { ...this.defaultContext, ...context })
  }
}

// Singleton instance
export const logger = new Logger()

export function logServiceError(service: string, error: unknown, context: LogContext = {}) {
  logger.error(`${service} error`, error, context)
}
