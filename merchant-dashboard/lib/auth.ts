import Cookies from 'js-cookie'

/**
 * Decode JWT token to extract payload
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

/**
 * Get current user's role from token
 */
export function getUserRole(): string | null {
  const token = Cookies.get('firaye_token')
  if (!token) return null
  
  const decoded = decodeToken(token)
  return decoded?.role || null
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRole: string): boolean {
  const userRole = getUserRole()
  return userRole === requiredRole
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!Cookies.get('firaye_token')
}

