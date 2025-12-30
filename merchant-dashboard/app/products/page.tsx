'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  access_duration_hours: number
  redirect_url: string | null
  is_active: boolean
  created_at: string
  // New fields (will be stored in frontend state for now)
  access_type?: 'duration' | 'fixed_expiry'
  fixed_expiry?: string
  max_activations?: number
  visible_to_all?: boolean
  bundled_products?: number[]
  available_from?: string
  available_to?: string
  webhook_url?: string
  subscription_required?: boolean
  auto_grant_on_login?: boolean
  metadata?: string
}

function ProductsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    loadProducts()
    // Check if we should open create modal from query param
    if (searchParams.get('action') === 'create') {
      setShowCreateModal(true)
    }
  }, [searchParams])

  const loadProducts = async () => {
    try {
      const response = await api.get('/auth/products')
      const productsList = response.data.data?.products || []
      
      // Load advanced fields from localStorage for each product
      const productsWithAdvanced = productsList.map((product: Product) => {
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
      
      setProducts(productsWithAdvanced)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await api.delete(`/auth/products/${id}`)
      loadProducts()
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowCreateModal(true)
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours}h`
    if (hours < 720) return `${Math.floor(hours / 24)}d`
    if (hours < 8760) return `${Math.floor(hours / 720)}mo`
    return `${Math.floor(hours / 8760)}y`
  }

  const formatExpiry = (expiry: string | undefined) => {
    if (!expiry) return '-'
    const date = new Date(expiry)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product offerings and access configurations</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setShowCreateModal(true)
          }}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors min-h-[44px] w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span className="sm:inline">Create Product</span>
        </button>
      </div>

      {(showCreateModal || editingProduct) && (
        <CreateProductModal
          product={editingProduct}
          onClose={() => {
            setShowCreateModal(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setEditingProduct(null)
            loadProducts()
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration / Expiry
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No products yet. Create your first product to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.auto_grant_on_login && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <SparklesIcon className="h-3 w-3 mr-1" />
                            Trial
                          </span>
                        )}
                      </div>
                      {product.bundled_products && product.bundled_products.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.bundled_products.map((bundledId) => {
                            const bundled = products.find((p) => p.id === bundledId)
                            return bundled ? (
                              <span
                                key={bundledId}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {bundled.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {product.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(product.price / 100).toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.access_type === 'fixed_expiry' && product.fixed_expiry
                        ? formatExpiry(product.fixed_expiry)
                        : formatDuration(product.access_duration_hours)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {product.visible_to_all !== false ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          <GlobeAltIcon className="h-3 w-3 mr-1" />
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          <LockClosedIcon className="h-3 w-3 mr-1" />
                          Private
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.subscription_required
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.subscription_required ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:text-primary-dark min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CreateProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product?: Product | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!product
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product ? (product.price / 100).toFixed(2) : '',
    access_type: (product?.access_type || 'duration') as 'duration' | 'fixed_expiry',
    access_duration_hours: product?.access_duration_hours?.toString() || '720',
    fixed_expiry: product?.fixed_expiry
      ? new Date(product.fixed_expiry).toISOString().slice(0, 16)
      : '',
    max_activations: product?.max_activations?.toString() || '',
    visible_to_all: product?.visible_to_all !== false,
    bundled_products: product?.bundled_products || [],
    available_from: product?.available_from
      ? new Date(product.available_from).toISOString().slice(0, 16)
      : '',
    available_to: product?.available_to
      ? new Date(product.available_to).toISOString().slice(0, 16)
      : '',
    webhook_url: product?.webhook_url || '',
    subscription_required: product?.subscription_required || false,
    auto_grant_on_login: product?.auto_grant_on_login || false,
    redirect_url: product?.redirect_url || '',
    metadata: product?.metadata
      ? typeof product.metadata === 'string'
        ? product.metadata
        : JSON.stringify(product.metadata, null, 2)
      : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    // Load all products for bundled products selection
    api
      .get('/auth/products')
      .then((res) => {
        setAllProducts(res.data.data?.products || [])
      })
      .catch(() => {
        // Ignore errors
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Parse duration from string like "4h", "2d", etc.
      let durationHours = parseInt(formData.access_duration_hours)
      if (formData.access_type === 'duration') {
        const durationStr = formData.access_duration_hours.toLowerCase().trim()
        if (durationStr.includes('h')) {
          durationHours = parseInt(durationStr.replace('h', ''))
        } else if (durationStr.includes('d')) {
          durationHours = parseInt(durationStr.replace('d', '')) * 24
        } else if (durationStr.includes('w')) {
          durationHours = parseInt(durationStr.replace('w', '')) * 168
        } else if (durationStr.includes('mo')) {
          durationHours = parseInt(durationStr.replace('mo', '')) * 720
        } else {
          durationHours = parseInt(durationStr) || 720
        }
      }

      // Prepare payload (only send fields that backend supports for now)
      const payload: any = {
        name: formData.name,
        description: formData.description || null,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        access_duration_hours: durationHours,
        redirect_url: formData.redirect_url || null,
        is_active: true, // Default to active
      }

      // Store advanced fields in localStorage for now (until backend supports them)
      const advancedData = {
        access_type: formData.access_type,
        fixed_expiry: formData.fixed_expiry || null,
        max_activations: formData.max_activations ? parseInt(formData.max_activations) : null,
        visible_to_all: formData.visible_to_all,
        bundled_products: formData.bundled_products,
        available_from: formData.available_from || null,
        available_to: formData.available_to || null,
        webhook_url: formData.webhook_url || null,
        subscription_required: formData.subscription_required,
        auto_grant_on_login: formData.auto_grant_on_login,
        metadata: formData.metadata || null,
      }

      if (isEditing && product) {
        await api.put(`/auth/products/${product.id}`, payload)
        // Store advanced data in localStorage
        localStorage.setItem(`product_${product.id}_advanced`, JSON.stringify(advancedData))
      } else {
        const response = await api.post('/auth/products', payload)
        const newProductId = response.data.data?.product?.id
        if (newProductId) {
          localStorage.setItem(`product_${newProductId}_advanced`, JSON.stringify(advancedData))
        }
      }

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const toggleBundledProduct = (productId: number) => {
    const current = formData.bundled_products || []
    if (current.includes(productId)) {
      setFormData({
        ...formData,
        bundled_products: current.filter((id) => id !== productId),
      })
    } else {
      setFormData({
        ...formData,
        bundled_products: [...current, productId],
      })
    }
  }

  // Load advanced data from localStorage if editing
  useEffect(() => {
    if (isEditing && product) {
      const stored = localStorage.getItem(`product_${product.id}_advanced`)
      if (stored) {
        try {
          const advanced = JSON.parse(stored)
          setFormData((prev) => ({
            ...prev,
            ...advanced,
            fixed_expiry: advanced.fixed_expiry
              ? new Date(advanced.fixed_expiry).toISOString().slice(0, 16)
              : '',
            available_from: advanced.available_from
              ? new Date(advanced.available_from).toISOString().slice(0, 16)
              : '',
            available_to: advanced.available_to
              ? new Date(advanced.available_to).toISOString().slice(0, 16)
              : '',
          }))
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [isEditing, product])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {isEditing ? 'Edit Product' : 'Create Product'}
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="e.g., sub-10-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="e.g., use-me-for-20-mins"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Access Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.access_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    access_type: e.target.value as 'duration' | 'fixed_expiry',
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="duration">Duration</option>
                <option value="fixed_expiry">Fixed Expiry</option>
              </select>
            </div>

            {formData.access_type === 'duration' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.access_duration_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, access_duration_hours: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., 4h, 2d, 1w, 1mo"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: 4h (hours), 2d (days), 1w (weeks), 1mo (months)
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fixed Expiry DateTime <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.fixed_expiry}
                  onChange={(e) => setFormData({ ...formData, fixed_expiry: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="visible_to_all"
                checked={formData.visible_to_all}
                onChange={(e) => setFormData({ ...formData, visible_to_all: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="visible_to_all" className="ml-2 block text-sm text-gray-700">
                Visible to All
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscription_required"
                checked={formData.subscription_required}
                onChange={(e) =>
                  setFormData({ ...formData, subscription_required: e.target.checked })
                }
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="subscription_required" className="ml-2 block text-sm text-gray-700">
                Subscription Required
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={true}
                readOnly
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Status: Active
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Redirect URL (optional)
            </label>
            <input
              type="url"
              value={formData.redirect_url}
              onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Advanced Settings Collapsible */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>Advanced Settings</span>
              {showAdvanced ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Activations
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_activations}
                    onChange={(e) => setFormData({ ...formData, max_activations: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="How many times a key can be used"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bundled Products
                  </label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {allProducts
                      .filter((p) => !isEditing || p.id !== product?.id)
                      .map((p) => (
                        <label key={p.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.bundled_products?.includes(p.id) || false}
                            onChange={() => toggleBundledProduct(p.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{p.name}</span>
                        </label>
                      ))}
                    {allProducts.filter((p) => !isEditing || p.id !== product?.id).length === 0 && (
                      <p className="text-sm text-gray-500">No other products available</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Available From
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.available_from}
                      onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Available To</label>
                    <input
                      type="datetime-local"
                      value={formData.available_to}
                      onChange={(e) => setFormData({ ...formData, available_to: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
                  <input
                    type="url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="https://your-domain.com/webhook"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_grant_on_login"
                    checked={formData.auto_grant_on_login}
                    onChange={(e) =>
                      setFormData({ ...formData, auto_grant_on_login: e.target.checked })
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="auto_grant_on_login" className="ml-2 block text-sm text-gray-700">
                    Auto-grant on Login (Trial-like behavior)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Metadata (JSON)
                  </label>
                  <textarea
                    value={formData.metadata}
                    onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary font-mono text-xs"
                    placeholder='{"custom_field": "value"}'
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional merchant-defined custom configuration (JSON format)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  )
}
