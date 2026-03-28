import { InsforgeProvider, useUser } from '@insforge/react';
import { insforge } from './lib/insforge';
import { Board } from './components/Board';
import { Auth } from './components/Auth';
import './App.css';

function Application() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[100dvh] h-[100dvh] w-full items-center justify-center bg-slate-950 canvas-grid">
        <div className="w-12 h-12 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Board /> : <Auth />;
}

function App() {
  return (
    <InsforgeProvider client={insforge}>
      <Application />
    </InsforgeProvider>
  );
}

export default App;
