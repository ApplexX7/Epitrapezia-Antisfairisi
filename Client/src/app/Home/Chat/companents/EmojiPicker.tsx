import { useState, useEffect, useRef } from "react";

const emojiCategories = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestures': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Objects': ['🎉', '🎊', '🎈', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🎮', '🎯', '🎲', '🎰', '🔥', '⭐', '✨', '💫', '🌟', '⚡', '💥', '💢', '💨', '💦']
} as const;

type EmojiCategory = keyof typeof emojiCategories;

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>('Smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('recent-emojis');
    if (stored) {
      setRecentEmojis(JSON.parse(stored));
    }
  }, []);

  const addEmoji = (emoji: string) => {
    onEmojiSelect(emoji);
    
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      const updated = [emoji, ...filtered].slice(0, 20);
      localStorage.setItem('recent-emojis', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div
      ref={emojiPickerRef}
      className="absolute left-0 bottom-full mb-2 w-full max-w-sm bg-white/95 backdrop-blur-sm 
        rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden"
    >
      {recentEmojis.length > 0 && (
        <div className="p-2 md:p-3 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2">RECENT</p>
          <div className="flex flex-wrap gap-1">
            {recentEmojis.slice(0, 15).map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => addEmoji(emoji)}
                className="text-xl md:text-2xl hover:bg-gray-100 rounded-lg p-1 md:p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 p-2 border-b border-gray-200 overflow-x-auto">
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as EmojiCategory)}
            className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm 
              font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-[#D1DAE9] text-black-nave'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="p-2 md:p-3 max-h-48 md:max-h-64 overflow-y-auto">
        <div className="grid grid-cols-6 md:grid-cols-8 gap-1">
          {emojiCategories[selectedCategory].map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => addEmoji(emoji)}
              className="text-xl md:text-2xl hover:bg-gray-100 rounded-lg 
                p-1 md:p-2 transition-all hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};