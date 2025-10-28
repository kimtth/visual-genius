"use client";

interface TimelineEntry {
  createdAt: string;
  speaker: string;
  card: {
    title: string;
  };
}

interface ConversationTimelineProps {
  log: TimelineEntry[];
}

export function ConversationTimeline({ log }: ConversationTimelineProps) {
  if (log.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-500">
        No conversation yet
      </div>
    );
  }

  // Group consecutive entries by speaker and timestamp proximity (within 5 seconds)
  const groupedMessages: Array<{
    speaker: string;
    cards: string[];
    createdAt: string;
  }> = [];

  log.forEach((entry, index) => {
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    const currentTime = new Date(entry.createdAt).getTime();
    const lastTime = lastGroup ? new Date(lastGroup.createdAt).getTime() : 0;
    const timeDiff = Math.abs(currentTime - lastTime);

    // Group if same speaker and within 5 seconds
    if (lastGroup && lastGroup.speaker === entry.speaker && timeDiff < 5000) {
      lastGroup.cards.push(entry.card.title);
    } else {
      groupedMessages.push({
        speaker: entry.speaker,
        cards: [entry.card.title],
        createdAt: entry.createdAt,
      });
    }
  });

  return (
    <div className="space-y-4">
      {groupedMessages.map((message, index) => {
        const isParent = message.speaker === "parent";
        const isChild = message.speaker === "child";

        return (
          <div
            key={`msg-${index}`}
            className={`flex ${isChild ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isParent
                  ? "bg-slate-100 text-slate-900"
                  : "bg-brand text-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold opacity-75">
                  {isParent ? "Parent" : "Child"}
                </span>
                <span className="text-xs opacity-60">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-sm break-words space-y-1">
                {message.cards.map((cardTitle, cardIndex) => (
                  <p key={cardIndex}>{cardTitle}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
