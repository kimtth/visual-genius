"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { log } from "@/lib/observability/logger";

interface Setting {
  id: string;
  key: string;
  value: string | null;
  originalValue?: string | null;
  description: string | null;
  isEncrypted: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Application Settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Configure database, AI services, and API keys. Changes take effect on next server action.
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
    </section>
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
