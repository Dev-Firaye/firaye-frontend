'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { TrashIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface AccessKey {
  id: number
  key: string
  product_id: number
  user_id: number
  status: string
  expires_at: string
  created_at: string
}

interface Product {
  id: number
  name: string
  description: string | null
}

export default function KeysPage() {
  const [keys, setKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const response = await api.get('/access/admin/keys')
      setKeys(response.data.data?.keys || [])
    } catch (error) {
      console.error('Failed to load keys:', error)
    } finally {
      setLoading(false)
    }
  }

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Key
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product ID
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
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-gray-500">
                  No keys found.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <code className="text-xs sm:text-sm font-mono text-gray-900 break-all">
                      {key.key.substring(0, 20)}...
                    </code>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{key.product_id}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        key.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : key.status === 'revoked'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {key.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500">
                    {new Date(key.expires_at).toLocaleString()}
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
              ))
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
  const [userEmail, setUserEmail] = useState('')
  const [expiryMinutes, setExpiryMinutes] = useState('')
  const [maxUses, setMaxUses] = useState('')
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
        user_email: userEmail,
      }
      
      if (expiryMinutes) {
        payload.expiry_minutes = parseInt(expiryMinutes)
      }
      
      if (maxUses) {
        payload.max_uses = parseInt(maxUses)
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="user@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              The user must have an account with this email.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Custom Expiry (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Leave empty to use product default"
            />
            <p className="mt-1 text-xs text-gray-500">
              Override product's default duration. Leave empty to use product setting.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Uses (for reusable keys)
            </label>
            <input
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Leave empty for unlimited"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum number of times this key can be used. Only for reusable keys.
            </p>
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

