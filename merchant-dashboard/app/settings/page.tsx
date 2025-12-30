'use client'

import { useState } from 'react'
import api from '@/lib/api'

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    // Placeholder: Webhook endpoint not implemented yet
    setTimeout(() => {
      setMessage('Settings saved (webhook endpoint pending implementation)')
      setSaving(false)
    }, 1000)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webhook URL
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-domain.com/webhook"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          <p className="mt-1 text-sm text-gray-500">
            Receive notifications when keys are created, validated, or revoked.
          </p>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Enable email notifications</span>
          </label>
        </div>

        {message && (
          <div className={`p-4 rounded ${
            message.includes('pending') 
              ? 'bg-yellow-50 text-yellow-800' 
              : 'bg-green-50 text-green-800'
          }`}>
            {message}
          </div>
        )}

        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

