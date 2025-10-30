"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { log } from "@/lib/observability/logger";
import { Trash2, Eye, Edit, CheckCircle, Circle, Pause } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/lib/state/authStore";

interface Setting {
  id: string;
  key: string;
  value: string | null;
  originalValue?: string | null;
  description: string | null;
  isEncrypted: boolean;
}

interface ConversationSession {
  id: string;
  parent_id: string;
  child_id: string;
  parent_user_id: string | null;
  topic: string | null;
  status: "active" | "paused" | "completed";
  notes: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  card_count: number;
  utterance_count: number;
}

interface TimelineEntry {
  id: string;
  speaker: "parent" | "child" | string;
  transcript?: string;
  recordingUrl?: string;
  createdAt: string;
  card?: {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    category: string;
    createdAt: string;
  };
}

interface SessionStatistics {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  total_cards: number;
  total_utterances: number;
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Session management state
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [statistics, setStatistics] = useState<SessionStatistics | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "paused" | "completed">("active");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused" | "completed">("all");
  const [activeTab, setActiveTab] = useState("settings");
  
  // Conversation history state
  const [viewHistoryDialogOpen, setViewHistoryDialogOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<TimelineEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "sessions") {
      fetchSessions();
      fetchStatistics();
    }
  }, [activeTab, filterStatus]);

  async function fetchSettings() {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      const data = await response.json();
      
      if (response.ok) {
        setSettings(data.settings);
        // Initialize edited values with original values
        const initialValues: Record<string, string> = {};
        data.settings.forEach((s: Setting) => {
          initialValues[s.key] = s.originalValue || s.value || "";
        });
        setEditedValues(initialValues);
      } else {
        showMessage("error", "Failed to load settings");
      }
    } catch (error) {
      log({
        level: "error",
        message: "Failed to fetch settings",
        diagnostics: error instanceof Error ? error.stack : String(error)
      });
      showMessage("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: editedValues })
      });

      if (response.ok) {
        showMessage("success", "Settings saved successfully! Changes will take effect on next server action.");
        await fetchSettings(); // Refresh to show masked values
      } else {
        showMessage("error", "Failed to save settings");
      }
    } catch (error) {
      log({
        level: "error",
        message: "Failed to save settings",
        diagnostics: error instanceof Error ? error.stack : String(error)
      });
      showMessage("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(key: string, value: string) {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  async function fetchSessions() {
    try {
      setSessionsLoading(true);
      
      if (!user?.id) {
        showMessage("error", "User not authenticated");
        return;
      }
      
      const statusFilter = filterStatus !== "all" ? `&status=${filterStatus}` : "";
      const response = await fetch(`/api/sessions?parentUserId=${user.id}${statusFilter}`);
      const data = await response.json();
      
      if (response.ok) {
        setSessions(data.sessions || []);
      } else {
        showMessage("error", "Failed to load sessions");
      }
    } catch (error) {
      log({
        level: "error",
        message: "Failed to fetch sessions",
        diagnostics: error instanceof Error ? error.stack : String(error)
      });
      showMessage("error", "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }

  async function fetchStatistics() {
    try {
      
      if (!user?.id) {
        return;
      }
      
      const response = await fetch(`/api/sessions?parentUserId=${user.id}&stats=true`);
      const data = await response.json();
      
      if (response.ok) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      log({
        level: "error",
        message: "Failed to fetch statistics",
        diagnostics: error instanceof Error ? error.stack : String(error)
      });
    }
  }

  async function handleDeleteSession() {
    if (!selectedSession) return;

    try {
      const response = await fetch(`/api/sessions?sessionId=${selectedSession.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        showMessage("success", "Session deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedSession(null);
        fetchSessions();
        fetchStatistics();
      } else {
        showMessage("error", "Failed to delete session");
      }
    } catch (error) {
      log({
        level: "error",
        message: "Failed to delete session",
        diagnostics: error instanceof Error ? error.stack : String(error)
      });
      showMessage("error", "Failed to delete session");
    }
  }

  async function handleUpdateSession() {
    if (!selectedSession) return;

    try {
      const response = await fetch("/api/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          notes: editNotes,
          status: editStatus,
          ended_at: editStatus === "completed" ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        showMessage("success", "Session updated successfully");
        setEditDialogOpen(false);
        setSelectedSession(null);
        fetchSessions();
        fetchStatistics();
      } else {
        showMessage("error", "Failed to update session");
      }
    } catch (error) {
      log({
        level: "error",
        message: "Failed to update session",
        diagnostics: error instanceof Error ? error.stack : String(error)
      });
      showMessage("error", "Failed to update session");
    }
  }

  function openEditDialog(session: ConversationSession) {
    setSelectedSession(session);
    setEditNotes(session.notes || "");
    setEditStatus(session.status);
    setEditDialogOpen(true);
  }

  function openDeleteDialog(session: ConversationSession) {
    setSelectedSession(session);
    setDeleteDialogOpen(true);
  }

  async function openHistoryDialog(session: ConversationSession) {
    setSelectedSession(session);
    setViewHistoryDialogOpen(true);
    setLoadingHistory(true);
    
    try {
      const response = await fetch(`/api/conversations?sessionId=${session.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setConversationHistory(data.entries || []);
      } else {
        showMessage("error", "Failed to load conversation history");
      }
    } catch (error) {
      log({
        level: "error",
        message: "Failed to fetch conversation history",
        diagnostics: error instanceof Error ? error.stack : String(error)
      });
      showMessage("error", "Failed to load conversation history");
    } finally {
      setLoadingHistory(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Application Settings</h2>
        <p className="mt-4 text-sm text-slate-600">Loading settings...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Settings & Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configure application settings and manage conversation sessions.
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Application Settings</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Configuration</h3>
              <p className="mt-1 text-sm text-slate-600">
                Configure database, AI services, and API keys.
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

      <div className="space-y-6">
        {/* Database Settings */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-3">Database</h3>
          <div className="space-y-4">
            {settings
              .filter((s) => s.key.includes("POSTGRES"))
              .map((setting) => (
                <SettingField
                  key={setting.id}
                  setting={setting}
                  value={editedValues[setting.key] || ""}
                  onChange={(value) => handleChange(setting.key, value)}
                />
              ))}
          </div>
        </div>

        {/* Azure OpenAI Settings */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-3">Azure OpenAI</h3>
          <div className="space-y-4">
            {settings
              .filter((s) => s.key.includes("AZURE_OPENAI"))
              .map((setting) => (
                <SettingField
                  key={setting.id}
                  setting={setting}
                  value={editedValues[setting.key] || ""}
                  onChange={(value) => handleChange(setting.key, value)}
                />
              ))}
          </div>
        </div>

        {/* Image Search Settings */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-3">Image Search</h3>
          <div className="space-y-4">
            {settings
              .filter((s) => s.key.includes("UNSPLASH"))
              .map((setting) => (
                <SettingField
                  key={setting.id}
                  setting={setting}
                  value={editedValues[setting.key] || ""}
                  onChange={(value) => handleChange(setting.key, value)}
                />
              ))}
          </div>
        </div>
      </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Configuration Notes</h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Settings stored in database override environment variables (.env.local)</li>
              <li>Leave fields empty to use .env.local values as fallback</li>
              <li>Sensitive values (keys, passwords) are masked in the UI</li>
              <li>Get free Unsplash API key at: <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="underline">unsplash.com/developers</a></li>
              <li>PostgreSQL URL format: postgres://user:password@host:5432/database</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-700 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.total_sessions}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <p className="text-xs font-medium text-green-700 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-900">{statistics.active_sessions}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <p className="text-xs font-medium text-purple-700 mb-1">Completed</p>
                <p className="text-2xl font-bold text-purple-900">{statistics.completed_sessions}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                <p className="text-xs font-medium text-orange-700 mb-1">Total Cards</p>
                <p className="text-2xl font-bold text-orange-900">{statistics.total_cards}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4">
                <p className="text-xs font-medium text-pink-700 mb-1">Total Interactions</p>
                <p className="text-2xl font-bold text-pink-900">{statistics.total_utterances}</p>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === "paused" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("paused")}
            >
              Paused
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
            >
              Completed
            </Button>
          </div>

          {/* Sessions List */}
          {sessionsLoading ? (
            <p className="text-sm text-slate-600">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg">
              <p className="text-sm text-slate-600">No sessions found</p>
              <p className="text-xs text-slate-500 mt-1">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={session.status} />
                        {session.topic && (
                          <span className="text-sm font-medium text-slate-900">{session.topic}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600 mb-2">
                        <div>
                          <span className="font-medium">Parent:</span> {session.parent_id}
                        </div>
                        <div>
                          <span className="font-medium">Child:</span> {session.child_id}
                        </div>
                        <div>
                          <span className="font-medium">Cards:</span> {session.card_count}
                        </div>
                        <div>
                          <span className="font-medium">Interactions:</span> {session.utterance_count}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Started: {new Date(session.started_at).toLocaleString()}
                        {session.ended_at && ` • Ended: ${new Date(session.ended_at).toLocaleString()}`}
                      </div>
                      {session.notes && (
                        <div className="mt-2 text-xs text-slate-600 italic">
                          Note: {session.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openHistoryDialog(session)}
                        className="h-8 w-8 p-0"
                        title="View conversation history"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(session)}
                        className="h-8 w-8 p-0"
                        title="Edit session"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(session)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Session Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update the session status and notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                <Button
                  variant={editStatus === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditStatus("active")}
                  className="flex-1"
                >
                  Active
                </Button>
                <Button
                  variant={editStatus === "paused" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditStatus("paused")}
                  className="flex-1"
                >
                  Paused
                </Button>
                <Button
                  variant={editStatus === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditStatus("completed")}
                  className="flex-1"
                >
                  Completed
                </Button>
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              <Input
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this session..."
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSession} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Conversation History Dialog */}
      <Dialog open={viewHistoryDialogOpen} onOpenChange={setViewHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversation History</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-1 px-6 pb-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedSession.status} />
                {selectedSession.topic && (
                  <span className="text-sm font-medium text-slate-900">{selectedSession.topic}</span>
                )}
              </div>
              <div className="text-xs text-slate-600">
                Session started: {new Date(selectedSession.started_at).toLocaleString()}
              </div>
              <div className="text-xs text-slate-600">
                {selectedSession.card_count} cards • {selectedSession.utterance_count} interactions
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-600">Loading conversation history...</p>
              </div>
            ) : conversationHistory.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg">
                <p className="text-sm text-slate-600">No conversation history found</p>
                <p className="text-xs text-slate-500 mt-1">Interactions will appear here as they occur</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {conversationHistory.map((entry, index) => (
                  <div key={entry.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        entry.speaker === "parent" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {entry.speaker === "parent" ? "P" : "C"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900 capitalize">
                            {entry.speaker}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        {entry.transcript && (
                          <p className="text-sm text-slate-700 mb-2">{entry.transcript}</p>
                        )}
                        
                        {entry.card && (
                          <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex gap-3">
                              {entry.card.imageUrl && (
                                <img 
                                  src={entry.card.imageUrl} 
                                  alt={entry.card.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{entry.card.title}</p>
                                {entry.card.description && (
                                  <p className="text-xs text-slate-600 mt-1">{entry.card.description}</p>
                                )}
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded">
                                  {entry.card.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {entry.recordingUrl && (
                          <div className="mt-2">
                            <audio controls className="w-full max-w-md h-8">
                              <source src={entry.recordingUrl} type="audio/wav" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation session? This will also delete all associated cards and interactions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSession}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function StatusBadge({ status }: { status: "active" | "paused" | "completed" }) {
  const config = {
    active: {
      icon: Circle,
      className: "bg-green-100 text-green-700 border-green-300",
      label: "Active"
    },
    paused: {
      icon: Pause,
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
      label: "Paused"
    },
    completed: {
      icon: CheckCircle,
      className: "bg-blue-100 text-blue-700 border-blue-300",
      label: "Completed"
    }
  };

  const { icon: Icon, className, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function SettingField({
  setting,
  value,
  onChange
}: {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
}) {
  const isSensitive =
    setting.key.includes("KEY") ||
    setting.key.includes("PASSWORD") ||
    setting.key.includes("URL");

  return (
    <div>
      <label htmlFor={setting.key} className="block text-sm font-medium text-slate-700 mb-1">
        {formatKeyName(setting.key)}
      </label>
      {setting.description && (
        <p className="text-xs text-slate-500 mb-2">{setting.description}</p>
      )}
      <Input
        id={setting.key}
        type={isSensitive ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${formatKeyName(setting.key).toLowerCase()}`}
        className="font-mono text-sm"
      />
    </div>
  );
}

function formatKeyName(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
