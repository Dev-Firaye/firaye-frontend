'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { TrashIcon, PlusIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface AccessKey {
  id: number
  key: string
  product_id: number
  product_name?: string
  user_id: number | null
  status: string
  expires_at: string | null
  created_at: string
  label?: string | null
  scopes?: string | null
  reusable: boolean
  max_uses?: number | null
  uses_count: number
}

interface Product {
  id: number
  name: string
  description: string | null
}

export default function KeysPage() {
  const [keys, setKeys] = useState<AccessKey[]>([])
  const [filteredKeys, setFilteredKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reusableFilter, setReusableFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const response = await api.get('/access/admin/keys')
      const loadedKeys = response.data.data?.keys || []
      setKeys(loadedKeys)
      setFilteredKeys(loadedKeys)
    } catch (error) {
      console.error('Failed to load keys:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...keys]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(key => 
        key.key.toLowerCase().includes(query) ||
        key.label?.toLowerCase().includes(query) ||
        key.product_name?.toLowerCase().includes(query) ||
        key.scopes?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(key => {
        if (statusFilter === 'expired') {
          if (key.expires_at) {
            return new Date(key.expires_at) < new Date() || key.status === 'expired'
          }
          return key.status === 'expired'
        }
        if (statusFilter === 'active') {
          if (key.expires_at) {
            return new Date(key.expires_at) >= new Date() && key.status === 'active'
          }
          return key.status === 'active'
        }
        if (statusFilter === 'revoked') {
          return key.status === 'revoked'
        }
        return true
      })
    }

    // Reusable filter
    if (reusableFilter !== 'all') {
      filtered = filtered.filter(key => 
        reusableFilter === 'reusable' ? key.reusable : !key.reusable
      )
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(key => 
        userFilter === 'bound' ? key.user_id !== null : key.user_id === null
      )
    }

    setFilteredKeys(filtered)
  }, [keys, searchQuery, statusFilter, reusableFilter, userFilter])

  const handleRevoke = async (key: string) => {
    if (!confirm('Are you sure you want to revoke this key?')) return

    try {
      await api.delete(`/access/keys/${key}`)
      loadKeys()
    } catch (error) {
      alert('Failed to revoke key')
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-1/2 sm:w-1/4"></div>
          <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Access Keys</h1>
        <button
          onClick={() => setShowGenerateKeyModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Generate Key
        </button>
      </div>

      {showGenerateKeyModal && (
        <GenerateKeyModal
          onClose={() => setShowGenerateKeyModal(false)}
          onSuccess={() => {
            setShowGenerateKeyModal(false)
            loadKeys()
          }}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys, labels, products..."
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
          <select
            value={reusableFilter}
            onChange={(e) => setReusableFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="reusable">Reusable</option>
            <option value="single-use">Single-use</option>
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="all">All Keys</option>
            <option value="bound">Bound to User</option>
            <option value="unbound">Unbound</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Key / Label
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Properties
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Expires
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-4 text-center text-gray-500">
                  {keys.length === 0 ? 'No keys found.' : 'No keys match your filters.'}
                </td>
              </tr>
            ) : (
              filteredKeys.map((key) => {
                const isExpired = key.expires_at ? new Date(key.expires_at) < new Date() : false
                const displayStatus = isExpired && key.status === 'active' ? 'expired' : key.status
                return (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <code className="text-xs sm:text-sm font-mono text-gray-900 break-all block">
                          {key.key.substring(0, 20)}...
                        </code>
                        {key.label && (
                          <span className="text-xs text-gray-500 mt-1 block">{key.label}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                      {key.product_name || `Product ${key.product_id}`}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {key.reusable ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Reusable
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Single-use
                          </span>
                        )}
                        {key.user_id ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Bound
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unbound
                          </span>
                        )}
                        {key.reusable && key.max_uses && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {key.uses_count || 0}/{key.max_uses} uses
                          </span>
                        )}
                        {key.scopes && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800" title={key.scopes}>
                            {key.scopes.split(',').length} scope{key.scopes.split(',').length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          displayStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : displayStatus === 'revoked'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500">
                      {key.expires_at ? new Date(key.expires_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevoke(key.key)}
                        className="text-red-600 hover:text-red-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Revoke"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

function GenerateKeyModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('')
  const [label, setLabel] = useState('')
  const [expiryMinutes, setExpiryMinutes] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [reusable, setReusable] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [scopes, setScopes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await api.get('/auth/products')
      setProducts(response.data.data?.products || [])
    } catch (err) {
      console.error('Failed to load products:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!selectedProductId) {
      setError('Please select a product')
      return
    }

    setLoading(true)

    try {
      const payload: any = {
        product_id: selectedProductId,
        reusable: reusable,
      }
      
      if (label) {
        payload.label = label
      }
      
      if (expiryMinutes) {
        payload.expiry_minutes = parseInt(expiryMinutes)
      }
      
      if (reusable && maxUses) {
        payload.max_uses = parseInt(maxUses)
      }
      
      // Advanced fields
      if (userEmail) {
        payload.user_email = userEmail
      }
      
      if (scopes) {
        payload.scopes = scopes
      }

      const response = await api.post('/access/keys', payload)
      setCreatedKey(response.data.data.key)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to create key')
    } finally {
      setLoading(false)
    }
  }

  if (createdKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Created Successfully</h2>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">Access Key:</p>
            <code className="text-sm font-mono break-all bg-white p-2 rounded block">{createdKey}</code>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Copy this key and share it with the user. This key will be shown only once.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Access Key</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product <span className="text-red-500">*</span>
            </label>
            {loadingProducts ? (
              <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading products...
              </div>
            ) : (
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            )}
            {products.length === 0 && !loadingProducts && (
              <p className="mt-1 text-xs text-red-500">
                No products found. Create a product first.
              </p>
            )}
          </div>

          {/* Key Settings Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Key Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., Marketing Campaign, Beta Access"
                  maxLength={255}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional label for tagging and organizing keys.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={expiryMinutes}
                  onChange={(e) => setExpiryMinutes(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Leave empty for permanent key"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional. Leave empty to create a key that never expires.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  disabled={!reusable}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Leave empty for unlimited"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of uses. Only applies to reusable keys. Leave empty for unlimited.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reusable"
                  checked={reusable}
                  onChange={(e) => {
                    setReusable(e.target.checked)
                    if (!e.target.checked) {
                      setMaxUses('')
                    }
                  }}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="reusable" className="ml-2 block text-sm text-gray-700">
                  Reusable
                </label>
              </div>
              <p className="text-xs text-gray-500 -mt-2">
                Allow this key to be used multiple times. If unchecked, key is single-use.
              </p>
            </div>
          </div>

          {/* Advanced Section */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-4"
            >
              <span>Advanced (optional)</span>
              <span>{showAdvanced ? '−' : '+'}</span>
            </button>
            {showAdvanced && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="user@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional. If set, key will be assigned to this user on creation. Leave empty for unbound key.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Scopes
                  </label>
                  <input
                    type="text"
                    value={scopes}
                    onChange={(e) => setScopes(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="e.g., read,write,admin"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Comma-separated list of scopes (e.g., read, write, admin).
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
              disabled={loading || loadingProducts || !selectedProductId}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Generate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

