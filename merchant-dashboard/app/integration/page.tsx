'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'

export default function IntegrationPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [testKey, setTestKey] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testError, setTestError] = useState<string | null>(null)

  useEffect(() => {
    loadApiKey()
  }, [])

  const loadApiKey = async () => {
    try {
      const response = await api.get('/auth/merchant/api-key')
      setApiKey(response.data.data?.api_key || '')
    } catch (error) {
      console.error('Failed to load API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTestKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testKey.trim()) return

    setTestLoading(true)
    setTestError(null)
    setTestResult(null)

    try {
      const response = await api.post(
        '/access/validate-key',
        { key: testKey },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      setTestResult(response.data.data)
    } catch (err: any) {
      setTestError(
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to validate key'
      )
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
        App Integration
      </h1>

      {/* Merchant API Key Display */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🔐</span>
          Merchant API Key
        </h2>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 min-h-[48px]"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Use this key to authorize API requests from your app to Firaye.
            </p>
          </>
        )}
      </div>

      {/* Integration Instructions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between text-xl font-semibold text-gray-900 mb-4"
        >
          <span className="flex items-center">
            <span className="mr-2">📦</span>
            Integration Instructions
          </span>
          {showInstructions ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>

        {showInstructions && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Sample POST Request:
              </h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-xs sm:text-sm">
                  <code>{`POST https://api.firaye.com/access/validate-key
Headers:
  Authorization: Bearer <your_merchant_api_key>
Body:
  {
    "key": "user_key_here"
  }`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Key Points:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Use this to validate whether a user has a valid key</li>
                <li>Run this check when your user logs in or opens the gated feature</li>
                <li>You can revoke keys anytime via the dashboard</li>
                <li>All key creation, expiry, and logs are managed by Firaye</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Key Tester */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🧪</span>
          Interactive Key Tester (Live Validator)
        </h2>

        <form onSubmit={handleTestKey} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter a customer access key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="Enter access key to test"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                disabled={testLoading}
              />
              <button
                type="submit"
                disabled={testLoading || !testKey.trim() || !apiKey}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testLoading ? 'Validating...' : 'Validate'}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              ⚠️ This is for testing only. Do not use this as your primary validation flow.
            </p>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="mt-4 p-4 rounded-md border-2 border-green-200 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <CheckIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">
                  {testResult.is_valid ? '✅ Valid' : '❌ Invalid'}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                {testResult.product && (
                  <div>
                    <span className="font-medium text-gray-700">Product: </span>
                    <span className="text-gray-900">{testResult.product.name}</span>
                  </div>
                )}
                {testResult.expires_at && (
                  <div>
                    <span className="font-medium text-gray-700">Expires: </span>
                    <span className="text-gray-900">
                      {new Date(testResult.expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {!testResult.expires_at && (
                  <div>
                    <span className="font-medium text-gray-700">Expires: </span>
                    <span className="text-gray-900">Never</span>
                  </div>
                )}
                {testResult.user_email && (
                  <div>
                    <span className="font-medium text-gray-700">User Email: </span>
                    <span className="text-gray-900">{testResult.user_email}</span>
                  </div>
                )}
                {testResult.status && (
                  <div>
                    <span className="font-medium text-gray-700">Status: </span>
                    <span className="text-gray-900">{testResult.status}</span>
                  </div>
                )}
                {testResult.message && (
                  <div>
                    <span className="font-medium text-gray-700">Message: </span>
                    <span className="text-gray-900">{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {testError && (
            <div className="mt-4 p-4 rounded-md border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Error</h3>
              </div>
              <p className="text-sm text-red-800">{testError}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

