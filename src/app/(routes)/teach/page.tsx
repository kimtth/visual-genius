"use client";

import { ChangeEvent, useEffect, useState, useTransition, useRef } from "react";
import Image from "next/image";
import { useSessionStore } from "@/lib/state/sessionStore";
import { useAuthStore } from "@/lib/state/authStore";
import { VisualCard } from "@/lib/constants/presets";
import { CardBoard } from "@/components/cards/CardBoard";
import { GripVertical, Save, Trash2, Plus, FolderOpen, Upload, Lock, Play, ChevronLeft, ChevronRight, X, Edit, Search, Check } from "lucide-react";
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
import { AuthGuard } from "@/components/auth/AuthGuard";

async function createSession(parentUserId: string) {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentId: "demo-parent", childId: "demo-child", parentUserId })
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

async function saveCardOrder(sessionId: string, cards: VisualCard[], collectionId?: string) {
  if (collectionId) {
    // Update existing collection's card order
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateOrder", collectionId, cards })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to save card order");
    }
    return true;
  }
  return false;
}

async function fetchCollections(userId: string) {
  const response = await fetch(`/api/collections?userId=${userId}`);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to fetch collections");
  }
  return payload.collections as CardCollection[];
}

async function saveCollection(name: string, cards: VisualCard[], userId: string): Promise<string> {
  const response = await fetch("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", name, cards, userId })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to save collection");
  }
  return payload.collectionId;
}

async function deleteCollectionById(id: string) {
  // Prevent deletion of demo collections
  if (isDemoCollection(id)) {
    return false;
  }
  const response = await fetch("/api/collections", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collectionId: id })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to delete collection");
  }
  return true;
}

export default function TeachPage() {
  const { activeSessionId, setSession } = useSessionStore();
  const user = useAuthStore((state) => state.user);

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
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState<Array<{ id: string; thumbnailUrl: string; contentUrl: string; name: string }>>([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  useEffect(() => {
    if (!activeSessionId && user?.id) {
      createSession(user.id)
        .then((sessionId) => setSession(sessionId))
        .catch((error) => setStatus(error.message));
    }
  }, [activeSessionId, setSession, user?.id]);

  useEffect(() => {
    // Fetch collections from database
    if (!user?.id) return;
    
    fetchCollections(user.id)
      .then((userCollections) => {
        setSavedCollections(getAllCollections(userCollections));
      })
      .catch((error) => {
        console.error("Failed to fetch collections:", error);
        setStatus("Failed to load collections");
      });
  }, [user?.id]);

  const handleGenerate = () => {
    if (!prompt || !activeSessionId) return;

    setStatus("Generating cards...");
    startTransition(() => {
      generateCards(activeSessionId, prompt)
        .then((generated) => {
          setCards(generated);
          setPrompt("");
          setShowDialog(false);
          setStatus(null);
        })
        .catch((error) => {
          setStatus(`❌ ${error.message}`);
          setTimeout(() => setStatus(null), 3000);
        });
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
    if (!activeSessionId) {
      setStatus("No active session. Please refresh the page.");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    if (!currentCollectionId) {
      setStatus("Please save as a collection first before updating card order.");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setIsSaving(true);
    setStatus("Saving card order...");
    
    try {
      // Create a fresh array to ensure proper serialization
      const orderedCards = cards.map((card, index) => ({
        ...card,
        // Ensure all fields are present
        id: card.id,
        title: card.title,
        description: card.description || "",
        category: card.category,
        imageUrl: card.imageUrl || "",
        createdAt: card.createdAt
      }));
      
      await saveCardOrder(activeSessionId, orderedCards, currentCollectionId);
      
      // Refresh collections to reflect the update
      if (user?.id) {
        const userCollections = await fetchCollections(user.id);
        setSavedCollections(getAllCollections(userCollections));
      }
      
      setStatus("✅ Card order saved successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Failed to save card order:", error);
      setStatus("❌ Failed to save card order");
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCollection = async () => {
    if (!collectionName.trim() || cards.length === 0) return;

    try {
      // Normalize cards before saving
      const normalizedCards = cards.map(card => ({
        ...card,
        id: card.id,
        title: card.title,
        description: card.description || "",
        category: card.category,
        imageUrl: card.imageUrl || "",
        createdAt: card.createdAt
      }));
      
      if (!user?.id) {
        setStatus("User authentication required");
        return;
      }
      
      const collectionId = await saveCollection(collectionName.trim(), normalizedCards, user.id);
      setCurrentCollectionId(collectionId);
      
      // Refresh collections list
      const userCollections = await fetchCollections(user.id);
      setSavedCollections(getAllCollections(userCollections));
      
      setCollectionName("");
      setShowSaveDialog(false);
      setStatus("Collection saved successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Failed to save collection:", error);
      setStatus("❌ Failed to save collection");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleLoadCollection = (collection: CardCollection) => {
    // Create a deep copy to ensure proper state updates
    setCards([...collection.cards]);
    setCurrentCollectionId(collection.id);
    setStatus(`Loaded collection: ${collection.name}`);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDeleteCollection = async (id: string) => {
    if (isDemoCollection(id)) {
      setStatus("Cannot delete demo collections");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    try {
      const success = await deleteCollectionById(id);
      if (success && user?.id) {
        // Refresh collections list
        const userCollections = await fetchCollections(user.id);
        setSavedCollections(getAllCollections(userCollections));
        
        if (currentCollectionId === id) {
          setCurrentCollectionId(null);
        }
        setStatus("Collection deleted");
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      console.error("Failed to delete collection:", error);
      setStatus("❌ Failed to delete collection");
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
    setSelectedImageUrl(card.imageUrl || "");
    setImageSearchQuery(card.title); // Pre-fill with card title
    setImageSearchResults([]);
    setShowEditDialog(true);
    
    // Auto-search for images when opening edit dialog
    setTimeout(() => {
      if (card.title) {
        handleSearchImagesWithQuery(card.title);
      }
    }, 100);
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

    // If this card belongs to a saved collection, update it in the database
    if (currentCollectionId && activeSessionId) {
      try {
        const normalizedCards = updatedCards.map(card => ({
          ...card,
          id: card.id,
          title: card.title,
          description: card.description || "",
          category: card.category,
          imageUrl: card.imageUrl || "",
          createdAt: card.createdAt
        }));
        
        await saveCardOrder(activeSessionId, normalizedCards, currentCollectionId);
        
        // Refresh collections to reflect the update
        if (user?.id) {
          const userCollections = await fetchCollections(user.id);
          setSavedCollections(getAllCollections(userCollections));
        }
        
        setStatus("✅ Card updated and saved to collection!");
      } catch (error) {
        console.error("Failed to save updated card:", error);
        setStatus("⚠️ Card updated locally but not saved to collection");
      }
    } else {
      setStatus("Card updated successfully!");
    }

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
    <AuthGuard>
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
              disabled={isPending}
            />

            {status && (
              <div className={`rounded-lg p-3 text-sm ${
                status.includes("✅") || status.includes("success") 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : status.includes("❌") || status.includes("Failed")
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}>
                {isPending && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span>{status}</span>
                  </div>
                )}
                {!isPending && status}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDialog(false);
                setStatus(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt || !activeSessionId || isPending}
              className="min-w-[140px]"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {cards.length > 0 && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
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

            {status && (
              <div className={`mb-4 rounded-lg p-3 text-sm ${
                status.includes("✅") || status.includes("success") 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : status.includes("❌") || status.includes("Failed")
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}>
                {status}
              </div>
            )}

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
    </AuthGuard>
  );
}