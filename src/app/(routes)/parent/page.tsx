"use client";

import { ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useSessionStore } from "@/lib/state/sessionStore";
import {
  quickResponses,
  VisualCard,
  conversationTopics
} from "@/lib/constants/presets";
import { CardBoard } from "@/components/cards/CardBoard";
import { QuickResponseTray } from "@/components/cards/QuickResponseTray";
import { ConversationTimeline } from "@/components/conversation/ConversationTimeline";
import { Play, Pause, StopCircle, ArrowRight, RotateCcw, Search, Check, Edit, Save } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
    clearTimeline,
    conversationState,
    setConversationState,
    generatedCards,
    setGeneratedCards,
    currentTopic,
    setCurrentTopic
  } = useSessionStore();

  const [prompt, setPrompt] = useState("");
  const [cards, setCards] = useState<VisualCard[]>([]);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [parentMessage, setParentMessage] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<VisualCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState<Array<{ id: string; thumbnailUrl: string; contentUrl: string; name: string }>>([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [isSavingCards, setIsSavingCards] = useState(false);
  
  const selectedTopicDetails = useMemo(
    () => conversationTopics.find((topic) => topic.prompt === selectedTopic) ?? null,
    [selectedTopic]
  );

  useEffect(() => {
    if (!activeSessionId) {
      createSession()
        .then((sessionId) => setSession(sessionId))
        .catch((error) => setStatus(error.message));
    } else {
      // Restore cards from session store when returning from child page
      if (generatedCards && generatedCards.length > 0) {
        setCards(generatedCards);
      }
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
    // Open edit dialog instead of adding to timeline
    setEditingCard(card);
    setEditTitle(card.title);
    setEditDescription(card.description || "");
    setSelectedImageUrl(card.imageUrl || "");
    setImageSearchQuery(card.title);
    setImageSearchResults([]);
    setShowEditDialog(true);
    
    // Auto-search for images when opening edit dialog
    setTimeout(() => {
      if (card.title) {
        handleSearchImagesWithQuery(card.title);
      }
    }, 100);
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
    if ((selectedTopic || prompt) && activeSessionId) {
      const topicToUse = selectedTopic || prompt;
      setConversationState("active");
      setCurrentTopic(topicToUse);
      startTransition(() => {
        generateCards(activeSessionId, topicToUse)
          .then((generated) => {
            setCards(generated);
            setGeneratedCards(generated);
            generated.forEach((card) => addCard(card));
          })
          .catch((error) => setStatus(error.message));
      });
    }
  };

  const handlePauseConversation = () => {
    setConversationState("paused");
  };

  const handleStopConversation = () => {
    setConversationState("idle");
    setCards([]);
    setGeneratedCards([]);
    setSelectedTopic("");
    setCurrentTopic("");
    setParentMessage("");
  };

  const handleResumeConversation = () => {
    setConversationState("active");
  };

  const handleClearHistory = () => {
    clearTimeline();
  };

  const handleSendMessage = () => {
    if (!parentMessage.trim() || !activeSessionId) return;

    const messageToSend = parentMessage;
    setStatus("🎨 Generating cards...");
    startTransition(() => {
      generateCards(activeSessionId, messageToSend)
        .then((generated) => {
          // Add parent's message to timeline after successful card generation
          addEntry({
            id: crypto.randomUUID(),
            speaker: "parent",
            transcript: messageToSend,
            createdAt: new Date().toISOString()
          });
          
          // Append new cards to existing ones
          const newCards = [...generatedCards, ...generated];
          setCards(newCards);
          setGeneratedCards(newCards);
          generated.forEach((card) => addCard(card));
          setParentMessage("");
          setStatus("✅ Cards generated successfully!");
          setTimeout(() => setStatus(null), 3000);
        })
        .catch((error) => {
          setStatus(`❌ ${error.message}`);
          setTimeout(() => setStatus(null), 3000);
        });
    });
  };

  const handleStartSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setParentMessage(transcript);
      setStatus(null);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setStatus(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearchImagesWithQuery = async (query: string) => {
    if (!query.trim()) return;

    setIsSearchingImages(true);
    try {
      const response = await fetch("/api/images/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to search images");
      }
      setImageSearchResults(payload.results || []);
    } catch (error) {
      console.error("Image search failed:", error);
      setStatus("❌ Failed to search images");
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setIsSearchingImages(false);
    }
  };

  const handleSearchImages = async () => {
    await handleSearchImagesWithQuery(imageSearchQuery);
  };

  const handleSelectSearchImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const handleSaveEdit = async () => {
    if (!editingCard || !editTitle.trim()) return;

    const updatedCards = cards.map(card =>
      card.id === editingCard.id
        ? { 
            ...card, 
            title: editTitle.trim(), 
            description: editDescription.trim(),
            imageUrl: selectedImageUrl || card.imageUrl
          }
        : card
    );

    setCards(updatedCards);
    setGeneratedCards(updatedCards);
    setStatus("Card updated successfully!");

    setShowEditDialog(false);
    setEditingCard(null);
    setEditTitle("");
    setEditDescription("");
    setImageSearchQuery("");
    setImageSearchResults([]);
    setSelectedImageUrl("");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingCard(null);
    setEditTitle("");
    setEditDescription("");
    setImageSearchQuery("");
    setImageSearchResults([]);
    setSelectedImageUrl("");
  };

  const handleSaveCards = async () => {
    if (!activeSessionId || generatedCards.length === 0) {
      setStatus("No cards to save");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setIsSavingCards(true);
    setStatus("💾 Saving cards to database...");
    try {
      const response = await fetch("/api/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId: activeSessionId, 
          cards: generatedCards 
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to save cards");
      }

      setStatus("✅ Cards saved successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Failed to save cards:", error);
      setStatus("❌ Failed to save cards");
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setIsSavingCards(false);
    }
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
        <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm h-[432px] flex flex-col">
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
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm font-medium text-green-900">Conversation in progress</p>
                  <p className="mt-1 text-xs text-green-700">Topic: {currentTopic}</p>
                </div>
                
                {/* Parent Message Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Send a message or question to your child
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={parentMessage}
                      onChange={(e) => setParentMessage(e.target.value)}
                      className="flex-1 min-h-[80px] rounded-lg border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      placeholder="Type a message or click the mic button to speak..."
                      disabled={isPending}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleStartSpeech}
                      disabled={isListening || isPending}
                      variant="secondary"
                      className="flex-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" x2="12" y1="19" y2="22"/>
                      </svg>
                      {isListening ? "Listening..." : "Speak"}
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!parentMessage.trim() || isPending}
                      className="flex-1"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Generating...
                        </span>
                      ) : (
                        "Generate Cards"
                      )}
                    </Button>
                  </div>
                </div>
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
              <h3 className="text-sm font-semibold text-slate-700"></h3>
              <div className="flex gap-2">
                {conversationState === "active" && (
                  <>
                    <Button
                      onClick={handleSaveCards}
                      variant="outline"
                      size="sm"
                      className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                      disabled={isSavingCards || generatedCards.length === 0}
                    >
                      {isSavingCards ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3" />
                          Save Cards
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handlePauseConversation}
                      variant="secondary"
                      size="sm"
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      <Pause className="h-3 w-3" />
                      Pause
                    </Button>
                  </>
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
      </aside>

      {/* Edit Card Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-3xl bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the title, description, and image for this card
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Image Preview */}
            {(selectedImageUrl || editingCard?.imageUrl) && (
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <Image
                    src={selectedImageUrl || editingCard?.imageUrl || ""}
                    alt="Card preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="card-title" className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <Input
                id="card-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Card title"
                className="w-full"
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="card-description" className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                id="card-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[80px] w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                placeholder="Card description (optional)"
              />
            </div>

            {/* Image Search Section */}
            <div className="border-t border-slate-200 pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search for a Better Image
              </label>
              <div className="flex gap-2">
                <Input
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  placeholder="Search for images..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchImages();
                    }
                  }}
                />
                <Button
                  onClick={handleSearchImages}
                  disabled={!imageSearchQuery.trim() || isSearchingImages}
                  variant="outline"
                  className="min-w-[100px]"
                >
                  {isSearchingImages ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search
                    </span>
                  )}
                </Button>
              </div>

              {/* Image Search Results */}
              {isSearchingImages && (
                <div className="mt-4 flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                    <span className="text-sm">Searching for images...</span>
                  </div>
                </div>
              )}

              {!isSearchingImages && imageSearchResults.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-600 mb-2">
                    Click an image to select it ({imageSearchResults.length} results)
                  </p>
                  <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 p-2 bg-slate-50">
                    {imageSearchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectSearchImage(result.contentUrl)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition hover:scale-105 ${
                          selectedImageUrl === result.contentUrl
                            ? "border-brand shadow-lg"
                            : "border-transparent hover:border-slate-300"
                        }`}
                      >
                        <Image
                          src={result.thumbnailUrl}
                          alt={result.name}
                          fill
                          className="object-cover"
                        />
                        {selectedImageUrl === result.contentUrl && (
                          <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                            <div className="bg-brand rounded-full p-1">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isSearchingImages && imageSearchResults.length === 0 && imageSearchQuery && (
                <p className="mt-2 text-xs text-slate-500">
                  No results found. Try a different search term.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
