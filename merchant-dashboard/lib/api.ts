import axios from 'axios'
import Cookies from 'js-cookie'

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('firaye_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get('firaye_refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${apiUrl}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          if (response.data.success) {
            Cookies.set('firaye_token', response.data.data.access_token)
            error.config.headers.Authorization = `Bearer ${response.data.data.access_token}`
            return api.request(error.config)
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          Cookies.remove('firaye_token')
          Cookies.remove('firaye_refresh_token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

