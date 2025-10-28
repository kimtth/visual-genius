"use client";

import { ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useSessionStore } from "@/lib/state/sessionStore";
import { quickResponses, VisualCard, conversationTopics } from "@/lib/constants/presets";
import { CardBoard } from "@/components/cards/CardBoard";
import { QuickResponseTray } from "@/components/cards/QuickResponseTray";
import { ConversationTimeline } from "@/components/conversation/ConversationTimeline";
import { Play, Pause, StopCircle, ArrowRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function createSession() {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentId: "demo-parent", childId: "demo-child" })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to create session");
  }
  return payload.sessionId as string;
}

async function generateCards(sessionId: string, prompt: string) {
  const response = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, prompt })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to generate cards");
  }
  return payload.cards as VisualCard[];
}

export default function ParentPage() {
  const router = useRouter();
  const {
    activeSessionId,
    setSession,
    addCard,
    addEntry,
    selectedCards,
    timeline,
    currentSpeaker,
    setCurrentSpeaker,
    clearTimeline
  } = useSessionStore();

  const [prompt, setPrompt] = useState("");
  const [cards, setCards] = useState<VisualCard[]>([]);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [conversationState, setConversationState] = useState<"idle" | "active" | "paused">("idle");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const selectedTopicDetails = useMemo(
    () => conversationTopics.find((topic) => topic.prompt === selectedTopic) ?? null,
    [selectedTopic]
  );

  useEffect(() => {
    if (!activeSessionId) {
      createSession()
        .then((sessionId) => setSession(sessionId))
        .catch((error) => setStatus(error.message));
    }
  }, [activeSessionId, setSession]);

  const handleGenerate = () => {
    if (!prompt || !activeSessionId) return;

    setStatus(null);
    startTransition(() => {
      generateCards(activeSessionId, prompt)
        .then((generated) => {
          setCards(generated);
          generated.forEach((card) => addCard(card));
          setPrompt("");
        })
        .catch((error) => setStatus(error.message));
    });
  };

  const handleSelect = (card: VisualCard) => {
    addEntry({
      id: crypto.randomUUID(),
      speaker: "parent",
      card,
      createdAt: new Date().toISOString()
    });
  };

  const handleQuickResponse = (card: VisualCard) => {
    addEntry({
      id: crypto.randomUUID(),
      speaker: "child",
      card,
      createdAt: new Date().toISOString()
    });
  };

  const handleStartConversation = () => {
    if (selectedTopic && activeSessionId) {
      setConversationState("active");
      setPrompt(selectedTopic);
      handleGenerate();
    }
  };

  const handlePauseConversation = () => {
    setConversationState("paused");
  };

  const handleStopConversation = () => {
    setConversationState("idle");
    setCards([]);
    setSelectedTopic("");
  };

  const handleResumeConversation = () => {
    setConversationState("active");
  };

  const handleClearHistory = () => {
    clearTimeline();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      {/* Next Turn Button - Top Right */}
      <div className="fixed top-20 right-6 z-50">
        <Button
          onClick={() => {
            setCurrentSpeaker("child");
            router.push("/child");
          }}
          size="icon"
          className="h-16 w-16 rounded-full shadow-2xl bg-green-600 hover:bg-green-700"
          title="Next Turn: Child"
        >
          <ArrowRight className="h-8 w-8" />
        </Button>
      </div>

      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm h-[632px] flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900">Start Conversation</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select a predefined topic or create your own to begin a conversation.
          </p>
          
          <div className="flex-1 overflow-y-auto">
            {conversationState === "idle" && (
              <Tabs defaultValue="topics" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="topics">Predefined Topics</TabsTrigger>
                  <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
                </TabsList>
                
                <TabsContent value="topics" className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Select a conversation topic
                    </label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {conversationTopics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.prompt}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTopicDetails && (
                      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        {selectedTopicDetails.prompt}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleStartConversation}
                    disabled={!selectedTopic || !activeSessionId || isPending}
                    className="w-full"
                  >
                    <Play className="h-4 w-4" />
                    {isPending ? "Starting..." : "Start Conversation"}
                  </Button>
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Enter your custom prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPrompt(event.target.value)}
                      className="min-h-[120px] w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      placeholder="Example: Let's talk about your favorite activities"
                    />
                  </div>
                  
                  <Button
                    onClick={handleStartConversation}
                    disabled={!prompt || !activeSessionId || isPending}
                    className="w-full"
                  >
                    <Play className="h-4 w-4" />
                    {isPending ? "Starting..." : "Start Conversation"}
                  </Button>
                </TabsContent>
              </Tabs>
            )}
            
            {conversationState === "active" && (
              <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-medium text-green-900">Conversation in progress</p>
                <p className="mt-1 text-xs text-green-700">Topic: {selectedTopic || prompt}</p>
              </div>
            )}
            
            {conversationState === "paused" && (
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <p className="text-sm font-medium text-yellow-900">Conversation paused</p>
                <Button
                  onClick={handleResumeConversation}
                  variant="secondary"
                  className="mt-3 bg-yellow-600 text-white hover:bg-yellow-700"
                  size="sm"
                >
                  <Play className="h-3 w-3" />
                  Resume
                </Button>
              </div>
            )}
          </div>
          
          {status && <p className="mt-2 text-sm text-red-600">{status}</p>}
        </div>
        
        {conversationState !== "idle" && <CardBoard cards={cards} onSelect={handleSelect} />}
        
        {conversationState !== "idle" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Quick child responses</h3>
              <div className="flex gap-2">
                {conversationState === "active" && (
                  <Button
                    onClick={handlePauseConversation}
                    variant="secondary"
                    size="sm"
                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    <Pause className="h-3 w-3" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={handleStopConversation}
                  variant="destructive"
                  size="sm"
                >
                  <StopCircle className="h-3 w-3" />
                  Stop
                </Button>
              </div>
            </div>
            <QuickResponseTray responses={quickResponses} onSelect={handleQuickResponse} />
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-slate-900">Conversation timeline</h3>
            <Button
              onClick={handleClearHistory}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-100"
              title="Clear conversation history"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Track which cards were used and the responses captured during this session.
          </p>
          <ScrollArea className="mt-4 h-[540px] pr-4">
            <div className="space-y-4">
              <ConversationTimeline log={timeline} />
            </div>
          </ScrollArea>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 text-sm text-slate-600 shadow-sm">
          <p>Cards selected this session: {selectedCards.length}</p>
        </div>
      </aside>
    </div>
  );
}
