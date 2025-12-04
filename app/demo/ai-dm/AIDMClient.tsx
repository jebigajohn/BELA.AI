'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import PageWrapper from '@/app/components/PageWrapper'

interface Message {
  id: number
  instagram_id: string
  direction: 'inbound' | 'outbound'
  body: string | null
  created_at: string
}

interface Conversation {
  instagram_id: string
  last_message: string
  last_message_at: string
  unread_count: number
  messages: Message[]
}

export default function AIDMClient() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Lade Conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/instagram/conversations')
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      setConversations(data.conversations || [])

      // Update selected conversation if it exists
      if (selectedConversation) {
        const updated = data.conversations?.find(
          (c: Conversation) =>
            c.instagram_id === selectedConversation.instagram_id
        )
        if (updated) {
          setSelectedConversation(updated)
        }
      }
    } catch {
      setError('Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()

    // Polling alle 5 Sekunden für neue Nachrichten
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  // Nachricht senden
  const handleSendMessage = async (useAI = false) => {
    if (!selectedConversation || !newMessage.trim()) return

    setSending(true)
    try {
      const res = await fetch('/api/instagram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagram_id: selectedConversation.instagram_id,
          message: newMessage,
          use_ai: useAI,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      setNewMessage('')
      // Refresh conversations
      await fetchConversations()
    } catch {
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Jetzt'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  // Format full date for messages
  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Mobile: Select conversation handler
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    setShowMobileChat(true)
  }

  // Mobile: Back button handler
  const handleBackToList = () => {
    setShowMobileChat(false)
    setSelectedConversation(null)
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-neutral-900 rounded-lg">
          <div className="text-white">Lade Nachrichten...</div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="!p-2 md:!p-4">
      <div className="flex h-[calc(100vh-6rem)] bg-neutral-900 text-white rounded-lg overflow-hidden">
        {/* Sidebar - Conversations List */}
        <div
          className={`${
            showMobileChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 border-r border-neutral-800 flex-col`}
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">23nailroombali</h1>
              <button
                onClick={fetchConversations}
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                title="Aktualisieren"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-neutral-400 mt-1">Nachrichten</p>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">
                <p>Keine Nachrichten</p>
                <p className="text-sm mt-2">
                  Schicke eine DM an @23nailroombali um zu testen
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.instagram_id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-800 transition-colors text-left ${
                    selectedConversation?.instagram_id === conv.instagram_id
                      ? 'bg-neutral-800'
                      : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold shrink-0">
                    {conv.instagram_id.slice(-2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">
                        User {conv.instagram_id.slice(-6)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 truncate mt-0.5">
                      {conv.last_message || 'Keine Nachricht'}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {conv.unread_count > 0 && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div
          className={`${
            showMobileChat ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={handleBackToList}
                  className="md:hidden p-2 hover:bg-neutral-800 rounded-full transition-colors -ml-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.instagram_id.slice(-2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold">
                    User {selectedConversation.instagram_id.slice(-6)}
                  </h2>
                  <p className="text-xs text-neutral-500 hidden sm:block">
                    ID: {selectedConversation.instagram_id}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === 'outbound'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-800 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.body}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.direction === 'outbound'
                            ? 'text-blue-200'
                            : 'text-neutral-500'
                        }`}
                      >
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-4 border-t border-neutral-800">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht schreiben..."
                    className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(false)
                      }
                    }}
                    disabled={sending}
                  />
                  <Button
                    onClick={() => handleSendMessage(false)}
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sending ? '...' : 'Senden'}
                  </Button>
                  <Button
                    onClick={() => handleSendMessage(true)}
                    disabled={sending || !newMessage.trim()}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10 hidden sm:flex"
                    title="AI generiert Antwort basierend auf deinem Text"
                  >
                    🤖 AI
                  </Button>
                </div>
                <p className="text-xs text-neutral-500 mt-2 hidden md:block">
                  Enter = Senden | AI-Button = AI generiert Antwort basierend
                  auf Kundenanfrage
                </p>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-neutral-700 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  Deine Nachrichten
                </h2>
                <p className="text-neutral-500 max-w-sm text-sm md:text-base">
                  Wähle eine Konversation aus der Liste oder warte auf neue DMs
                  an @23nailroombali
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="hover:bg-red-700 rounded p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
