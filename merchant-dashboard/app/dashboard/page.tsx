'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  KeyIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
  UserGroupIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

interface DashboardStats {
  total_keys: number
  active_keys: number
  expired_keys: number
  revoked_keys: number
  total_products: number
  active_products: number
  keys_by_product: Array<{
    product_id: number
    product_name: string
    total: number
    active: number
    expired: number
    revoked: number
  }>
  status_breakdown: {
    active: number
    expired: number
    revoked: number
  }
}

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

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)
      
      // Load summary statistics
      try {
        const summaryRes = await api.get('/access/summary')
        console.log('Summary response:', summaryRes.data)
        if (summaryRes.data && summaryRes.data.data) {
          setStats(summaryRes.data.data)
        } else {
          console.error('Unexpected summary response structure:', summaryRes.data)
          throw new Error('Invalid response structure')
        }
      } catch (summaryErr: any) {
        console.error('Failed to load summary:', summaryErr)
        console.error('Error details:', {
          message: summaryErr.message,
          response: summaryErr.response?.data,
          status: summaryErr.response?.status,
        })
        // If summary fails, set default values
        setStats({
          total_keys: 0,
          active_keys: 0,
          expired_keys: 0,
          revoked_keys: 0,
          total_products: 0,
          active_products: 0,
          keys_by_product: [],
          status_breakdown: {
            active: 0,
            expired: 0,
            revoked: 0,
          },
        })
        setError(
          summaryErr.response?.data?.error?.message ||
            summaryErr.response?.data?.message ||
            summaryErr.message ||
            'Failed to load dashboard statistics. Please refresh the page.'
        )
      }
      
      // Load activity logs (non-blocking)
      try {
        const logsRes = await api.get('/access/logs?limit=20')
        setLogs(logsRes.data.data?.logs || [])
      } catch (logsErr: any) {
        console.error('Failed to load logs:', logsErr)
        // Logs failure is non-critical, just log it
        setLogs([])
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setLogsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getActionIcon = (action: string) => {
    if (action.includes('Created')) {
      return <PlusIcon className="h-5 w-5 text-green-500" />
    } else if (action.includes('Revoked')) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />
    } else if (action.includes('Expired')) {
      return <ClockIcon className="h-5 w-5 text-amber-500" />
    }
    return <KeyIcon className="h-5 w-5 text-gray-500" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'text-green-700 bg-green-50 border-green-200'
    if (action.includes('Revoked')) return 'text-red-700 bg-red-50 border-red-200'
    if (action.includes('Expired')) return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-gray-700 bg-gray-50 border-gray-200'
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Overview of your keys, products, and activity</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => router.push('/products?action=create')}
          className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary transition-all text-left group"
        >
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <PlusIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Add New Product</p>
            <p className="text-sm text-gray-500">Create a new product offering</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => router.push('/keys')}
          className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary transition-all text-left group"
        >
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <KeyIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Generate New Key</p>
            <p className="text-sm text-gray-500">Create access key for a user</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary transition-all text-left group"
        >
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <UserGroupIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Team Settings</p>
            <p className="text-sm text-gray-500">Manage team members</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Keys"
          value={stats?.total_keys || 0}
          icon={KeyIcon}
          color="blue"
          tooltip="Total number of access keys you've created"
          emptyMessage="No keys created yet"
          isEmpty={stats?.total_keys === 0}
        />
        <StatCard
          title="Active Keys"
          value={stats?.active_keys || 0}
          icon={CheckCircleIcon}
          color="green"
          tooltip="Keys that are currently valid and not expired"
          emptyMessage="No active keys"
          isEmpty={stats?.active_keys === 0}
        />
        <StatCard
          title="Products"
          value={stats?.total_products || 0}
          icon={CubeIcon}
          color="purple"
          tooltip="Total number of products you offer"
          emptyMessage="No products yet"
          isEmpty={stats?.total_products === 0}
        />
      </div>

      {/* Additional Stats Row */}
      {stats && stats.total_keys > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Key Status Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Active</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.active_keys}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-gray-700">Expired</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.expired_keys}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-700">Revoked</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.revoked_keys}</span>
              </div>
            </div>
          </div>

          {stats.keys_by_product && stats.keys_by_product.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Keys by Product</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {stats.keys_by_product.slice(0, 5).map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate flex-1">{item.product_name}</span>
                    <span className="font-semibold text-gray-900 ml-2">{item.total}</span>
                  </div>
                ))}
                {stats.keys_by_product.length > 5 && (
                  <p className="text-xs text-gray-500 pt-2">+{stats.keys_by_product.length - 5} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button
              onClick={() => router.push('/logs')}
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {logsLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <ChartBarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600 mb-4">
              Your activity logs will appear here once you start creating products and keys.
            </p>
            <button
              onClick={() => router.push('/products?action=create')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
            >
              Create Your First Product
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          {log.product && (
                            <span className="text-sm text-gray-600">
                              • {log.product.name}
                            </span>
                          )}
                        </div>
                        {log.user && (
                          <p className="text-sm text-gray-600">
                            User: {log.user.email}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State Tips */}
      {stats && stats.total_keys === 0 && stats.total_products === 0 && (
        <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Getting Started</h3>
              <p className="text-sm text-blue-800 mb-3">
                Start by creating your first product, then generate access keys to grant users access to it.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => router.push('/products?action=create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Create Product
                </button>
                <button
                  onClick={() => router.push('/products')}
                  className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                >
                  View Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  tooltip,
  emptyMessage,
  isEmpty,
}: {
  title: string
  value: number
  icon: any
  color: string
  tooltip?: string
  emptyMessage?: string
  isEmpty?: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  }

  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {tooltip && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  {tooltip}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-2 sm:p-3 rounded-lg`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
      {isEmpty && emptyMessage ? (
        <div className="flex items-center gap-2 mt-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
          <p className="text-xs text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
      )}
    </div>
  )
}
