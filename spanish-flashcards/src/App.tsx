import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Check, LogOut, User } from 'lucide-react';
import {FLASH_CARDS} from './flashcards.ts';

const SpanishFlashcards = () => {
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inputUsername, setInputUsername] = useState('');
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState(new Set());
    const [filterCategory, setFilterCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(true);

    const categories = ["All", ...new Set(FLASH_CARDS.map(card => card.category))];

    const filteredCards = filterCategory === "All"
        ? FLASH_CARDS
        : FLASH_CARDS.filter(card => card.category === filterCategory);

    // Load user progress on mount
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedUsername = await window.storage.get('current-user');
                if (savedUsername && savedUsername.value) {
                    const user = savedUsername.value;
                    setUsername(user);
                    setIsLoggedIn(true);
                    await loadUserProgress(user);
                }
            } catch (error) {
                console.log('No previous session found');
            }
            setIsLoading(false);
        };
        loadProgress();
    }, []);

    // Save progress whenever it changes
    useEffect(() => {
        if (isLoggedIn && username) {
            saveProgress();
        }
    }, [currentCard, knownCards, filterCategory, isLoggedIn, username]);

    const loadUserProgress = async (user) => {
        try {
            const progressData = await window.storage.get(`progress-${user}`);
            if (progressData && progressData.value) {
                const progress = JSON.parse(progressData.value);
                setCurrentCard(progress.currentCard || 0);
                setKnownCards(new Set(progress.knownCards || []));
                setFilterCategory(progress.filterCategory || "All");
            }
        } catch (error) {
            console.log('Starting fresh progress for user');
        }
    };

    const saveProgress = async () => {
        try {
            const progress = {
                currentCard,
                knownCards: Array.from(knownCards),
                filterCategory,
                lastAccessed: new Date().toISOString()
            };
            await window.storage.set(`progress-${username}`, JSON.stringify(progress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    };

    const handleLogin = async () => {
        if (inputUsername.trim()) {
            const user = inputUsername.trim();
            setUsername(user);
            setIsLoggedIn(true);

            try {
                await window.storage.set('current-user', user);
                await loadUserProgress(user);
            } catch (error) {
                console.error('Login error:', error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await window.storage.delete('current-user');
        } catch (error) {
            console.error('Logout error:', error);
        }
        setIsLoggedIn(false);
        setUsername('');
        setInputUsername('');
        setCurrentCard(0);
        setKnownCards(new Set());
        setFilterCategory("All");
        setIsFlipped(false);
    };

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentCard((prev) => (prev + 1) % filteredCards.length);
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setCurrentCard((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const toggleKnown = () => {
        const newKnown = new Set(knownCards);
        if (newKnown.has(currentCard)) {
            newKnown.delete(currentCard);
        } else {
            newKnown.add(currentCard);
        }
        setKnownCards(newKnown);
    };

    const resetProgress = async () => {
        setKnownCards(new Set());
        setCurrentCard(0);
        setIsFlipped(false);
        setFilterCategory("All");
        if (username) {
            try {
                await window.storage.delete(`progress-${username}`);
            } catch (error) {
                console.error('Failed to reset progress:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-500 via-white to-green-600 flex items-center justify-center">
                <div className="text-4xl">🌮 Cargando...</div>
            </div>
        );
    }

    // Login Screen
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-500 via-white to-green-600 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full border-4 border-yellow-400">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🇲🇽</div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Bienvenidos!</h1>
                        <p className="text-gray-600">Welcome to Spanish Flashcards</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Enter your name to start learning:
                            </label>
                            <input
                                type="text"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                placeholder="Your name..."
                                className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500 text-lg"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={!inputUsername.trim()}
                            className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ¡Empezar! (Start)
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p className="flex items-center justify-center gap-2">
                            <span className="text-lg">💾</span>
                            Your progress will be saved automatically
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const card = filteredCards[currentCard];

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-white to-green-600 p-4 md:p-8">
            {/* Decorative papel picado pattern */}
            <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.1) 35px, rgba(0,0,0,.1) 70px)`
            }}></div>

            <div className="max-w-2xl mx-auto relative">
                {/* Header with user info */}
                <div className="flex justify-between items-center mb-4">
                    <div className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-yellow-400 flex items-center gap-2">
                        <User className="w-4 h-4 text-pink-500" />
                        <span className="font-bold text-gray-800">{username}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-red-400 flex items-center gap-2 hover:bg-red-50 transition font-bold text-gray-800"
                    >
                        <LogOut className="w-4 h-4" />
                        Salir
                    </button>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg" style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        🇲🇽 Tarjetas de Español 🇲🇽
                    </h1>
                    <p className="text-white font-semibold drop-shadow">Para conectar con la familia</p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setFilterCategory(cat);
                                setCurrentCard(0);
                                setIsFlipped(false);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition shadow-lg ${
                                filterCategory === cat
                                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white scale-105'
                                    : 'bg-white text-gray-800 hover:bg-yellow-100 border-2 border-green-600'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Progress */}
                <div className="text-center mb-4 text-sm font-semibold text-white drop-shadow">
                    Card {currentCard + 1} of {filteredCards.length} • {knownCards.size} marked as known
                </div>

                {/* Flashcard */}
                <div
                    onClick={handleFlip}
                    className="relative rounded-3xl shadow-2xl p-8 md:p-12 mb-6 cursor-pointer transition-all hover:shadow-xl border-4"
                    style={{
                        minHeight: '350px',
                        background: isFlipped
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderColor: '#fbbf24'
                    }}
                >
                    {/* Decorative corners */}
                    <div className="absolute top-2 left-2 text-4xl">🌺</div>
                    <div className="absolute top-2 right-2 text-4xl">🌺</div>
                    <div className="absolute bottom-2 left-2 text-4xl">🌸</div>
                    <div className="absolute bottom-2 right-2 text-4xl">🌸</div>

                    <div className="absolute top-4 right-16">
            <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs font-bold border-2 border-white shadow">
              {card.category}
            </span>
                    </div>

                    <div className="flex flex-col items-center justify-center h-full text-center">
                        {!isFlipped ? (
                            <div>
                                <div className="text-7xl mb-4">{card.emoji}</div>
                                <p className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                                    {card.front}
                                </p>
                                <p className="text-yellow-100 text-sm font-semibold">👆 Click to reveal</p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-7xl mb-4">{card.emoji}</div>
                                <p className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                                    {card.back}
                                </p>
                                {card.notes && (
                                    <p className="text-yellow-100 text-sm font-semibold italic mt-4 max-w-md bg-black bg-opacity-20 rounded-lg p-3">
                                        💡 {card.notes}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {knownCards.has(currentCard) && (
                        <div className="absolute top-4 left-16 bg-white rounded-full p-2 shadow-lg">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <button
                        onClick={handlePrevious}
                        className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition font-bold text-gray-800 border-2 border-pink-400"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Anterior
                    </button>

                    <button
                        onClick={toggleKnown}
                        className={`px-6 py-3 rounded-xl shadow-lg transition font-bold border-2 ${
                            knownCards.has(currentCard)
                                ? 'bg-green-500 text-white hover:bg-green-600 border-green-700'
                                : 'bg-white hover:bg-yellow-100 border-yellow-400 text-gray-800'
                        }`}
                    >
                        {knownCards.has(currentCard) ? '✓ ¡Lo sé!' : 'Marcar'}
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition font-bold border-2 border-red-700"
                    >
                        Siguiente
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={resetProgress}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white hover:text-yellow-200 transition drop-shadow"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Empezar de Nuevo
                    </button>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border-4 border-yellow-400">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                        <span className="text-2xl">📖</span> Study Tips:
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-2 font-medium">
                        <li>🌟 Start with Greetings and Phrases categories</li>
                        <li>🗣️ Practice verb conjugations out loud</li>
                        <li>✏️ Use sentence builders to create your own sentences</li>
                        <li>💚 Don't worry about perfection—your effort will be appreciated!</li>
                        <li>🎯 Try using one new phrase each time you see the family</li>
                        <li>💾 Your progress is saved automatically—come back anytime!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SpanishFlashcards;