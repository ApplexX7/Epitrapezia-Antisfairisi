import { useState, useEffect, useRef } from "react";
import { Plus, X } from "@phosphor-icons/react/ssr";
import { EmojiPicker } from "./EmojiPicker";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
}

export const ChatInput = ({
  inputMessage,
  setInputMessage,
  onSendMessage
}: ChatInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(inputMessage + emoji);
  };

  return (
    <div className="p-3 md:p-4 bg-[#D1DAE9]/20 border-t border-none rounded-br-xl">
      <div className="w-full">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex-1 relative" ref={emojiPickerRef}>
            <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex items-center justify-center transition-colors hover:opacity-70">
                {showEmojiPicker ? (
                  <X size={24} weight="bold" className="md:w-[30px] md:h-[30px]" />
                ) : (
                  <Plus size={24} weight="bold" className="md:w-[30px] md:h-[30px]" />
                )}
              </button>
            </div>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write Something"
              className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-3 md:py-4 bg-[#D1DAE9]/30 rounded-xl 
                text-black-nave font-bold boder-none text-sm md:text-base
                shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] 
                focus:outline-none focus:ring-1 focus:ring-white
                placeholder:text-black-nave/80"
            />
            
            {showEmojiPicker && (
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            )}
          </div>
          
          <button
            onClick={onSendMessage}
            className="px-4 md:px-8 py-3 md:py-4 bg-[#D1DAE9]/30 hover:bg-black/30 
              text-black-nave rounded-xl font-bold text-sm md:text-base
              shadow-[2px_2px_5px_rgba(0,0,0,0.3)] focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};