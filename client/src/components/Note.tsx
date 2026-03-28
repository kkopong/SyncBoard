/**
 * Draggable sticky note: Framer Motion for drag + corner resize, local state for edit mode.
 * Persists position/size/text/votes through Board’s onUpdate callback (InsForge DB + realtime).
 */
import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { Trash2, GripHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useUser } from '@insforge/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merges Tailwind class strings and resolves conflicts (tailwind-merge + clsx). */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NoteProps {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  upvotes: number;
  downvotes: number;
  upvoted_by: string[];
  downvoted_by: string[];
  onUpdate: (id: string, updates: Partial<{ text: string, x: number, y: number, width: number, height: number, upvotes: number, downvotes: number, upvoted_by: string[], downvoted_by: string[] }>) => void;
  onDelete: (id: string) => void;
  dragConstraints?: React.RefObject<HTMLDivElement | null>;
}

export const Note = ({ id, text, x: initialX, y: initialY, width: initialWidth, height: initialHeight, color, upvoted_by = [], downvoted_by = [], onUpdate, onDelete, dragConstraints }: NoteProps) => {
  const { user } = useUser();
  const userId = user?.id || '';
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text);
  const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  
  /** Framer Motion motion values — pixel offsets from the board’s top-left. */
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  // Keep the textarea in sync when realtime updates change `text` from another tab.
  useEffect(() => {
    setLocalText(text);
  }, [text]);

  // Remote resizes or reloads can change width/height props without remounting the note.
  useEffect(() => {
    setDimensions({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight]);

  // Update position on drag end
  const handleDragEnd = () => {
    onUpdate(id, { x: x.get(), y: y.get() });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Avoid a no-op write when nothing changed (reduces churn on the wire).
    if (localText !== text) {
      onUpdate(id, { text: localText });
    }
  };

  // Custom Resize Logic with Bounds
  const handleResize = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDimensions(prev => {
      let newWidth = Math.max(160, prev.width + info.delta.x);
      let newHeight = Math.max(120, prev.height + info.delta.y);
      
      // Strict constraint to prevent note from expanding beyond viewport
      const currentX = typeof x.get() === 'number' ? x.get() : 0;
      const currentY = typeof y.get() === 'number' ? y.get() : 0;
      const maxW = window.innerWidth - currentX - 10;
      const maxH = window.innerHeight - currentY - 10;

      newWidth = Math.min(newWidth, maxW);
      newHeight = Math.min(newHeight, maxH);

      return { width: newWidth, height: newHeight };
    });
  };

  /** Flush final width/height after the user finishes dragging the corner handle. */
  const handleResizeEnd = () => {
    onUpdate(id, { width: dimensions.width, height: dimensions.height });
  };

  return (
    <motion.div
      ref={noteRef}
      drag
      dragConstraints={dragConstraints}
      dragMomentum={false}
      style={{ 
        x, 
        y, 
        width: dimensions.width, 
        height: dimensions.height,
        minWidth: 160,
        minHeight: 120
      }}
      onDragEnd={handleDragEnd}
      className={cn(
        // `color` is a Tailwind bg-* class from Board.COLORS; sticky-note adds drop shadow in index.css.
        "absolute p-5 rounded-2xl sticky-note flex flex-col gap-3 cursor-grab active:cursor-grabbing overflow-hidden group/note shadow-xl transition-shadow hover:shadow-2xl",
        "select-none border border-black/5", // Removed CSS resize
        color
      )}
    >
      {/* Header with drag handle and delete */}
      <div className="flex items-center justify-between shrink-0">
        <div className="text-black/20 group-hover/note:text-black/40 transition-colors">
          <GripHorizontal size={18} />
        </div>
        <button 
          onClick={() => onDelete(id)}
          className="p-1 rounded-lg hover:bg-black/5 text-black/20 hover:text-red-500 transition-all cursor-pointer z-10 bg-transparent border-none"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content area - padded and scrollable */}
      <div className="flex-1 min-h-0 overflow-auto no-scrollbar pointer-events-auto">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            autoFocus
            value={localText}
            onChange={handleTextChange}
            onBlur={handleBlur}
            placeholder="Type something..."
            className="bg-transparent border-none focus:ring-0 resize-none w-full h-full text-black font-medium text-lg leading-tight p-0 placeholder:text-black/20 block"
            style={{ outline: 'none' }}
          />
        ) : (
          // Single click enters edit mode (footer hint still says “double click” for discoverability).
          <div
            onClick={() => setIsEditing(true)}
            className="w-full h-full text-black font-medium text-lg leading-tight whitespace-pre-wrap cursor-text break-words"
          >
            {text || <span className="text-black/20 italic">Double click to edit...</span>}
          </div>
        )}
      </div>
      
      {/* Metadata and Voting */}
      <div className="flex items-center justify-between mt-auto shrink-0 z-10">
        <div className="text-[10px] text-black/20 font-mono tracking-wider">
          ID: {id.slice(-6).toUpperCase()}
        </div>
        
        {/* Vote chips: toggles membership in upvoted_by / downvoted_by arrays for the current user. */}
        <div className="flex items-center gap-2 bg-black/5 rounded-full px-2 py-1 pointer-events-auto border-none">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const isUpvoted = upvoted_by.includes(userId);
              const isDownvoted = downvoted_by.includes(userId);
              
              const newUpvoted = isUpvoted 
                ? upvoted_by.filter(id => id !== userId) // Toggle off
                : [...upvoted_by, userId]; // Toggle on
                
              const newDownvoted = isDownvoted 
                ? downvoted_by.filter(id => id !== userId) // If downvoted, remove it
                : downvoted_by;

              onUpdate(id, { 
                upvoted_by: newUpvoted, 
                downvoted_by: newDownvoted,
                upvotes: newUpvoted.length,
                downvotes: newDownvoted.length
              });
            }}
            className={cn(
              "flex items-center gap-1 transition-colors bg-transparent border-none p-0",
              upvoted_by.includes(userId) ? "text-emerald-600" : "text-black/40 hover:text-emerald-600"
            )}
          >
            <ThumbsUp size={12} className={upvoted_by.includes(userId) ? "fill-emerald-600/20" : ""} />
            <span className="text-[10px] font-bold">{upvoted_by.length}</span>
          </button>
          
          <div className="w-[1px] h-3 bg-black/10" />
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const isUpvoted = upvoted_by.includes(userId);
              const isDownvoted = downvoted_by.includes(userId);
              
              const newDownvoted = isDownvoted 
                ? downvoted_by.filter(id => id !== userId) // Toggle off
                : [...downvoted_by, userId]; // Toggle on
                
              const newUpvoted = isUpvoted 
                ? upvoted_by.filter(id => id !== userId) // If upvoted, remove it
                : upvoted_by;

              onUpdate(id, { 
                upvoted_by: newUpvoted, 
                downvoted_by: newDownvoted,
                upvotes: newUpvoted.length,
                downvotes: newDownvoted.length
              });
            }}
            className={cn(
              "flex items-center gap-1 transition-colors bg-transparent border-none p-0",
              downvoted_by.includes(userId) ? "text-rose-600" : "text-black/40 hover:text-rose-600"
            )}
          >
            <ThumbsDown size={12} className={downvoted_by.includes(userId) ? "fill-rose-600/20" : ""} />
            <span className="text-[10px] font-bold">{downvoted_by.length}</span>
          </button>
        </div>
      </div>

      {/* Custom Resize Handle */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDrag={handleResize}
        onDragEnd={handleResizeEnd}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize flex items-end justify-end opacity-0 group-hover/note:opacity-50 transition-opacity z-20"
      >
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" className="text-black/50 pointer-events-none">
          <path d="M 8 10 L 10 8 M 5 10 L 10 5 M 2 10 L 10 2" strokeWidth="1" />
        </svg>
      </motion.div>
    </motion.div>
  );
};
