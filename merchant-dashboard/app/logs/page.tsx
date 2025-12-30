'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  PlusIcon,
  XCircleIcon,
  ClockIcon,
  KeyIcon,
  CubeIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface ActivityLog {
  id: string | number
  action: string
  timestamp: string
  product: {
    id: number
    name: string
  } | null
  user: {
    id: number
    email: string
  } | null
  key_id: number | null
  status: string | null
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 50

  useEffect(() => {
    loadLogs()
  }, [page])

  const loadLogs = async () => {
    try {
      setError(null)
      const skip = (page - 1) * limit
      const response = await api.get(`/access/logs?limit=${limit}&skip=${skip}`)
      const newLogs = response.data.data?.logs || []
      setLogs(newLogs)
      setHasMore(newLogs.length === limit)
    } catch (err: any) {
      console.error('Failed to load logs:', err)
      setError(err.response?.data?.error?.message || 'Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionIcon = (action: string) => {
    if (action.includes('Created')) {
      return <PlusIcon className="h-5 w-5 text-green-500" />
    } else if (action.includes('Revoked')) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />
    } else if (action.includes('Expired')) {
      return <ClockIcon className="h-5 w-5 text-amber-500" />
    } else if (action.includes('Product')) {
      return <CubeIcon className="h-5 w-5 text-blue-500" />
    }
    return <KeyIcon className="h-5 w-5 text-gray-500" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'text-green-700 bg-green-50 border-green-200'
    if (action.includes('Revoked')) return 'text-red-700 bg-red-50 border-red-200'
    if (action.includes('Expired')) return 'text-amber-700 bg-amber-50 border-amber-200'
    if (action.includes('Product')) return 'text-blue-700 bg-blue-50 border-blue-200'
    return 'text-gray-700 bg-gray-50 border-gray-200'
  }

  if (loading && logs.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
        <p className="text-sm sm:text-base text-gray-600">View all activity related to your products and keys</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {logs.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity logs</h3>
          <p className="text-gray-600">
            Activity logs will appear here once you start creating products and keys.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.product ? log.product.name : '-'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.user ? log.user.email : '-'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 min-h-[44px]"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
