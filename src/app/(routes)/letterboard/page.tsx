"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, XCircle, Undo2, Sparkles, Info, Hand, Clock } from "lucide-react";

type LayoutId = "alphabetical" | "qwerty";

type LayoutOption = {
  id: LayoutId;
  label: string;
  helper: string;
};

type PhraseCluster = {
  title: string;
  accent?: string;
  phrases: string[];
};

const LETTER_LAYOUTS: Record<LayoutId, string[][]> = {
  alphabetical: [
    ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    ["J", "K", "L", "M", "N", "O", "P", "Q", "R"],
    ["S", "T", "U", "V", "W", "X", "Y", "Z"]
  ],
  qwerty: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ]
};

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "alphabetical",
    label: "Alphabetical",
    helper: "Classic RPM-style board with grouped letters"
  },
  {
    id: "qwerty",
    label: "QWERTY",
    helper: "Keyboard layout for generalizing to typing"
  }
];

const QUICK_PHRASES: PhraseCluster[] = [
  {
    title: "Core Responses",
    phrases: ["Yes", "No", "Maybe", "I need help", "I don't know", "Please repeat"]
  },
  {
    title: "Feelings",
    accent: "border-orange-200 bg-orange-50 text-orange-700",
    phrases: ["I'm calm", "I'm anxious", "I'm excited", "I'm overwhelmed", "This is hard"]
  },
  {
    title: "Sensory Needs",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    phrases: ["Take a break", "Move my body", "Lower the volume", "I need deep pressure", "Change seats"]
  }
];

const PARTNER_TIPS = [
  "Offer steady arm support and keep the board anchored in a predictable position.",
  "Wait an extra beat before prompting again; silent counting to five can help.",
  "Confirm each letter aloud to reinforce motor planning and shared attention.",
  "Read back completed words to check shared understanding and celebrate effort."
];

export default function LetterboardPage() {
  const [layout, setLayout] = useState<LayoutId>("alphabetical");
  const [message, setMessage] = useState("");
  const [hasSpeech, setHasSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [lastSpoken, setLastSpoken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setHasSpeech(true);
    }
  }, []);

  const messageWords = useMemo(() => {
    return message.trim().length ? message.trim().split(/\s+/) : [];
  }, [message]);

  const currentWord = useMemo(() => {
    return messageWords.length ? messageWords[messageWords.length - 1] : "";
  }, [messageWords]);

  const letterCount = useMemo(() => message.replace(/\s+/g, "").length, [message]);

  const handleLetterInput = (token: string) => {
    setMessage((prev) => prev + token);
  };

  const handleSpace = () => {
    setMessage((prev) => (prev.endsWith(" ") || prev.length === 0 ? prev : `${prev} `));
  };

  const handleBackspace = () => {
    setMessage((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setMessage("");
    setLastSpoken("");
  };

  const handlePhrase = (phrase: string) => {
    setMessage((prev) => {
      const base = prev.length === 0 || prev.endsWith(" ") ? prev : `${prev} `;
      return `${base}${phrase} `;
    });
  };

  const handleSpeak = () => {
    const text = message.trim();
    if (!text || !hasSpeech) {
      return;
    }

    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    synthesis.speak(utterance);
    setLastSpoken(text);
  };

  const rateOptions = [0.75, 0.9, 1.05];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Letterboard Communication Studio</h1>
            <p className="text-sm text-slate-600">
              Build purposeful motor practice and expressive spelling with a flexible, partner-supported letterboard inspired by autistic self-advocates.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
            <Info className="h-4 w-4 text-brand" />
            <span>
              Learn more about lived experiences in 
              <Link href="https://the-art-of-autism.com/how-the-letterboard-changed-my-life/" className="ml-1 font-medium text-brand underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                How the Letterboard Changed My Life
              </Link>
              .
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Message workspace</h2>
                <p className="text-xs text-slate-500">
                  Read letters aloud, offer motor cues only as needed, and celebrate approximation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="secondary" onClick={handleSpeak} disabled={!hasSpeech || message.trim().length === 0}>
                  <Volume2 className="h-4 w-4" />
                  Speak
                </Button>
                <Button type="button" variant="outline" onClick={handleClear} disabled={message.length === 0}>
                  <XCircle className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/95 p-5 text-white shadow-inner space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-300">
                <span>Letter count: {letterCount}</span>
                <span>Words: {messageWords.length}</span>
                <span>Current word: {currentWord || "—"}</span>
              </div>
              <div className="min-h-[96px] rounded-xl border border-white/10 bg-black/20 p-4 text-2xl font-semibold tracking-[0.35em]">
                {message.length ? message.toUpperCase() : <span className="text-slate-400 tracking-normal">Tap letters or phrases to begin.</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                {lastSpoken && <span>Last voiced: “{lastSpoken}”</span>}
                {!hasSpeech && <span>Speech synthesis not available in this browser.</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleSpace} disabled={message.length === 0 || message.endsWith(" ")}>Space</Button>
              <Button type="button" variant="secondary" onClick={handleBackspace} disabled={message.length === 0}>
                <Undo2 className="h-4 w-4" />
                Backspace
              </Button>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                Give generous wait time before prompting. Let the speller set the pace.
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Letter layout</h3>
              <div className="flex flex-wrap gap-2">
                {LAYOUT_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    type="button"
                    variant={layout === option.id ? "default" : "outline"}
                    onClick={() => setLayout(option.id)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                {LAYOUT_OPTIONS.find((option) => option.id === layout)?.helper}
              </p>
            </div>

            <div className="space-y-3">
              {LETTER_LAYOUTS[layout].map((row, idx) => (
                <div
                  key={`${layout}-row-${idx}`}
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
                >
                  {row.map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleLetterInput(letter)}
                      className="rounded-xl border border-slate-200 bg-white/90 py-4 text-lg font-semibold uppercase tracking-[0.2em] shadow-sm transition hover:border-brand hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <h3 className="text-sm font-semibold text-slate-900">Quick phrases</h3>
            </div>
            {QUICK_PHRASES.map((cluster) => (
              <div key={cluster.title} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{cluster.title}</p>
                <div className="flex flex-wrap gap-2">
                  {cluster.phrases.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => handlePhrase(phrase)}
                      className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-brand hover:bg-brand/10 ${cluster.accent ?? ""}`}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4 text-brand" />
              <h3 className="text-sm font-semibold text-slate-900">Partner coaching cues</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {PARTNER_TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-inner space-y-4 text-sm text-slate-600">
            <p>
              Try supporting co-regulation before spelling begins—deep breaths, rhythmic counting, or gentle movement can prepare the motor system.
            </p>
            <div className="flex flex-wrap gap-2">
              {rateOptions.map((rate) => (
                <Button
                  key={rate}
                  type="button"
                  variant={speechRate === rate ? "default" : "outline"}
                  onClick={() => setSpeechRate(rate)}
                >
                  Voice rate {rate.toFixed(2)}x
                </Button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Adjust the voice rate to match the communicator's pacing preference when playing back messages.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
