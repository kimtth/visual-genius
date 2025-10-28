"use client";

import { ChangeEvent, useEffect, useState, useTransition, useRef } from "react";
import Image from "next/image";
import { useSessionStore } from "@/lib/state/sessionStore";
import { VisualCard } from "@/lib/constants/presets";
import { CardBoard } from "@/components/cards/CardBoard";
import { GripVertical, Save, Trash2, Plus, FolderOpen, Upload, Lock, Play, ChevronLeft, ChevronRight, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  getAllCollections,
  isDemoCollection,
  CardCollection
} from "@/lib/constants/demoCollections";

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

async function saveCardOrder(sessionId: string, cards: VisualCard[]) {
  // This would save the card order to the database
  // For now, we'll store it in localStorage as a demo
  localStorage.setItem(`card-order-${sessionId}`, JSON.stringify(cards.map(c => c.id)));
  return true;
}

function getUserCollections(): CardCollection[] {
  const stored = localStorage.getItem('card-collections');
  return stored ? JSON.parse(stored) : [];
}

function saveCollection(name: string, cards: VisualCard[]): CardCollection {
  const collections = getUserCollections();
  const newCollection: CardCollection = {
    id: `user-${Date.now()}`,
    name,
    cards,
    createdAt: new Date().toISOString()
  };
  collections.push(newCollection);
  localStorage.setItem('card-collections', JSON.stringify(collections));
  return newCollection;
}

function deleteCollection(id: string) {
  // Prevent deletion of demo collections
  if (isDemoCollection(id)) {
    return false;
  }
  const collections = getUserCollections();
  const filtered = collections.filter(c => c.id !== id);
  localStorage.setItem('card-collections', JSON.stringify(filtered));
  return true;
}

