'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  access_duration_hours: number
  redirect_url: string | null
}

interface AccessKey {
  id: number
  key: string
  user_id: number
  status: string
  expires_at: string
  created_at: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  const [product, setProduct] = useState<Product | null>(null)
  const [keys, setKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false)

  useEffect(() => {
    loadProduct()
    loadKeys()
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await api.get(`/auth/products/${productId}`)
      setProduct(response.data.data?.product)
    } catch (error) {
      console.error('Failed to load product:', error)
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const loadKeys = async () => {
    try {
      // Note: We'll need to filter keys by product_id from admin endpoint
      const response = await api.get('/access/admin/keys')
      const allKeys = response.data.data?.keys || []
      // Filter by product_id (this is a placeholder until backend supports filtering)
      setKeys(allKeys)
    } catch (error) {
      console.error('Failed to load keys:', error)
    }
  }

  const handleRevokeKey = async (key: string) => {
    if (!confirm('Are you sure you want to revoke this key?')) return

    try {
      await api.delete(`/access/keys/${key}`)
      loadKeys()
    } catch (error) {
      alert('Failed to revoke key')
    }
  }

  if (loading || !product) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/products')}
        className="text-primary hover:text-primary-dark mb-4"
      >
        ← Back to Products
      </button>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          {product.description && (
            <p className="text-gray-600 mt-2">{product.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowCreateKeyModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate Key
        </button>
      </div>

      {showCreateKeyModal && (
        <CreateKeyModal
          productId={product.id}
          onClose={() => setShowCreateKeyModal(false)}
          onSuccess={() => {
            setShowCreateKeyModal(false)
            loadKeys()
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Access Keys</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Expires
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No keys generated yet.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono text-gray-900">
                      {key.key.substring(0, 20)}...
                    </code>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(key.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRevokeKey(key.key)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CreateKeyModal({
  productId,
  onClose,
  onSuccess,
}: {
  productId: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/access/keys', {
        product_id: productId,
        user_email: userEmail,
      })
      setCreatedKey(response.data.data.key)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create key')
    } finally {
      setLoading(false)
    }
  }

  if (createdKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Created</h2>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="text-sm text-gray-600 mb-2">Access Key:</p>
            <code className="text-sm font-mono break-all">{createdKey}</code>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              User Email
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="user@example.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              The user must have an account with this email.
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
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
              {loading ? 'Creating...' : 'Generate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

