/**
 * CORS (Cross-Origin Resource Sharing) Utilities
 *
 * Provides utilities for handling CORS headers in authentication endpoints.
 * Essential for browser-based clients making cross-origin requests.
 */

import type { CorsConfig } from '../types.js'

/**
 * Default CORS configuration
 */
const DEFAULT_CORS_CONFIG: Required<CorsConfig> = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  maxAge: 86400, // 24 hours
}

/**
 * Check if origin is allowed
 *
 * @param origin - Request origin header
 * @param allowedOrigins - Configured allowed origins
 * @returns True if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string | string[]): boolean {
  if (!origin) return false

  // Allow all origins
  if (allowedOrigins === '*') return true

  // Check against array of allowed origins
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin)
  }

  // Check against single origin
  return allowedOrigins === origin
}

/**
 * Create CORS headers for a response
 *
 * @param request - HTTP request
 * @param config - CORS configuration
 * @returns Headers object with CORS headers
 *
 * @example
 * ```ts
 * const headers = createCorsHeaders(request, config.cors)
 * return new Response(body, { headers })
 * ```
 */
export function createCorsHeaders(
  request: Request,
  config?: CorsConfig
): Headers {
  const headers = new Headers()
  const corsConfig = { ...DEFAULT_CORS_CONFIG, ...config }

  const origin = request.headers.get('Origin')

  // Set Access-Control-Allow-Origin
  if (corsConfig.origin === '*') {
    headers.set('Access-Control-Allow-Origin', '*')
  } else if (origin && isOriginAllowed(origin, corsConfig.origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }

  // Set Access-Control-Allow-Credentials
  if (corsConfig.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Set Access-Control-Allow-Methods
  headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '))

  // Set Access-Control-Allow-Headers
  headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '))

  // Set Access-Control-Expose-Headers (if any)
  if (corsConfig.exposedHeaders.length > 0) {
    headers.set('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '))
  }

  // Set Access-Control-Max-Age
  headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString())

  return headers
}

/**
 * Handle CORS preflight request (OPTIONS)
 *
 * @param request - HTTP OPTIONS request
 * @param config - CORS configuration
 * @returns Response with CORS headers
 *
 * @example
 * ```ts
 * if (request.method === 'OPTIONS') {
 *   return handleCorsPreflightRequest(request, config.cors)
 * }
 * ```
 */
export function handleCorsPreflightRequest(
  request: Request,
  config?: CorsConfig
): Response {
  const headers = createCorsHeaders(request, config)

  return new Response(null, {
    status: 204,
    headers,
  })
}

/**
 * Add CORS headers to an existing response
 *
 * @param response - Original response
 * @param request - HTTP request
 * @param config - CORS configuration
 * @returns Response with CORS headers added
 *
 * @example
 * ```ts
 * const response = await handleAuthRequest(request, config)
 * return addCorsHeaders(response, request, config.cors)
 * ```
 */
export function addCorsHeaders(
  response: Response,
  request: Request,
  config?: CorsConfig
): Response {
  const corsHeaders = createCorsHeaders(request, config)

  // Clone response and add CORS headers
  const newHeaders = new Headers(response.headers)
  corsHeaders.forEach((value, key) => {
    newHeaders.set(key, value)
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

/**
 * Wrap a request handler with CORS support
 *
 * @param handler - Original request handler
 * @param config - CORS configuration
 * @returns Wrapped handler with CORS support
 *
 * @example
 * ```ts
 * const handleWithCors = withCors(handleAuthRequest, config.cors)
 * return handleWithCors(request, config)
 * ```
 */
export function withCors(
  handler: (request: Request, config: any) => Promise<Response>,
  corsConfig?: CorsConfig
): (request: Request, config: any) => Promise<Response> {
  return async (request: Request, config: any): Promise<Response> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request, corsConfig)
    }

    // Handle actual request
    const response = await handler(request, config)

    // Add CORS headers to response
    return addCorsHeaders(response, request, corsConfig)
  }
}
