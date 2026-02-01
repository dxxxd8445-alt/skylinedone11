"use client";

import { useEffect, useState } from "react";

interface Message {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  priority: number;
  created_at: string;
}

export default function SiteMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as const,
    priority: 0,
  });

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/site-messages');
      
      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }
      
      const result = await response.json();
      setMessages(result.data || []);
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `/api/site-messages/${editingId}`
        : '/api/site-messages';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.status}`);
      }
      
      // Reset form and reload
      setFormData({ title: "", message: "", type: "info", priority: 0 });
      setEditingId(null);
      setShowForm(false);
      await loadMessages();
      
    } catch (err: any) {
      setError(err.message || "Failed to save message");
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/site-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle message: ${response.status}`);
      }
      
      await loadMessages();
    } catch (err: any) {
      setError(err.message || "Failed to toggle message");
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    
    try {
      const response = await fetch(`/api/site-messages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`);
      }
      
      await loadMessages();
    } catch (err: any) {
      setError(err.message || "Failed to delete message");
    }
  }

  function startEdit(message: Message) {
    setFormData({
      title: message.title,
      message: message.message,
      type: message.type,
      priority: message.priority,
    });
    setEditingId(message.id);
    setShowForm(true);
  }

  function cancelEdit() {
    setFormData({ title: "", message: "", type: "info", priority: 0 });
    setEditingId(null);
    setShowForm(false);
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Site Messages</h1>
        <p className="text-white/60">Create and manage announcements for your website</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <h3 className="text-white/60 text-sm font-medium">Total Messages</h3>
          <p className="text-2xl font-bold text-white">{messages.length}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <h3 className="text-white/60 text-sm font-medium">Active</h3>
          <p className="text-2xl font-bold text-green-400">
            {messages.filter(m => m.is_active).length}
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <h3 className="text-white/60 text-sm font-medium">High Priority</h3>
          <p className="text-2xl font-bold text-amber-400">
            {messages.filter(m => m.priority >= 5).length}
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <h3 className="text-white/60 text-sm font-medium">Hidden</h3>
          <p className="text-2xl font-bold text-gray-400">
            {messages.filter(m => !m.is_active).length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? "Cancel" : "Create Message"}
        </button>
        <button
          onClick={loadMessages}
          disabled={loading}
          className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#262626] border border-[#262626] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-[#1a1a1a] border border-[#262626] rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? "Edit Message" : "Create New Message"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626]/50"
                  placeholder="Enter message title"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626]/50"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626]/50 resize-none"
                placeholder="Enter your message content"
              />
            </div>
            
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Priority (0-10, higher shows first)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626]/50"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-medium transition-colors"
              >
                {editingId ? "Update Message" : "Create Message"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 bg-[#262626] hover:bg-[#1a1a1a] text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">All Messages</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-[#dc2626]/20 border-t-[#dc2626] rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg mb-4">No messages yet</p>
              <p className="text-white/40 mb-6">Create your first site message to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-medium transition-colors"
              >
                Create First Message
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 hover:border-[#dc2626]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-white font-semibold text-lg">{message.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeStyle(message.type)}`}>
                          {message.type.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          message.is_active 
                            ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        }`}>
                          {message.is_active ? "ACTIVE" : "HIDDEN"}
                        </span>
                        <span className="text-white/40 text-sm">Priority: {message.priority}</span>
                      </div>
                      <p className="text-white/80 mb-3 leading-relaxed">{message.message}</p>
                      <p className="text-white/40 text-sm">
                        Created: {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(message.id, message.is_active)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          message.is_active
                            ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {message.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => startEdit(message)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}