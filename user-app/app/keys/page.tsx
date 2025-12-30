'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArrowPathIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

interface AccessKey {
  id?: number
  key: string
  product_id: number
  status: string
  expires_at: string
  created_at?: string
  product?: {
    id: number
    name: string
    description: string | null
    redirect_url: string | null
    price?: number
    access_duration_hours?: number
  }
  merchant_name?: string
  // Extended fields (from localStorage or future API)
  price?: number
  subscription_required?: boolean
  auto_expire?: boolean
  bundle_info?: string
  access_starts_at?: string
}

export default function KeysPage() {
  const router = useRouter()
  const [keys, setKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      setError(null)
      const response = await api.get('/access/keys')
      let userKeys = response.data.data?.keys || []
      
      // Enhance keys with additional data from localStorage (until backend supports it)
      if (typeof window !== 'undefined') {
        userKeys = userKeys.map((key: AccessKey) => {
          const stored = localStorage.getItem(`key_${key.key}_metadata`)
          if (stored) {
            try {
              const metadata = JSON.parse(stored)
              return { ...key, ...metadata }
            } catch (e) {
              // Ignore parse errors
            }
          }
          return key
        })
      }
      
      setKeys(userKeys)
    } catch (err: any) {
      console.error('Failed to load keys:', err)
      const errorDetail = err.response?.data?.detail || err.response?.data?.message || err.message
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.')
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Unable to connect to the server. Please ensure the backend is running.')
      } else if (err.response?.status === 404) {
        setError(`Endpoint not found: ${err.config?.url}. Error: ${errorDetail}`)
      } else {
        setError(`Failed to load access keys: ${errorDetail || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenProduct = (key: AccessKey) => {
    const redirectUrl = key.product?.redirect_url
    if (redirectUrl) {
      window.open(redirectUrl, '_blank')
    } else {
      alert('No redirect URL configured for this product')
    }
  }

  const handleRenew = (key: AccessKey) => {
    // Placeholder for renew logic
    alert('Renewal feature coming soon! Contact the merchant to extend your access.')
  }

  const handleRequestAccess = () => {
    router.push('/products')
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) {
      return { text: 'Expired', isExpired: true, isExpiringSoon: false, minutes: 0 }
    }

    const totalMinutes = Math.floor(diff / (1000 * 60))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60

    let text = ''
    if (days > 0) {
      text += `${days}d `
    }
    if (hours > 0 || days > 0) {
      text += `${hours}h `
    }
    text += `${minutes}m remaining`

    const isExpiringSoon = days < 3 && days >= 0

    return {
      text: text.trim(),
      isExpired: false,
      isExpiringSoon,
      minutes: totalMinutes,
    }
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    const statusLower = status.toLowerCase()

    if (isExpired || statusLower === 'expired') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <XCircleIcon className="h-3 w-3 mr-1.5" />
          Expired
        </span>
      )
    }

    if (statusLower === 'revoked') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          <XCircleIcon className="h-3 w-3 mr-1.5" />
          Revoked
        </span>
      )
    }

    if (statusLower === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <ClockIcon className="h-3 w-3 mr-1.5" />
          Pending
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        <CheckCircleIconSolid className="h-3 w-3 mr-1.5" />
        Active
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Free'
    return `$${(price / 100).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 sm:h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Access Keys</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and access your granted permissions</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {keys.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 mb-4">
              <BuildingStorefrontIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              You don't have any access keys yet.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              You don't have any access keys. Browse available products to request access.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/products')}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium min-h-[44px]"
              >
                Browse Available Products
              </button>
              <button
                onClick={() => router.push('/offers')}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium min-h-[44px]"
              >
                Explore Offers
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {keys.map((key, index) => {
            const timeInfo = getTimeRemaining(key.expires_at)
            const productName = key.product?.name || `Product ${key.product_id}`
            const merchantName = key.merchant_name || 'Unknown Merchant'
            const isActive = key.status === 'active' && !timeInfo.isExpired
            const price = key.price || key.product?.price
            const hasAccessStarted = key.access_starts_at
              ? new Date(key.access_starts_at) <= new Date()
              : true

            return (
              <div
                key={key.key || index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  {/* Header with Product Name */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {productName}
                    </h3>
                    {key.product?.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {key.product.description}
                      </p>
                    )}
                  </div>

                  {/* Merchant/App Info */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{merchantName}</span>
                  </div>

                  {/* Price */}
                  {price !== undefined && (
                    <div className="flex items-center text-sm text-gray-700 mb-4">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{formatPrice(price)}</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mb-4">{getStatusBadge(key.status, timeInfo.isExpired)}</div>

                  {/* Access Validity */}
                  <div
                    className={`flex items-center text-sm mb-2 ${
                      timeInfo.isExpiringSoon && !timeInfo.isExpired
                        ? 'text-amber-600'
                        : timeInfo.isExpired
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      {timeInfo.isExpired ? 'Expired' : timeInfo.text}
                    </span>
                  </div>

                  {/* Expiration Date */}
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                    <span>Expires: {formatDate(key.expires_at)}</span>
                  </div>

                  {/* Additional Info Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {key.auto_expire !== false && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Auto-expire
                      </span>
                    )}
                    {key.subscription_required && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <TagIcon className="h-3 w-3 mr-1" />
                        Subscription Required
                      </span>
                    )}
                    {key.bundle_info && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        <SparklesIcon className="h-3 w-3 mr-1" />
                        {key.bundle_info}
                      </span>
                    )}
                    {!hasAccessStarted && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Starts {formatDate(key.access_starts_at!)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {isActive && hasAccessStarted && key.product?.redirect_url && (
                      <button
                        onClick={() => handleOpenProduct(key)}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm min-h-[44px]"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                        Go to App
                      </button>
                    )}
                    
                    {timeInfo.isExpired && (
                      <button
                        onClick={() => handleRenew(key)}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm min-h-[44px]"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Renew Access
                      </button>
                    )}

                    {!hasAccessStarted && (
                      <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg min-h-[44px]">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>Awaiting activation</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
