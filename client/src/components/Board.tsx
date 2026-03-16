import { useState, useCallback, useEffect, useRef } from 'react';
import { Note } from './Note';
import { Plus, LogOut, Share2, Check } from 'lucide-react';
import { nanoid } from 'nanoid';
import { insforge } from '../lib/insforge';
import { useAuth, useUser } from '@insforge/react';

const COLORS = [
  'bg-yellow-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-orange-200',
];

interface NoteData {
  id: string;
  board_id: string;
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
}

export const Board = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [boardId, setBoardId] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize Board ID from URL or generate new one
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('board');
    if (!id) {
      id = nanoid(10);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('board', id);
      window.history.pushState({}, '', newUrl);
    }
    setBoardId(id);
  }, []);

  const channelName = boardId ? `room:${boardId}` : '';

  // Fetch initial notes
  const fetchNotes = useCallback(async () => {
    if (!boardId) return;
    const { data, error } = await insforge.database
      .from('notes')
      .select('*')
      .eq('board_id', boardId);
    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }
    if (data) setNotes(data);
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;
    fetchNotes();

    // Setup Realtime
    const setupRealtime = async () => {
      insforge.realtime.on('connect', () => {
        setIsConnected(true);
      });

      insforge.realtime.on('connect_error', () => {
        setIsConnected(false);
      });

      await insforge.realtime.connect();

      const sub = await insforge.realtime.subscribe(channelName);
      if (!sub.ok) console.error('Failed to subscribe');

      insforge.realtime.on(channelName, (message: any) => {
        const { event, payload } = message;
        
        switch (event) {
          case 'note-created':
            setNotes(prev => [...prev.filter(n => n.id !== payload.id), payload]);
            break;
          case 'note-moved':
          case 'note-updated':
            setNotes(prev => prev.map(n => n.id === payload.id ? { ...n, ...payload } : n));
            break;
          case 'note-deleted':
            setNotes(prev => prev.filter(n => n.id !== payload.id));
            break;
        }
      });
    };

    setupRealtime();

    return () => {
      if (channelName) insforge.realtime.unsubscribe(channelName);
    };
  }, [fetchNotes, boardId, channelName]);

  const addNote = useCallback(async () => {
    if (!boardId) return;
    const newNote: NoteData = {
      id: nanoid(),
      board_id: boardId,
      text: '',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 256,
      height: 160,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      upvotes: 0,
      downvotes: 0,
      upvoted_by: [],
      downvoted_by: [],
    };
    
    // Optimistic update
    setNotes(prev => [...prev, newNote]);

    // Persist
    const { error } = await insforge.database.from('notes').insert(newNote);
    if (!error) {
      insforge.realtime.publish(channelName, 'note-created', newNote);
    }
  }, [boardId, channelName]);

  const updateNote = useCallback(async (id: string, updates: Partial<NoteData>) => {
    // Optimistic update
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));

    // Persist
    const { error } = await insforge.database.from('notes').update(updates).eq('id', id);
    if (!error) {
      insforge.realtime.publish(channelName, 'note-updated', { id, ...updates });
    }
  }, [channelName]);

  const deleteNote = useCallback(async (id: string) => {
    // Optimistic update
    setNotes(prev => prev.filter(note => note.id !== id));

    // Persist
    const { error } = await insforge.database.from('notes').delete().eq('id', id);
    if (!error) {
      insforge.realtime.publish(channelName, 'note-deleted', { id });
    }
  }, [channelName]);

  const copyBoardLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div ref={boardRef} className="w-screen h-screen overflow-hidden canvas-grid relative bg-slate-50">
      <div className="absolute top-6 left-6 z-10 flex items-center gap-6 bg-white/80 backdrop-blur-md p-2 px-4 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">SyncBoard</h1>
        
        <div className="h-6 w-[1px] bg-slate-200" />

        <button
          onClick={addNote}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95 text-sm font-semibold"
        >
          <Plus size={18} />
          <span>New Note</span>
        </button>

        <button
          onClick={copyBoardLink}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all border text-sm font-semibold ${
            isCopied 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isCopied ? <Check size={18} /> : <Share2 size={18} />}
          <span>{isCopied ? 'Copied Link' : 'Share Board'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 bg-slate-300 rounded-full" />
              Connecting...
            </span>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</span>
            <span className="text-xs font-semibold text-slate-700">{user?.email}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-slate-400 select-none text-sm bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full border border-white/50">
        Drag notes to move • Double click to edit
      </div>

      <div className="relative w-full h-full pointer-events-auto">
        {notes.map(note => (
          <Note
            key={note.id}
            {...note}
            onUpdate={updateNote}
            onDelete={deleteNote}
            dragConstraints={boardRef}
          />
        ))}
      </div>
    </div>
  );
};
