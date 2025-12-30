import axios from 'axios'
import Cookies from 'js-cookie'

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

api.interceptors.request.use((config) => {
  // Only access cookies on client side
  if (typeof window !== 'undefined') {
    const token = Cookies.get('firaye_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log error details for debugging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      })
    } else if (error.request) {
      console.error('API Request Error:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
      })
    } else {
      console.error('API Error:', error.message)
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        Cookies.remove('firaye_token')
        Cookies.remove('firaye_refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

