'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  BuildingStorefrontIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  TagIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  access_duration_hours: number
  access_duration_minutes?: number | null
  access_expiry_type?: string
  product_url?: string | null
  redirect_url?: string | null
  bundle_id?: string | null
  is_active: boolean
  hasAccess?: boolean // Whether user already has access to this product
  merchant?: {
    id: number
    organization_name: string
    website: string | null
  }
  // Extended fields (from localStorage or future API)
  access_type?: 'duration' | 'fixed_expiry'
  fixed_expiry?: string
  auto_grant_on_login?: boolean
  subscription_required?: boolean
  bundled_products?: number[]
  available_from?: string
  available_to?: string
  category?: string
}

interface AccessKey {
  product_id: number
}

export default function OffersPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [userKeys, setUserKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      
      // Load user's existing keys to filter out products they already have
      try {
        const keysResponse = await api.get('/access/keys')
        const keys = keysResponse.data.data?.keys || []
        setUserKeys(keys.map((k: any) => ({ product_id: k.product_id })))
      } catch (keysErr) {
        console.error('Failed to load user keys:', keysErr)
        // Continue even if keys fail to load
      }

      // Load all public products
      const response = await api.get('/auth/products/public')
      let productsList = response.data.data?.products || []
      
      // Enhance products with additional data from localStorage (until backend supports it)
      if (typeof window !== 'undefined') {
        productsList = productsList.map((product: Product) => {
          const stored = localStorage.getItem(`product_${product.id}_advanced`)
          if (stored) {
            try {
              const advanced = JSON.parse(stored)
              return { ...product, ...advanced }
            } catch (e) {
              // Ignore parse errors
            }
          }
          return product
        })
      }
      
      // Mark products user already has access to (but don't filter them out - show them with "Already Have Access" badge)
      const userProductIds = new Set(userKeys.map(k => k.product_id))
      productsList = productsList.map((p: Product) => ({
        ...p,
        hasAccess: userProductIds.has(p.id)
      }))
      
      setProducts(productsList)
    } catch (err: any) {
      console.error('Failed to load offers:', err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.')
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Unable to connect to the server. Please ensure the backend is running.')
        // Use mocked data as fallback when network fails
        setProducts(getMockedProducts())
      } else if (err.response?.status === 404) {
        setError(`Endpoint not found: ${err.config?.url}. Please check if the backend service is running.`)
        // Use mocked data as fallback
        setProducts(getMockedProducts())
      } else {
        setError(`Failed to load offers: ${errorMessage || 'Unknown error'}`)
        // Use mocked data as fallback
        setProducts(getMockedProducts())
      }
    } finally {
      setLoading(false)
    }
  }

  const getMockedProducts = (): Product[] => {
    return [
      {
        id: 999,
        name: 'Pro Dev Tools (Trial)',
        description: 'Try StudioFlow for 2 hours with limited API access',
        price: 0,
        access_duration_hours: 2,
        redirect_url: 'https://example.com',
        is_active: true,
        merchant: {
          id: 1,
          organization_name: 'StudioFlow',
          website: 'https://studioflow.com',
        },
        auto_grant_on_login: true,
        subscription_required: true,
        category: 'Development',
      },
      {
        id: 998,
        name: 'Premium Analytics Suite',
        description: 'Advanced analytics dashboard with real-time insights',
        price: 1000,
        access_duration_hours: 720,
        redirect_url: 'https://example.com',
        is_active: true,
        merchant: {
          id: 2,
          organization_name: 'DataViz Pro',
          website: 'https://dataviz.com',
        },
        subscription_required: false,
        category: 'Analytics',
      },
    ]
  }

  const handleClaim = async (product: Product) => {
    if (product.subscription_required) {
      alert('This product requires a subscription. Please contact the merchant.')
      return
    }

    try {
      // Placeholder: Request access key
      alert(`Requesting access to ${product.name}... This feature will be implemented soon.`)
      // Future: await api.post('/access/request', { product_id: product.id })
    } catch (err: any) {
      console.error('Failed to claim product:', err)
      alert('Failed to request access. Please try again.')
    }
  }

  const handleRequestAccess = (product: Product) => {
    alert(`Requesting access to ${product.name}... This feature will be implemented soon.`)
    // Future: Navigate to request page or show modal
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours}h`
    if (hours < 720) return `${Math.floor(hours / 24)}d`
    if (hours < 8760) return `${Math.floor(hours / 720)}mo`
    return `${Math.floor(hours / 8760)}y`
  }

  const formatExpiry = (expiry: string) => {
    const date = new Date(expiry)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return `$${(price / 100).toFixed(2)}`
  }

  const isAvailable = (product: Product) => {
    const now = new Date()
    if (product.available_from) {
      const from = new Date(product.available_from)
      if (now < from) return false
    }
    if (product.available_to) {
      const to = new Date(product.available_to)
      if (now > to) return false
    }
    return true
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'Other').filter(Boolean)))]

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(p => (p.category || 'Other') === selectedCategory)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 sm:h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Offers</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Discover products and services available through Firaye. Claim trials or request access to get started.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
        <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs sm:text-sm text-blue-800">
          <p className="font-medium mb-1">Marketplace</p>
          <p>Browse available products below. Products you already have access to are shown in "My Products".</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 mb-4">
              <BuildingStorefrontIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              No offers available
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {products.length === 0
                ? 'There are no products available at the moment. Check back later or contact merchants directly.'
                : 'No products found in this category. Try selecting a different category.'}
            </p>
            <button
              onClick={() => router.push('/products')}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium min-h-[44px]"
            >
              View My Products
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'offer' : 'offers'}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const available = isAvailable(product)
              const durationText =
                product.access_type === 'fixed_expiry' && product.fixed_expiry
                  ? `Expires ${formatExpiry(product.fixed_expiry)}`
                  : `${formatDuration(product.access_duration_hours)}`

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Visual Header with Gradient */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      {product.auto_grant_on_login && (
                        <div className="ml-2 flex-shrink-0">
                          <StarIcon className="h-6 w-6 text-yellow-500" />
                        </div>
                      )}
                    </div>

                    {/* Merchant Badge */}
                    {product.merchant && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                          <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm font-medium text-gray-700">
                            {product.merchant.organization_name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Category Tag */}
                    {product.category && (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {product.category}
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-6">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-700">{durationText}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.auto_grant_on_login && (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          <SparklesIcon className="h-3 w-3 mr-1.5" />
                          Trial Enabled
                        </span>
                      )}
                      {product.subscription_required && (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                          Subscription Required
                        </span>
                      )}
                      {product.bundled_products && product.bundled_products.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <TagIcon className="h-3 w-3 mr-1.5" />
                          Bundled
                        </span>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      {product.hasAccess ? (
                        <div className="w-full flex items-center justify-center px-4 py-3 bg-green-50 border-2 border-green-200 text-green-800 rounded-lg font-semibold text-sm min-h-[44px]">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          You Have Access
                        </div>
                      ) : available && product.auto_grant_on_login ? (
                        <button
                          onClick={() => handleClaim(product)}
                          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:from-primary-dark hover:to-primary transition-all font-semibold text-sm shadow-md hover:shadow-lg min-h-[44px]"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                          Claim Trial
                        </button>
                      ) : available && !product.auto_grant_on_login ? (
                        <button
                          onClick={() => handleRequestAccess(product)}
                          className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-sm shadow-md hover:shadow-lg min-h-[44px]"
                        >
                          <EnvelopeIcon className="h-5 w-5 mr-2" />
                          Request Access
                        </button>
                      ) : null}
                      {product.merchant?.website && (
                        <button
                          onClick={() => window.open(product.merchant!.website!, '_blank')}
                          className="w-full flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-primary hover:text-primary transition-colors font-medium text-sm min-h-[44px]"
                        >
                          <AcademicCapIcon className="h-4 w-4 mr-2" />
                          Learn More
                        </button>
                      )}
                      {!available && !product.hasAccess && (
                        <div className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg">
                          {product.available_from && new Date(product.available_from) > new Date() && (
                            <span>Available from {formatExpiry(product.available_from)}</span>
                          )}
                          {product.available_to && new Date(product.available_to) < new Date() && (
                            <span>No longer available</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
