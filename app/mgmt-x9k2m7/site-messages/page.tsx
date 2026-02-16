"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

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
      case 'error': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <AdminShell title="Site Messages" subtitle="Create and manage announcements for your website">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-gray-500/20 border border-gray-500/50 rounded-lg">
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-gray-300 hover:text-gray-200 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Total Messages</h3>
          <p className="text-2xl font-bold text-white">{messages.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Active</h3>
          <p className="text-2xl font-bold text-green-400">
            {messages.filter(m => m.is_active).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">High Priority</h3>
          <p className="text-2xl font-bold text-amber-400">
            {messages.filter(m => m.priority >= 5).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Hidden</h3>
          <p className="text-2xl font-bold text-gray-400">
            {messages.filter(m => !m.is_active).length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-[#6b7280] to-[#9ca3af] hover:from-[#9ca3af] hover:to-[#6b7280] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-[#6b7280]/30"
        >
          {showForm ? "Cancel" : "Create Message"}
        </button>
        <button
          onClick={loadMessages}
          disabled={loading}
          className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#262626] border border-[#262626] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl">
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
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#6b7280]/50 focus:ring-2 focus:ring-[#6b7280]/20 transition-all"
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
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#6b7280]/50 focus:ring-2 focus:ring-[#6b7280]/20 transition-all"
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
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#6b7280]/50 focus:ring-2 focus:ring-[#6b7280]/20 transition-all resize-none"
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
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#6b7280]/50 focus:ring-2 focus:ring-[#6b7280]/20 transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#6b7280] to-[#9ca3af] hover:from-[#9ca3af] hover:to-[#6b7280] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-[#6b7280]/30"
              >
                {editingId ? "Update Message" : "Create Message"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 bg-[#262626] hover:bg-[#1a1a1a] text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">All Messages</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-[#6b7280]/20 border-t-[#6b7280] rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg mb-4">No messages yet</p>
              <p className="text-white/40 mb-6">Create your first site message to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#6b7280] to-[#9ca3af] hover:from-[#9ca3af] hover:to-[#6b7280] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-[#6b7280]/30"
              >
                Create First Message
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-[#6b7280]/30 transition-all"
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
                        className="px-4 py-2 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="px-4 py-2 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 rounded-lg text-sm font-medium transition-colors"
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
    </AdminShell>
  );
}