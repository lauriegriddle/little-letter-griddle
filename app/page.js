'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { X, Volume2, VolumeX, HelpCircle, Share2, Bookmark, RefreshCw, Instagram } from 'lucide-react';
import { 
  getTodaysPuzzle, 
  getTimeUntilNextPuzzle, 
  getTodaysWelcomeMessage,
  getTodaysCompletionMessage,
  moonPhases,
  getCurrentMoonPhase
} from './puzzles';

export default function LittleLetterGriddle() {
  // Get today's puzzle
  const gameData = getTodaysPuzzle();
  const todaysWelcome = getTodaysWelcomeMessage();
  const todaysMessage = getTodaysCompletionMessage();

  // Scramble letters for each word
  const scrambleWord = useCallback((word) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  }, []);

  // State - initialize with null to avoid hydration mismatch
  const [wordStates, setWordStates] = useState(null);
  const [hintsRevealed, setHintsRevealed] = useState(Array(3).fill(false));
  const [selectedLetter, setSelectedLetter] = useState({ wordIdx: null, letterIdx: null, source: null });
  const [selectedSlot, setSelectedSlot] = useState({ wordIdx: null, slotIdx: null });
  const [wrongPlacements, setWrongPlacements] = useState({});
  const [celebratingWord, setCelebratingWord] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showMoonModal, setShowMoonModal] = useState(false);
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  
  // Timer states
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  // Music states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(1);
  const audioRef = useRef(null);
  
  // Clipboard state
  const [copied, setCopied] = useState(false);
  
  // Stars state (generated on client only to avoid hydration mismatch)
  const [stars, setStars] = useState([]);
  
  // Stats state (loaded from localStorage)
  const [stats, setStats] = useState({
    puzzlesCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedPuzzle: null
  });

  const currentMoonPhase = getCurrentMoonPhase(stats.puzzlesCompleted);
  const allComplete = wordStates ? wordStates.every(w => w.completed) : false;

  // Load stats and check first visit on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Load stats
      const savedStats = localStorage.getItem('littleGriddleStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
      
      // Check if welcome should show (once per day)
const lastWelcomeDate = localStorage.getItem('littleGriddleLastWelcome');
const today = new Date().toDateString();

if (lastWelcomeDate !== today) {
  setShowWelcomeModal(true);
  localStorage.setItem('littleGriddleLastWelcome', today);
}
      
      // Check if today's puzzle already completed
      const savedGame = localStorage.getItem(`littleGriddle_${gameData.puzzleNumber}`);
      if (savedGame) {
        const parsed = JSON.parse(savedGame);
        setWordStates(parsed.wordStates);
        setHintsRevealed(parsed.hintsRevealed || Array(3).fill(false));
        if (parsed.elapsedTime) setElapsedTime(parsed.elapsedTime);
      } else {
        // Initialize word states with scrambled letters (client-side only)
        const initialStates = gameData.words.map(w => ({
          placed: Array(w.word.length).fill(''),
          available: scrambleWord(w.word),
          completed: false
        }));
        setWordStates(initialStates);
        // Start timer for new puzzle
        setStartTime(Date.now());
      }
    }
  }, [gameData.puzzleNumber, gameData.words, scrambleWord]);

  // Generate stars on client side only (avoids hydration mismatch)
  useEffect(() => {
    const generatedStars = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setStars(generatedStars);
  }, []);

  // Save game state
  useEffect(() => {
    if (typeof window !== 'undefined' && wordStates) {
      localStorage.setItem(`littleGriddle_${gameData.puzzleNumber}`, JSON.stringify({
        wordStates,
        hintsRevealed,
        elapsedTime
      }));
    }
  }, [wordStates, hintsRevealed, elapsedTime, gameData.puzzleNumber]);

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const time = getTimeUntilNextPuzzle();
      setCountdown(time);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time while playing
  useEffect(() => {
    if (startTime && !allComplete) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, allComplete]);

  // Check if word is complete
  const checkWordComplete = (wordIdx, placed) => {
    const targetWord = gameData.words[wordIdx].word;
    const currentWord = placed.join('');
    return currentWord === targetWord;
  };

  // Handle game completion
  useEffect(() => {
    if (allComplete && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      
      // Update stats
      if (typeof window !== 'undefined') {
        const savedStats = localStorage.getItem('littleGriddleStats');
        let currentStats = savedStats ? JSON.parse(savedStats) : {
          puzzlesCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedPuzzle: null
        };
        
        // Only update if this puzzle hasn't been completed before
        if (currentStats.lastCompletedPuzzle !== gameData.puzzleNumber) {
          currentStats.puzzlesCompleted += 1;
          
          // Check streak
          const yesterday = gameData.puzzleNumber - 1;
          if (currentStats.lastCompletedPuzzle === yesterday) {
            currentStats.currentStreak += 1;
          } else if (currentStats.lastCompletedPuzzle !== gameData.puzzleNumber) {
            currentStats.currentStreak = 1;
          }
          
          if (currentStats.currentStreak > currentStats.longestStreak) {
            currentStats.longestStreak = currentStats.currentStreak;
          }
          
          currentStats.lastCompletedPuzzle = gameData.puzzleNumber;
          
          localStorage.setItem('littleGriddleStats', JSON.stringify(currentStats));
          setStats(currentStats);
          
          // Show bookmark modal after completion if not shown before
          const bookmarkShown = localStorage.getItem('littleGriddleBookmarkShown');
          if (!bookmarkShown) {
            setTimeout(() => {
              setShowBookmarkModal(true);
              localStorage.setItem('littleGriddleBookmarkShown', 'true');
            }, 5000);
          }
        }
      }
    }
  }, [allComplete, showConfetti, gameData.puzzleNumber]);

  // Handle clicking a letter in the scrambled area
  const handleAvailableLetterClick = (wordIdx, letterIdx) => {
    if (wordStates[wordIdx].completed) return;
    setActiveWordIdx(wordIdx);

    if (selectedSlot.wordIdx === wordIdx && selectedSlot.slotIdx !== null) {
      placeLetter(wordIdx, letterIdx, selectedSlot.slotIdx);
    } else {
      setSelectedLetter({ wordIdx, letterIdx, source: 'available' });
      setSelectedSlot({ wordIdx: null, slotIdx: null });
    }
  };

  // Handle clicking a slot in the word area
  const handleSlotClick = (wordIdx, slotIdx) => {
    if (wordStates[wordIdx].completed) return;
    setActiveWordIdx(wordIdx);

    const currentPlaced = wordStates[wordIdx].placed[slotIdx];

    if (currentPlaced) {
      // Return letter to available
      setWordStates(prev => {
        const newStates = [...prev];
        const newPlaced = [...newStates[wordIdx].placed];
        const newAvailable = [...newStates[wordIdx].available, currentPlaced];
        newPlaced[slotIdx] = '';
        newStates[wordIdx] = {
          ...newStates[wordIdx],
          placed: newPlaced,
          available: newAvailable
        };
        return newStates;
      });
      setSelectedLetter({ wordIdx: null, letterIdx: null, source: null });
      setSelectedSlot({ wordIdx: null, slotIdx: null });
      setWrongPlacements(prev => {
        const newWrong = {...prev};
        delete newWrong[`${wordIdx}-${slotIdx}`];
        return newWrong;
      });
    } else if (selectedLetter.wordIdx === wordIdx && selectedLetter.source === 'available') {
      placeLetter(wordIdx, selectedLetter.letterIdx, slotIdx);
    } else {
      setSelectedSlot({ wordIdx, slotIdx });
      setSelectedLetter({ wordIdx: null, letterIdx: null, source: null });
    }
  };

  // Place a letter in a slot
  const placeLetter = (wordIdx, letterIdx, slotIdx) => {
    const letterToPlace = wordStates[wordIdx].available[letterIdx];
    const correctLetter = gameData.words[wordIdx].word[slotIdx];

    if (letterToPlace !== correctLetter) {
      setWrongPlacements(prev => ({
        ...prev,
        [`${wordIdx}-${slotIdx}`]: true
      }));
      setTimeout(() => {
        setWrongPlacements(prev => {
          const newWrong = {...prev};
          delete newWrong[`${wordIdx}-${slotIdx}`];
          return newWrong;
        });
      }, 800);
    }

    setWordStates(prev => {
      const newStates = [...prev];
      const newPlaced = [...newStates[wordIdx].placed];
      const newAvailable = [...newStates[wordIdx].available];

      newPlaced[slotIdx] = letterToPlace;
      newAvailable.splice(letterIdx, 1);

      const isComplete = checkWordComplete(wordIdx, newPlaced);

      newStates[wordIdx] = {
        ...newStates[wordIdx],
        placed: newPlaced,
        available: newAvailable,
        completed: isComplete
      };

      if (isComplete) {
        setCelebratingWord(wordIdx);
        setTimeout(() => setCelebratingWord(null), 1500);
        // Move to next incomplete word
        const nextIncomplete = newStates.findIndex((s, i) => i > wordIdx && !s.completed);
        if (nextIncomplete !== -1) {
          setActiveWordIdx(nextIncomplete);
        }
      }

      return newStates;
    });

    setSelectedSlot({ wordIdx: null, slotIdx: null });
    setSelectedLetter({ wordIdx: null, letterIdx: null, source: null });
  };

  // Shuffle letters for a specific word
  const shuffleWord = (wordIdx) => {
    if (wordStates[wordIdx].completed) return;
    
    setWordStates(prev => {
      const newStates = [...prev];
      const currentAvailable = [...newStates[wordIdx].available];
      
      // Fisher-Yates shuffle
      for (let i = currentAvailable.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentAvailable[i], currentAvailable[j]] = [currentAvailable[j], currentAvailable[i]];
      }
      
      newStates[wordIdx] = {
        ...newStates[wordIdx],
        available: currentAvailable
      };
      
      return newStates;
    });
  };

  // Toggle hint
  const toggleHint = (idx) => {
    setHintsRevealed(prev => {
      const newHints = [...prev];
      newHints[idx] = !newHints[idx];
      return newHints;
    });
  };

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if modal is open or game complete
      if (showWelcomeModal || showHowToPlayModal || showBookmarkModal || 
          showStatsModal || showShareModal || showMusicModal || showMoonModal || showLanguagesModal || allComplete) {
        // Allow Escape to close modals
        if (e.key === 'Escape') {
          setShowWelcomeModal(false);
          setShowHowToPlayModal(false);
          setShowBookmarkModal(false);
          setShowStatsModal(false);
          setShowShareModal(false);
          setShowMusicModal(false);
          setShowMoonModal(false);
          setShowLanguagesModal(false);
        }
        return;
      }

      const key = e.key.toUpperCase();
      const currentWord = wordStates[activeWordIdx];
      
      if (currentWord.completed) {
        // Move to next incomplete word
        const nextIncomplete = wordStates.findIndex((s, i) => !s.completed);
        if (nextIncomplete !== -1) setActiveWordIdx(nextIncomplete);
        return;
      }

      // Letter key pressed
      if (/^[A-Z]$/.test(key)) {
        const letterIdx = currentWord.available.findIndex(l => l === key);
        if (letterIdx !== -1) {
          // Find first empty slot
          const emptySlot = currentWord.placed.findIndex(p => p === '');
          if (emptySlot !== -1) {
            placeLetter(activeWordIdx, letterIdx, emptySlot);
          }
        }
      }
      
      // Backspace - remove last placed letter
      if (e.key === 'Backspace') {
        const lastFilledIdx = currentWord.placed.map((p, i) => p ? i : -1).filter(i => i !== -1).pop();
        if (lastFilledIdx !== undefined) {
          handleSlotClick(activeWordIdx, lastFilledIdx);
        }
      }
      
      // Tab - move to next word
      if (e.key === 'Tab') {
        e.preventDefault();
        const direction = e.shiftKey ? -1 : 1;
        let nextIdx = activeWordIdx + direction;
        if (nextIdx >= wordStates.length) nextIdx = 0;
        if (nextIdx < 0) nextIdx = wordStates.length - 1;
        setActiveWordIdx(nextIdx);
      }
      
      // Arrow up/down - move between words
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveWordIdx(prev => prev > 0 ? prev - 1 : wordStates.length - 1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveWordIdx(prev => prev < wordStates.length - 1 ? prev + 1 : 0);
      }
      
      // Space - shuffle current word
      if (e.key === ' ') {
        e.preventDefault();
        shuffleWord(activeWordIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wordStates, activeWordIdx, allComplete, showWelcomeModal, showHowToPlayModal, 
      showBookmarkModal, showStatsModal, showShareModal, showMusicModal, showMoonModal, showLanguagesModal]);

  // Music controls
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const switchTrack = (track) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = `/little-music${track}.mp3`;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  // Share results
  const shareResults = async () => {
  const moons = '🌙'.repeat(wordStates.filter(w => w.completed).length);
  const shareText = `Little Griddle #${gameData.puzzleNumber} 🌙
${gameData.category}
${moons}
${wordStates.filter(w => w.completed).length}/3 words
Play at www.littlelettergriddle.com`;

  if (navigator.share) {
    try {
      await navigator.share({
        text: shareText
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyToClipboard(shareText);
      }
    }
  } else {
    copyToClipboard(shareText);
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

  // Format elapsed time
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return 'less than a minute';
    if (mins === 1) return '1 peaceful minute';
    return `${mins} peaceful minutes`;
  };

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  // Show loading state until client-side hydration is complete
  if (!isClient || !wordStates) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)'
      }}>
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ animation: 'gentle-bounce 2s ease-in-out infinite' }}>🌙</div>
          <p className="text-purple-300 text-sm">Loading puzzle...</p>
        </div>
        <style>{`
          @keyframes gentle-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)'
    }}>
      {/* Audio element */}
      <audio ref={audioRef} loop src={`/little-music${currentTrack}.mp3`} />
      
      {/* Floating stars background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-yellow-100"
            style={{
              width: star.width + 'px',
              height: star.height + 'px',
              left: star.left + '%',
              top: star.top + '%',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: star.delay + 's'
            }}
          />
        ))}
      </div>

      {/* Moon confetti on completion */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 25 }).map((_, i) => {
            const emojis = ['🌙', '✨', '⭐', '💫', '🌟'];
            const emoji = emojis[i % emojis.length];
            const left = (i * 11) % 100;
            
            return (
              <div
                key={i}
                className="absolute text-3xl"
                style={{
                  left: `${left}%`,
                  top: '-40px',
                  animation: `float-down 4s ease-in ${(i % 8) * 0.15}s forwards`
                }}
              >
                {emoji}
              </div>
            );
          })}
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          {/* Left icons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowHowToPlayModal(true)}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(139, 92, 246, 0.2)' }}
              title="How to Play"
            >
              <HelpCircle size={20} className="text-purple-300" />
            </button>
            <button
              onClick={() => setShowMusicModal(true)}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(139, 92, 246, 0.2)' }}
              title="Music"
            >
              {isPlaying ? (
                <Volume2 size={20} className="text-purple-300" />
              ) : (
                <VolumeX size={20} className="text-purple-300" />
              )}
            </button>
          </div>
          
          {/* Center title */}
          <div className="text-center flex-1">
            <div className="text-4xl mb-1" style={{ animation: 'gentle-bounce 3s ease-in-out infinite' }}>
              🌙
            </div>
            <h1 className="text-2xl font-light tracking-wide text-yellow-100" style={{ fontFamily: 'Georgia, serif' }}>
              Little Letter Griddle
            </h1>
            <p className="text-purple-300 text-xs mt-1 opacity-80">A moonlit word puzzle</p>
          </div>
          
          {/* Right icon */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowStatsModal(true)}
              className="text-3xl transition-transform hover:scale-110"
              title="Your Moon Journey"
              style={{ 
                filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.4))',
                animation: 'pulse-glow 3s ease-in-out infinite'
              }}
            >
              {currentMoonPhase.icon}
            </button>
          </div>
        </div>

        {/* Countdown timer */}
        {!allComplete && (
          <div className="text-center mb-4">
            <p className="text-purple-400 text-xs opacity-70">
              Next moonlit puzzle in {countdown.hours}h {countdown.minutes}m
            </p>
          </div>
        )}

        {/* Category */}
        <div className="text-center mb-4">
          <div className="inline-block px-5 py-1.5 rounded-full" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(88, 28, 135, 0.3) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.3)'
          }}>
            <span className="text-purple-200 text-sm tracking-widest uppercase">
              {gameData.category}
            </span>
          </div>
          <p className="text-purple-400 text-xs mt-2 opacity-60">Puzzle #{gameData.puzzleNumber}</p>
        </div>

        {/* Completion Banner */}
        {allComplete && (
          <div className="mb-5 p-5 rounded-2xl text-center" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.3) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.4)',
            animation: 'soft-glow 2s ease-in-out infinite'
          }}>
            <p className="text-yellow-100 text-base mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              You completed the puzzle!
            </p>
            <p className="text-2xl text-yellow-200 font-medium mb-1">
              {todaysMessage.phrase}
            </p>
            <p className="text-purple-300 text-sm">
              ({todaysMessage.language})
            </p>
            <p className="text-yellow-200 text-xs mt-1 italic">
              {todaysMessage.pronunciation}
            </p>
            <button
              onClick={() => setShowLanguagesModal(true)}
              className="text-purple-300 text-xs mt-2 hover:text-yellow-200 transition-colors underline"
            >
              See other languages
            </button>
            
            {/* Elapsed time */}
            <p className="text-purple-300 text-sm mt-4 opacity-80">
              ✨ You spent {formatElapsedTime(elapsedTime)} under the moonlight ✨
            </p>
            
            {/* Share button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="mt-4 px-6 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(88, 28, 135, 0.8) 100%)',
                color: '#fef3c7'
              }}
            >
              <Share2 size={16} className="inline mr-2" />
              Share Results
            </button>
          </div>
        )}

        {/* Words */}
        <div className="space-y-5">
          {gameData.words.map((wordData, wordIdx) => {
            const state = wordStates[wordIdx];
            const isCelebrating = celebratingWord === wordIdx;
            const isActive = activeWordIdx === wordIdx && !state.completed;
            
            return (
              <div 
                key={wordIdx} 
                className="rounded-2xl p-4 transition-all duration-500 relative"
                style={{
                  background: state.completed 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)'
                    : isActive
                      ? 'linear-gradient(135deg, rgba(40, 40, 80, 0.8) 0%, rgba(50, 50, 100, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(30, 30, 60, 0.6) 0%, rgba(40, 40, 80, 0.6) 100%)',
                  border: state.completed 
                    ? '1px solid rgba(167, 139, 250, 0.5)' 
                    : isActive
                      ? '1px solid rgba(167, 139, 250, 0.6)'
                      : '1px solid rgba(100, 100, 150, 0.3)',
                  transform: isCelebrating ? 'scale(1.02)' : 'scale(1)'
                }}
                onClick={() => !state.completed && setActiveWordIdx(wordIdx)}
              >
                {/* Celebration overlay */}
                {isCelebrating && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none rounded-2xl" style={{
                    background: 'rgba(10, 10, 30, 0.7)'
                  }}>
                    <div className="px-6 py-2 rounded-full text-yellow-100 text-lg" style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(88, 28, 135, 0.9) 100%)',
                      animation: 'gentle-bounce 0.5s ease-in-out'
                    }}>
                      ✨ Lovely! ✨
                    </div>
                  </div>
                )}

                {/* Word info and buttons */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-purple-300 text-xs tracking-wide">
                    {wordData.word.length} letters
                  </span>
                  <div className="flex gap-2">
                    {!state.completed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shuffleWord(wordIdx);
                        }}
                        className="text-xs px-2 py-1 rounded-full transition-all hover:scale-105"
                        style={{
                          background: 'rgba(253, 224, 71, 0.25)',
                          color: '#fde047',
                          border: '1px solid rgba(253, 224, 71, 0.4)'
                        }}
                        title="Shuffle letters"
                      >
                        <RefreshCw size={12} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHint(wordIdx);
                      }}
                      className="text-xs px-3 py-1 rounded-full transition-all"
                      style={{
                        background: hintsRevealed[wordIdx] 
                          ? 'rgba(139, 92, 246, 0.4)' 
                          : 'rgba(139, 92, 246, 0.2)',
                        color: '#c4b5fd',
                        border: '1px solid rgba(167, 139, 250, 0.3)'
                      }}
                    >
                      {hintsRevealed[wordIdx] ? 'Hide hint' : 'Show hint'}
                    </button>
                  </div>
                </div>

                {/* Hint */}
                {hintsRevealed[wordIdx] && (
                  <div className="mb-4 p-3 rounded-xl" style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(167, 139, 250, 0.2)'
                  }}>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      {wordData.hint}
                    </p>
                  </div>
                )}

                {/* Letter slots */}
                <div className="flex justify-center gap-2 mb-4">
                  {wordData.word.split('').map((_, slotIdx) => {
                    const placedLetter = state.placed[slotIdx];
                    const isSlotSelected = selectedSlot.wordIdx === wordIdx && selectedSlot.slotIdx === slotIdx;
                    const isWrong = wrongPlacements[`${wordIdx}-${slotIdx}`];
                    
                    return (
                      <div
                        key={slotIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(wordIdx, slotIdx);
                        }}
                        className="w-11 h-11 flex items-center justify-center text-lg font-medium rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          background: isWrong
                            ? 'linear-gradient(135deg, rgba(244, 114, 182, 0.7) 0%, rgba(219, 39, 119, 0.6) 100%)'
                            : placedLetter 
                              ? 'linear-gradient(135deg, rgba(253, 224, 71, 0.9) 0%, rgba(250, 204, 21, 0.9) 100%)'
                              : isSlotSelected
                                ? 'rgba(139, 92, 246, 0.4)'
                                : 'rgba(60, 60, 100, 0.4)',
                          border: isWrong
                            ? '2px solid rgba(244, 114, 182, 0.8)'
                            : placedLetter 
                              ? '2px solid rgba(253, 224, 71, 0.6)' 
                              : isSlotSelected
                                ? '2px solid rgba(167, 139, 250, 0.8)'
                                : '2px dashed rgba(139, 92, 246, 0.4)',
                          color: isWrong ? '#1a1a2e' : placedLetter ? '#1a1a2e' : 'transparent',
                          fontFamily: 'Georgia, serif',
                          transform: isCelebrating ? 'scale(1.1)' : isSlotSelected ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: isWrong
                            ? '0 0 15px rgba(244, 114, 182, 0.5)'
                            : placedLetter 
                              ? '0 4px 12px rgba(253, 224, 71, 0.3)' 
                              : isSlotSelected
                                ? '0 0 15px rgba(139, 92, 246, 0.5)'
                                : 'none',
                          animation: isWrong ? 'gentle-shake 0.4s ease-in-out' : 'none'
                        }}
                      >
                        {placedLetter}
                      </div>
                    );
                  })}
                </div>

                {/* Scrambled letters */}
                {!state.completed && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    {state.available.map((letter, letterIdx) => {
                      const isSelected = selectedLetter.wordIdx === wordIdx && 
                                        selectedLetter.letterIdx === letterIdx &&
                                        selectedLetter.source === 'available';
                      
                      return (
                        <button
                          key={letterIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvailableLetterClick(wordIdx, letterIdx);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-base font-medium rounded-xl transition-all duration-200"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(253, 224, 71, 1) 0%, rgba(250, 204, 21, 1) 100%)'
                              : 'linear-gradient(135deg, rgba(253, 224, 71, 0.85) 0%, rgba(250, 204, 21, 0.85) 100%)',
                            border: isSelected 
                              ? '2px solid rgba(255, 255, 255, 0.8)' 
                              : '2px solid rgba(253, 224, 71, 0.4)',
                            color: '#1a1a2e',
                            fontFamily: 'Georgia, serif',
                            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: isSelected 
                              ? '0 0 20px rgba(253, 224, 71, 0.6)' 
                              : '0 2px 8px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Completed indicator */}
                {state.completed && !isCelebrating && (
                  <div className="text-center">
                    <span className="text-2xl">✨</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-xs">
            🌙 Tap a letter then a slot, or tap a slot then a letter
          </p>
          <p className="text-purple-300 text-xs mt-1">
            Keyboard: Type letters • Backspace to undo • Space to shuffle
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-purple-400 text-xs opacity-70">
          <p>© {currentYear} Little Letter Griddle</p>
          <div className="mt-2 space-x-3">
            <Link href="/privacy" className="hover:text-yellow-200 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-yellow-200 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.95)' }}
        >
          <div 
            className="max-w-sm w-full rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.98) 0%, rgba(40, 40, 80, 0.98) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)',
              animation: 'fade-in 0.5s ease-out'
            }}
          >
            <div className="text-5xl mb-4" style={{ animation: 'gentle-bounce 2s ease-in-out infinite' }}>
              🌙
            </div>
            <p className="text-purple-300 text-sm mb-2">Welcome to Little Letter Griddle</p>
            <h2 className="text-2xl text-yellow-100 font-light mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              {todaysWelcome}
            </h2>
            <button
              onClick={() => {
                setShowWelcomeModal(false);
                setStartTime(Date.now());
              }}
              className="w-full py-3 rounded-full text-lg font-medium transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(88, 28, 135, 0.8) 100%)',
                color: '#fef3c7',
                border: '1px solid rgba(167, 139, 250, 0.5)'
              }}
            >
              Tonight's Puzzle
            </button>
            <p className="text-purple-400 text-xs mt-4 opacity-60">
              New puzzle daily at 7:30 PM EST
            </p>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlayModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.9)' }}
          onClick={() => setShowHowToPlayModal(false)}
        >
          <div 
            className="max-w-sm w-full rounded-3xl p-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(40, 40, 80, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
              animation: 'fade-in 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHowToPlayModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🌙</div>
              <h2 className="text-xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                How to Play
              </h2>
            </div>
            
            <div className="space-y-4 text-purple-200 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-yellow-200 text-lg">1.</span>
                <p>Unscramble the letters to form each word. Tap a letter, then tap a slot to place it.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-200 text-lg">2.</span>
                <p>You can also tap a slot first, then tap a letter to fill it.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-200 text-lg">3.</span>
                <p>Tap a placed letter to return it to the scramble. Use hints if you need help!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-200 text-lg">4.</span>
                <p>Complete all 3 words to finish the puzzle.</p>
              </div>
            </div>
            
            <div className="mt-6 p-3 rounded-xl text-center" style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(167, 139, 250, 0.2)'
            }}>
              <p className="text-purple-300 text-xs">
                <strong className="text-yellow-200">Keyboard:</strong> Type letters directly • Backspace to undo • Space to shuffle • Tab to switch words
              </p>
            </div>
            
            <button
              onClick={() => setShowHowToPlayModal(false)}
              className="w-full mt-6 py-3 rounded-full text-base font-medium transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(88, 28, 135, 0.8) 100%)',
                color: '#fef3c7'
              }}
            >
              Got it! 🌙
            </button>
          </div>
        </div>
      )}

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.9)' }}
          onClick={() => setShowBookmarkModal(false)}
        >
          <div 
            className="max-w-sm w-full rounded-3xl p-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(40, 40, 80, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
              animation: 'fade-in 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBookmarkModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">✨</div>
              <h2 className="text-xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                Never Miss a Puzzle!
              </h2>
            </div>
            
            <div className="p-4 rounded-xl text-center mb-4" style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(167, 139, 250, 0.2)'
            }}>
              <p className="text-purple-200 text-sm">
                Bookmark <span className="text-yellow-200 font-medium">www.littlelettergriddle.com</span> to make your daily puzzle just a click away!
              </p>
              <div className="text-2xl mt-2">✨</div>
            </div>
            
            <div className="p-3 rounded-xl mb-4" style={{
              background: 'rgba(60, 60, 100, 0.3)',
              border: '1px solid rgba(100, 100, 150, 0.3)'
            }}>
              <p className="text-purple-300 text-xs">
                <Bookmark size={14} className="inline mr-1 text-yellow-200" />
                <strong className="text-yellow-200">Quick tip:</strong> Press{' '}
                <span className="px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-200 text-xs">Ctrl+D</span>
                {' '}(or{' '}
                <span className="px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-200 text-xs">⌘+D</span>
                {' '}on Mac) to bookmark now!
              </p>
            </div>
            
            <button
              onClick={() => setShowBookmarkModal(false)}
              className="w-full py-3 rounded-full text-base font-medium transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(88, 28, 135, 0.8) 100%)',
                color: '#fef3c7'
              }}
            >
              Got it! ✨
            </button>
            
            <p className="text-purple-400 text-xs mt-3 text-center opacity-60">
              New puzzle daily at 7:30 PM EST
            </p>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.9)' }}
          onClick={() => setShowStatsModal(false)}
        >
          <div 
            className="max-w-sm w-full rounded-3xl p-8 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(40, 40, 80, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
              animation: 'fade-in 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStatsModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Current Moon Phase */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-3" style={{ filter: 'drop-shadow(0 0 15px rgba(253, 224, 71, 0.5))' }}>
                {currentMoonPhase.icon}
              </div>
              <h2 className="text-xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                {currentMoonPhase.name}
              </h2>
            </div>

            {/* Puzzles Completed */}
            <div className="text-center mb-6 pb-6" style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <div className="text-4xl text-yellow-200 font-light mb-1">
                {stats.puzzlesCompleted}
              </div>
              <div className="text-purple-300 text-sm">
                puzzles completed
              </div>
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <div className="text-2xl text-yellow-200 mb-1">🌙 {stats.currentStreak}</div>
                <div className="text-purple-300 text-xs">Current Streak</div>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <div className="text-2xl text-yellow-200 mb-1">✨ {stats.longestStreak}</div>
                <div className="text-purple-300 text-xs">Longest Streak</div>
              </div>
            </div>

            {/* Moon Journey */}
            <div className="text-center">
              <h3 className="text-purple-300 text-sm mb-4">Your Moon Journey</h3>
              <div className="flex justify-center items-center gap-1 flex-wrap mb-3">
                {moonPhases.map((phase, idx) => {
                  const isCurrentPhase = phase.name === currentMoonPhase.name;
                  const isPastPhase = stats.puzzlesCompleted >= phase.min;
                  
                  return (
                    <div 
                      key={idx}
                      className="text-2xl transition-all"
                      style={{
                        opacity: isPastPhase ? 1 : 0.3,
                        transform: isCurrentPhase ? 'scale(1.3)' : 'scale(1)',
                        filter: isCurrentPhase ? 'drop-shadow(0 0 10px rgba(253, 224, 71, 0.6))' : 'none'
                      }}
                    >
                      {phase.icon}
                    </div>
                  );
                })}
              </div>
              {stats.puzzlesCompleted < 80 && (
                <p className="text-purple-400 text-xs opacity-70">
                  {moonPhases.find(p => p.min > stats.puzzlesCompleted)?.min - stats.puzzlesCompleted} more puzzles to {moonPhases.find(p => p.min > stats.puzzlesCompleted)?.name}
                </p>
              )}
              {stats.puzzlesCompleted >= 80 && (
                <p className="text-yellow-200 text-xs">
                  ✨ You've reached the Radiant Moon! ✨
                </p>
              )}
            </div>
            
            {/* About the moon phases link */}
            <button
              onClick={() => {
                setShowStatsModal(false);
                setShowMoonModal(true);
              }}
              className="w-full mt-6 py-2 rounded-full text-sm transition-all hover:scale-105"
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#c4b5fd',
                border: '1px solid rgba(167, 139, 250, 0.3)'
              }}
            >
              🌒 About the moon phases
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.9)' }}
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="max-w-sm w-full rounded-3xl p-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(40, 40, 80, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
              animation: 'fade-in 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-4">
              <h2 className="text-xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                Share Your Results!
              </h2>
            </div>
            
            <div className="p-4 rounded-xl mb-4 font-mono text-sm" style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(167, 139, 250, 0.2)'
            }}>
              <p className="text-purple-200">Little Griddle #{gameData.puzzleNumber} 🌙</p>
              <p className="text-purple-200">{gameData.category}</p>
              <p className="text-yellow-200 text-lg">{'🌙'.repeat(wordStates.filter(w => w.completed).length)}</p>
              <p className="text-purple-200">{wordStates.filter(w => w.completed).length}/3 words</p>
              <p className="text-purple-300 text-xs">Play at www.littlelettergriddle.com</p>
            </div>
            
            <button
              onClick={shareResults}
              className="w-full py-3 rounded-full text-base font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(88, 28, 135, 0.8) 100%)',
                color: '#fef3c7'
              }}
            >
              <Share2 size={18} />
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            
            <p className="text-purple-300 text-sm mt-4 text-center">
              Love the game? Share it with a friend who hasn't played yet! ✨
            </p>
            
            <a
              href="https://www.instagram.com/letter_griddle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-4 text-yellow-200 text-sm hover:text-yellow-100 transition-colors"
            >
              <Instagram size={16} /> Follow us @letter_griddle
            </a>
            
            <p className="text-purple-300 text-xs mt-4 text-center">
              Next moonlit puzzle drops daily at 7:30 PM EST 🌙
            </p>
          </div>
        </div>
      )}

      {/* Music Modal */}
      {showMusicModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.9)' }}
          onClick={() => setShowMusicModal(false)}
        >
          <div 
            className="max-w-sm w-full rounded-3xl p-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(40, 40, 80, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
              animation: 'fade-in 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMusicModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎵</div>
              <h2 className="text-xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                Ambient Music
              </h2>
            </div>
            
            {/* Play/Pause button */}
            <button
              onClick={toggleMusic}
              className="w-full py-4 rounded-xl mb-4 text-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-3"
              style={{
                background: isPlaying 
                  ? 'linear-gradient(135deg, rgba(244, 114, 182, 0.4) 0%, rgba(219, 39, 119, 0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(88, 28, 135, 0.3) 100%)',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                color: '#fef3c7'
              }}
            >
              {isPlaying ? (
                <>
                  <VolumeX size={24} />
                  Pause Music
                </>
              ) : (
                <>
                  <Volume2 size={24} />
                  Play Music
                </>
              )}
            </button>
            
            {/* Track selection */}
            <div className="space-y-2">
              <p className="text-purple-300 text-xs mb-2">Choose a track:</p>
              <button
                onClick={() => switchTrack(1)}
                className="w-full p-3 rounded-xl text-left transition-all"
                style={{
                  background: currentTrack === 1 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(60, 60, 100, 0.3)',
                  border: currentTrack === 1 ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid rgba(100, 100, 150, 0.3)'
                }}
              >
                <span className="text-purple-200">🌙 Track 1</span>
                {currentTrack === 1 && <span className="text-yellow-200 float-right">♪ Playing</span>}
              </button>
              <button
                onClick={() => switchTrack(2)}
                className="w-full p-3 rounded-xl text-left transition-all"
                style={{
                  background: currentTrack === 2 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(60, 60, 100, 0.3)',
                  border: currentTrack === 2 ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid rgba(100, 100, 150, 0.3)'
                }}
              >
                <span className="text-purple-200">✨ Track 2</span>
                {currentTrack === 2 && <span className="text-yellow-200 float-right">♪ Playing</span>}
              </button>
            </div>
            
            <p className="text-purple-400 text-xs mt-4 text-center opacity-60">
              Music plays on loop while you puzzle
            </p>
          </div>
        </div>
      )}

      {/* Moon Phases Educational Modal */}
      {showMoonModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.95)' }}
          onClick={() => setShowMoonModal(false)}
        >
          <div 
            className="max-w-md w-full rounded-3xl p-6 relative max-h-[85vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.98) 0%, rgba(40, 40, 80, 0.98) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)',
              animation: 'fade-in 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMoonModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🌙</div>
              <h2 className="text-xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                The Lunar Cycle
              </h2>
              <p className="text-purple-300 text-xs mt-1 opacity-80">
                A journey through the moon's phases
              </p>
            </div>
            
            {/* Moon Phases */}
            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌑</span>
                  <div>
                    <h3 className="text-yellow-100 text-sm font-medium">New Moon</h3>
                    <p className="text-purple-300 text-xs">The moon is between Earth and Sun, invisible to us. A time of new beginnings.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌒</span>
                  <div>
                    <h3 className="text-yellow-100 text-sm font-medium">Waxing Crescent</h3>
                    <p className="text-purple-300 text-xs">A sliver of light appears. The moon is "waxing" or growing larger each night.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌓</span>
                  <div>
                    <h3 className="text-yellow-100 text-sm font-medium">First Quarter</h3>
                    <p className="text-purple-300 text-xs">Half the moon is illuminated. We're one quarter through the lunar cycle.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌔</span>
                  <div>
                    <h3 className="text-yellow-100 text-sm font-medium">Waxing Gibbous</h3>
                    <p className="text-purple-300 text-xs">More than half lit, approaching fullness. "Gibbous" means swollen or convex.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(253, 224, 71, 0.3)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌕</span>
                  <div>
                    <h3 className="text-yellow-200 text-sm font-medium">Full Moon</h3>
                    <p className="text-purple-300 text-xs">The entire face is illuminated. Earth is between the Sun and Moon.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌖</span>
                  <div>
                    <h3 className="text-yellow-100 text-sm font-medium">Waning Gibbous</h3>
                    <p className="text-purple-300 text-xs">The light begins to decrease. "Waning" means shrinking or diminishing.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌗</span>
                  <div>
                    <h3 className="text-yellow-100 text-sm font-medium">Last Quarter</h3>
                    <p className="text-purple-300 text-xs">Half illuminated again, but the opposite half from First Quarter.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌘</span>
                  <div>
                    <h3 className="text-yellow-100 text-sm font-medium">Waning Crescent</h3>
                    <p className="text-purple-300 text-xs">A final sliver before darkness. The cycle prepares to begin anew.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Did You Know section */}
            <div className="pt-4" style={{ borderTop: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <h3 className="text-purple-300 text-sm mb-3 text-center">✨ Did You Know?</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(60, 60, 100, 0.3)' }}>
                  <p className="text-purple-200 text-xs leading-relaxed">
                    🌙 The moon is slowly drifting away from Earth at about 1.5 inches per year.
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(60, 60, 100, 0.3)' }}>
                  <p className="text-purple-200 text-xs leading-relaxed">
                    🌙 A complete lunar cycle takes about 29.5 days, nearly a month, which is where the word "month" comes from.
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(60, 60, 100, 0.3)' }}>
                  <p className="text-purple-200 text-xs leading-relaxed">
                    🌙 The same side of the moon always faces Earth. We never see the "far side" from our planet.
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(60, 60, 100, 0.3)' }}>
                  <p className="text-purple-200 text-xs leading-relaxed">
                    🌙 Moonlight is actually sunlight reflected off the lunar surface. The moon produces no light of its own.
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(60, 60, 100, 0.3)' }}>
                  <p className="text-purple-200 text-xs leading-relaxed">
                    🌙 The word "lunatic" comes from the Latin "luna" (moon), from ancient beliefs that the full moon affected behavior.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowMoonModal(false)}
              className="w-full mt-6 py-3 rounded-full text-base font-medium transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(88, 28, 135, 0.8) 100%)',
                color: '#fef3c7'
              }}
            >
              Back to Puzzling 🌙
            </button>
          </div>
        </div>
      )}

      {/* Languages Modal */}
      {showLanguagesModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 30, 0.95)' }}
          onClick={() => setShowLanguagesModal(false)}
        >
          <div 
            className="max-w-md w-full rounded-3xl p-6 relative max-h-[85vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.98) 0%, rgba(40, 40, 80, 0.98) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)',
              animation: 'fade-in 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLanguagesModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🌍</div>
              <h2 className="text-xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                Celebrating in Many Languages
              </h2>
              <p className="text-purple-300 text-xs mt-2 opacity-80">
                When you complete a puzzle, you'll receive congratulations in a different language each day!
              </p>
            </div>
            
            {/* Languages list */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Très bien!</p>
                  <p className="text-purple-300 text-xs">French • tray bee-EN</p>
                </div>
                <span className="text-purple-400 text-xs">France 🇫🇷</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">¡Muy bien!</p>
                  <p className="text-purple-300 text-xs">Spanish • moo-ee bee-EN</p>
                </div>
                <span className="text-purple-400 text-xs">Spain 🇪🇸</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Molto bene!</p>
                  <p className="text-purple-300 text-xs">Italian • MOL-toh BEN-ay</p>
                </div>
                <span className="text-purple-400 text-xs">Italy 🇮🇹</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Sehr gut!</p>
                  <p className="text-purple-300 text-xs">German • zair goot</p>
                </div>
                <span className="text-purple-400 text-xs">Germany 🇩🇪</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Muito bem!</p>
                  <p className="text-purple-300 text-xs">Portuguese • MOO-ee-toh beng</p>
                </div>
                <span className="text-purple-400 text-xs">Portugal 🇵🇹</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Heel goed!</p>
                  <p className="text-purple-300 text-xs">Dutch • hayl khoot</p>
                </div>
                <span className="text-purple-400 text-xs">Netherlands 🇳🇱</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Mycket bra!</p>
                  <p className="text-purple-300 text-xs">Swedish • MYK-et brah</p>
                </div>
                <span className="text-purple-400 text-xs">Sweden 🇸🇪</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Maika'i!</p>
                  <p className="text-purple-300 text-xs">Hawaiian • my-KAH-ee</p>
                </div>
                <span className="text-purple-400 text-xs">Hawaii 🌺</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">很好!</p>
                  <p className="text-purple-300 text-xs">Mandarin • hun how</p>
                </div>
                <span className="text-purple-400 text-xs">China 🇨🇳</span>
              </div>
              
              <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div>
                  <p className="text-yellow-200 font-medium">Очень хорошо!</p>
                  <p className="text-purple-300 text-xs">Russian • OH-chen ha-ra-SHOH</p>
                </div>
                <span className="text-purple-400 text-xs">Russia 🇷🇺</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowLanguagesModal(false)}
              className="w-full mt-6 py-3 rounded-full text-base font-medium transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(88, 28, 135, 0.8) 100%)',
                color: '#fef3c7'
              }}
            >
              Back to Puzzling 🌙
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