export default function TeachPage() {
  const { activeSessionId, setSession } = useSessionStore();

  const [prompt, setPrompt] = useState("");
  const [cards, setCards] = useState<VisualCard[]>([]);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [savedCollections, setSavedCollections] = useState<CardCollection[]>([]);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [showTeachMode, setShowTeachMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<VisualCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (!activeSessionId) {
      createSession()
        .then((sessionId) => setSession(sessionId))
        .catch((error) => setStatus(error.message));
    }
  }, [activeSessionId, setSession]);

  useEffect(() => {
    const userCollections = getUserCollections();
    setSavedCollections(getAllCollections(userCollections));
  }, []);

  const handleGenerate = () => {
    if (!prompt || !activeSessionId) return;

    setStatus(null);
    startTransition(() => {
      generateCards(activeSessionId, prompt)
        .then((generated) => {
          setCards(generated);
          setPrompt("");
          setShowDialog(false);
        })
        .catch((error) => setStatus(error.message));
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCards = [...cards];
    const draggedCard = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(index, 0, draggedCard);

    setCards(newCards);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId));
  };

  const handleSaveOrder = async () => {
    if (!activeSessionId) return;

    setIsSaving(true);
    try {
      await saveCardOrder(activeSessionId, cards);
      setStatus("Card order saved successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("Failed to save card order");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCollection = () => {
    if (!collectionName.trim() || cards.length === 0) return;

    const collection = saveCollection(collectionName.trim(), cards);
    setCurrentCollectionId(collection.id);
    const userCollections = getUserCollections();
    setSavedCollections(getAllCollections(userCollections));
    setCollectionName("");
    setShowSaveDialog(false);
    setStatus("Collection saved successfully!");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleLoadCollection = (collection: CardCollection) => {
    setCards(collection.cards);
    setCurrentCollectionId(collection.id);
    setStatus(`Loaded collection: ${collection.name}`);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDeleteCollection = (id: string) => {
    if (isDemoCollection(id)) {
      setStatus("Cannot delete demo collections");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    const success = deleteCollection(id);
    if (success) {
      const userCollections = getUserCollections();
      setSavedCollections(getAllCollections(userCollections));
      if (currentCollectionId === id) {
        setCurrentCollectionId(null);
      }
      setStatus("Collection deleted");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleImageUpload = (cardId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setCards(cards.map(card =>
        card.id === cardId ? { ...card, imageUrl } : card
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditCard = (card: VisualCard) => {
    setEditingCard(card);
    setEditTitle(card.title);
    setEditDescription(card.description || "");
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingCard || !editTitle.trim()) return;

    setCards(cards.map(card =>
      card.id === editingCard.id
        ? { ...card, title: editTitle.trim(), description: editDescription.trim() }
        : card
    ));

    setShowEditDialog(false);
    setEditingCard(null);
    setEditTitle("");
    setEditDescription("");
    setStatus("Card updated successfully!");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingCard(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleStartTeachMode = () => {
    setCurrentCardIndex(0);
    setShowTeachMode(true);
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleCloseTeachMode = () => {
    setShowTeachMode(false);
    setCurrentCardIndex(0);
  };

  // Keyboard navigation for teach mode
  useEffect(() => {
    if (!showTeachMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevCard();
      } else if (e.key === "ArrowRight") {
        handleNextCard();
      } else if (e.key === "Escape") {
        handleCloseTeachMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTeachMode, currentCardIndex, cards.length]);

  const currentCard = cards[currentCardIndex];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Teaching Cards</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create and organize visual cards for teaching concepts, routines, or procedures
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FolderOpen className="h-4 w-4" />
                Load Collection
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Saved Collections</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {savedCollections.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-slate-500">
                  No saved collections
                </div>
              ) : (
                savedCollections.map((collection) => {
                  const isDemo = isDemoCollection(collection.id);
                  return (
                    <DropdownMenuItem
                      key={collection.id}
                      className="flex items-center justify-between"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <button
                        onClick={() => handleLoadCollection(collection)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{collection.name}</span>
                          {isDemo && (
                            <Lock className="h-3 w-3 text-slate-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {collection.cards.length} cards
                        </div>
                      </button>
                      {!isDemo && (
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="ml-2 rounded p-1 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4" />
            Generate New Cards
          </Button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Create Teaching Cards</DialogTitle>
            <DialogDescription>
              Describe what you want to teach and AI will generate visual cards for you
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPrompt(event.target.value)}
              className="min-h-[200px] w-full rounded-lg border border-slate-200 p-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              placeholder="Example: Teach how to brush teeth step by step"
              autoFocus
            />

            {status && (
              <p className={`text-sm ${status.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {status}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt || !activeSessionId || isPending}
            >
              {isPending ? "Generating..." : "Generate Cards"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {cards.length > 0 && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Reorder Teaching Cards</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Drag and drop cards to arrange them in the desired teaching sequence
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveOrder}
                  disabled={isSaving}
                  variant="outline"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Order"}
                </Button>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  Save as Collection
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition ${draggedIndex === index ? "opacity-50" : "hover:border-brand hover:shadow-sm"
                    }`}
                >
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 group">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.title}
                        width={64}
                        height={64}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🎨</span>
                    )}
                    <button
                      onClick={() => fileInputRefs.current[card.id]?.click()}
                      className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition group-hover:opacity-100"
                    >
                      <Upload className="h-5 w-5 text-white" />
                    </button>
                    <input
                      ref={(el) => { fileInputRefs.current[card.id] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(card.id, e)}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <h4 className="font-medium text-slate-900">{card.title}</h4>
                    </div>
                    {card.description && (
                      <p className="mt-1 text-sm text-slate-600">{card.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartEditCard(card)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    aria-label="Edit card"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove card"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Preview</h3>
                <p className="mt-1 text-xs text-slate-500">
                  This is how the cards will appear in teaching mode
                </p>
              </div>
              <Button
                onClick={handleStartTeachMode}
                className="bg-brand hover:bg-brand/90"
              >
                <Play className="h-4 w-4" />
                Start Teaching
              </Button>
            </div>
            <CardBoard cards={cards} onSelect={() => { }} />
          </div>
        </>
      )}

      {cards.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-sm text-slate-500">
          Generate cards above to start creating your teaching sequence
        </div>
      )}

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Save Collection</DialogTitle>
            <DialogDescription>
              Give your card collection a name to save it for later use
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g., Morning Routine, Brushing Teeth"
              className="w-full"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCollection}
              disabled={!collectionName.trim() || cards.length === 0}
            >
              Save Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the title and description for this card
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                className="min-h-[100px] w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                placeholder="Card description (optional)"
              />
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

      {/* Teach Mode Dialog */}
      <Dialog
        open={showTeachMode}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseTeachMode();
          } else {
            setShowTeachMode(true);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full border-none bg-slate-900 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Teach Mode</DialogTitle>
            <DialogDescription>Step through the teaching cards sequentially.</DialogDescription>
          </DialogHeader>
          <div className="flex h-full flex-col text-white">
            <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Teach Mode
                </p>
                <h2 className="text-lg font-semibold">
                  {currentCollectionId
                    ? savedCollections.find(c => c.id === currentCollectionId)?.name ?? "Active Collection"
                    : "Active Collection"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">
                  Step {currentCardIndex + 1} of {cards.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={handleCloseTeachMode}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-8 py-10 text-center">
              {currentCard ? (
                <>
                  <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-slate-800/60">
                    {currentCard.imageUrl ? (
                      <Image
                        src={currentCard.imageUrl}
                        alt={currentCard.title}
                        width={192}
                        height={192}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="text-6xl">🎯</span>
                    )}
                  </div>
                  <div className="max-w-3xl space-y-3">
                    <h3 className="text-3xl font-semibold">{currentCard.title}</h3>
                    {currentCard.description && (
                      <p className="text-lg text-slate-300">{currentCard.description}</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-lg text-slate-300">
                  No card selected. Close to return.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 bg-slate-950/80 px-6 py-4">
              <Button
                variant="ghost"
                className="gap-2 text-slate-200 hover:bg-slate-800 hover:text-white"
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </Button>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                  <span
                    className="block h-full rounded-full bg-brand transition-all"
                    style={{
                      width: `${cards.length > 1 ? (currentCardIndex / (cards.length - 1)) * 100 : 100}%`
                    }}
                  />
                </span>
                <span>
                  {currentCardIndex + 1}/{cards.length}
                </span>
              </div>
              <Button
                variant="ghost"
                className="gap-2 text-slate-200 hover:bg-slate-800 hover:text-white"
                onClick={handleNextCard}
                disabled={currentCardIndex >= cards.length - 1}
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}