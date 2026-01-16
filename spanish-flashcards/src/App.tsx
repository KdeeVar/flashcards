import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Check, LogOut, User, BarChart3, Clock, Trophy } from 'lucide-react';
import {FLASH_CARDS} from './flashcards.ts';

    const SpanishFlashcards = () => {
        // LocalStorage wrapper for compatibility
        const storage = {
            get: async (key: string) => {
                const value = localStorage.getItem(key);
                return value ? { value } : null;
            },
            set: async (key: string, value: string) => {
                localStorage.setItem(key, value);
                return { key, value };
            },
            delete: async (key: string) => {
                localStorage.removeItem(key);
                return { key, deleted: true };
            }
        };

        const flashcards= FLASH_CARDS

        const [username, setUsername] = useState('');
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [inputUsername, setInputUsername] = useState('');
        const [currentCard, setCurrentCard] = useState(0);
        const [isFlipped, setIsFlipped] = useState(false);
        const [knownCards, setKnownCards] = useState(new Set());
        const [filterCategory, setFilterCategory] = useState("All");
        const [isLoading, setIsLoading] = useState(true);
        const [showDashboard, setShowDashboard] = useState(false);
        const [categoryTime, setCategoryTime] = useState<Record<string, number>>({});
        const [sessionStart, setSessionStart] = useState(Date.now());
        const [currentCategoryStart, setCurrentCategoryStart] = useState(Date.now());
        const [isLoadingProgress, setIsLoadingProgress] = useState(false);

        const categories = ["All", ...new Set(flashcards.map(card => card.category))];

        const filteredCards = filterCategory === "All"
            ? flashcards
            : flashcards.filter(card => card.category === filterCategory);

        // Load user progress on mount
        useEffect(() => {
            const loadProgress = async () => {
                try {
                    const savedUsername = await storage.get('current-user');
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

        // Track time spent in current category
        useEffect(() => {
            if (isLoggedIn && filterCategory !== "All") {
                setCurrentCategoryStart(Date.now());

                return () => {
                    const timeSpent = Math.floor((Date.now() - currentCategoryStart) / 1000);
                    if (timeSpent > 0) {
                        setCategoryTime(prev => ({
                            ...prev,
                            [filterCategory]: (prev[filterCategory] || 0) + timeSpent
                        }));
                    }
                };
            }
        }, [filterCategory, isLoggedIn]);

        // Save progress whenever it changes (but not while loading)
        useEffect(() => {
            if (isLoggedIn && username && !isLoadingProgress) {
                saveProgress();
            }
        }, [currentCard, knownCards, filterCategory, categoryTime, isLoggedIn, username, isLoadingProgress]);

        const loadUserProgress = async (user: string) => {
            setIsLoadingProgress(true);
            try {
                const progressData = await storage.get(`progress-${user}`);
                console.log('Loading progress for', user, ':', progressData);
                if (progressData && progressData.value) {
                    const progress = JSON.parse(progressData.value);
                    setCurrentCard(progress.currentCard || 0);
                    setKnownCards(new Set(progress.knownCards || []));
                    setFilterCategory(progress.filterCategory || "All");
                    setCategoryTime(progress.categoryTime || {});
                    console.log('Progress loaded successfully:', progress);
                } else {
                    console.log('No saved progress found for user:', user);
                }
            } catch (error) {
                console.log('Starting fresh progress for user:', error);
            } finally {
                setIsLoadingProgress(false);
            }
        };

        const saveProgress = async () => {
            try {
                const progress = {
                    currentCard,
                    knownCards: Array.from(knownCards),
                    filterCategory,
                    categoryTime,
                    lastAccessed: new Date().toISOString()
                };
                await storage.set(`progress-${username}`, JSON.stringify(progress));
                console.log('Progress saved for', username, ':', progress);
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        };

        const handleLogin = async () => {
            if (inputUsername.trim()) {
                const user = inputUsername.trim();
                setUsername(user);
                setIsLoggedIn(true);
                setIsLoadingProgress(true);

                try {
                    await storage.set('current-user', user);
                    await loadUserProgress(user);
                } catch (error) {
                    console.error('Login error:', error);
                    setIsLoadingProgress(false);
                }
            }
        };

        const handleLogout = async () => {
            // Save progress one final time before logging out
            await saveProgress();

            try {
                await storage.delete('current-user');
            } catch (error) {
                console.error('Logout error:', error);
            }

            // Now clear the UI state
            setIsLoggedIn(false);
            setUsername('');
            setInputUsername('');
            setCurrentCard(0);
            setKnownCards(new Set());
            setFilterCategory("All");
            setIsFlipped(false);
            setCategoryTime({});
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
            // Get the actual index in the full flashcards array
            const actualCard = filteredCards[currentCard];
            const actualIndex = flashcards.findIndex(card => card === actualCard);

            const newKnown = new Set(knownCards);
            if (newKnown.has(actualIndex)) {
                newKnown.delete(actualIndex);
            } else {
                newKnown.add(actualIndex);
            }
            setKnownCards(newKnown);
        };

        const resetProgress = async () => {
            setKnownCards(new Set());
            setCurrentCard(0);
            setIsFlipped(false);
            setFilterCategory("All");
            setCategoryTime({});
            if (username) {
                try {
                    await storage.delete(`progress-${username}`);
                } catch (error) {
                    console.error('Failed to reset progress:', error);
                }
            }
        };

        const formatTime = (seconds) => {
            if (seconds < 60) return `${seconds}s`;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}m ${secs}s`;
        };

        const getCategoryStats = () => {
            const stats: Record<string, { total: number; known: number; percentage: number; timeSpent: number }> = {};
            const categoryList = categories.filter(c => c !== "All");

            categoryList.forEach(cat => {
                const catCards = flashcards.filter(card => card.category === cat);
                const catIndices = catCards.map(card =>
                    flashcards.findIndex(fc => fc === card)
                );
                const knownInCategory = catIndices.filter(idx => knownCards.has(idx)).length;

                stats[cat] = {
                    total: catCards.length,
                    known: knownInCategory,
                    percentage: Math.round((knownInCategory / catCards.length) * 100),
                    timeSpent: categoryTime[cat] || 0
                };
            });

            return stats;
        };

        const getOverallProgress = () => {
            const total = flashcards.length;
            const known = knownCards.size;
            return {
                total,
                known,
                percentage: Math.round((known / total) * 100)
            };
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

        // Dashboard View
        if (showDashboard) {
            const categoryStats = getCategoryStats();
            const overallProgress = getOverallProgress();
            const completedCategories = Object.values(categoryStats).filter(stat => stat.percentage === 100).length;
            const totalCategories = Object.keys(categoryStats).length;

            // Badge definitions
            const badges = [
                { id: 'beginner', name: 'First Steps', emoji: '🌱', requirement: 'Mark your first card as known', earned: knownCards.size >= 1 },
                { id: 'studious', name: 'Estudioso', emoji: '📚', requirement: 'Mark 10 cards as known', earned: knownCards.size >= 10 },
                { id: 'dedicated', name: 'Dedicado', emoji: '⭐', requirement: 'Mark 25 cards as known', earned: knownCards.size >= 25 },
                { id: 'category-master', name: 'Category Master', emoji: '🏆', requirement: 'Complete any category 100%', earned: completedCategories >= 1 },
                { id: 'polyglot', name: 'Políglota', emoji: '🌟', requirement: 'Complete 3 categories', earned: completedCategories >= 3 },
                { id: 'time-warrior', name: 'Time Warrior', emoji: '⏰', requirement: 'Study for 10+ minutes total', earned: Object.values(categoryTime).reduce((a, b) => a + b, 0) >= 600 },
                { id: 'perfectionist', name: 'Perfeccionista', emoji: '💎', requirement: 'Complete ALL categories 100%', earned: completedCategories === totalCategories && totalCategories > 0 },
                { id: 'speed-learner', name: 'Speed Learner', emoji: '⚡', requirement: 'Complete 50% in under 30 mins', earned: overallProgress.percentage >= 50 && Object.values(categoryTime).reduce((a, b) => a + b, 0) < 1800 },
            ];

            const earnedBadges = badges.filter(b => b.earned);
            const lockedBadges = badges.filter(b => !b.earned);

            return (
                <div className="min-h-screen bg-gradient-to-br from-red-500 via-white to-green-600 p-4 md:p-8">
                    <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.1) 35px, rgba(0,0,0,.1) 70px)`
                    }}></div>

                    <div className="max-w-4xl mx-auto relative">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-yellow-400 flex items-center gap-2">
                                <User className="w-4 h-4 text-pink-500" />
                                <span className="font-bold text-gray-800">{username}</span>
                            </div>
                            <button
                                onClick={() => setShowDashboard(false)}
                                className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-green-400 flex items-center gap-2 hover:bg-green-50 transition font-bold text-gray-800"
                            >
                                ← Back to Cards
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg flex items-center justify-center gap-3">
                                <BarChart3 className="w-10 h-10" />
                                Tu Progreso
                            </h1>
                            <p className="text-white font-semibold drop-shadow">Your Learning Dashboard</p>
                        </div>

                        {/* Overall Progress Card */}
                        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-4 border-yellow-400">
                            <div className="flex items-center gap-3 mb-4">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <h2 className="text-2xl font-bold text-gray-800">Overall Progress</h2>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-5xl font-bold text-pink-600">{overallProgress.percentage}%</p>
                                    <p className="text-gray-600 font-medium mt-2">
                                        {overallProgress.known} of {overallProgress.total} cards mastered
                                    </p>
                                    <p className="text-sm text-green-600 font-bold mt-1">
                                        🏆 {completedCategories} of {totalCategories} categories completed
                                    </p>
                                </div>
                                <div className="text-6xl">
                                    {overallProgress.percentage === 100 ? '🎉' : overallProgress.percentage >= 75 ? '🌟' : overallProgress.percentage >= 50 ? '🚀' : '💪'}
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-pink-500 to-red-500 h-full transition-all duration-500"
                                    style={{ width: `${overallProgress.percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Badges Section */}
                        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 border-4 border-purple-400">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">🎖️</span>
                                <h2 className="text-2xl font-bold text-gray-800">Your Badges</h2>
                                <span className="ml-auto bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                {earnedBadges.length} / {badges.length}
              </span>
                            </div>

                            {/* Earned Badges */}
                            {earnedBadges.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Earned 🎉</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {earnedBadges.map(badge => (
                                            <div
                                                key={badge.id}
                                                className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 text-center border-2 border-yellow-400 shadow-md hover:scale-105 transition-transform"
                                            >
                                                <div className="text-4xl mb-2 animate-bounce">{badge.emoji}</div>
                                                <p className="font-bold text-gray-800 text-sm">{badge.name}</p>
                                                <p className="text-xs text-gray-600 mt-1">{badge.requirement}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Locked Badges */}
                            {lockedBadges.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Locked 🔒</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {lockedBadges.map(badge => (
                                            <div
                                                key={badge.id}
                                                className="bg-gray-100 rounded-xl p-4 text-center border-2 border-gray-300 opacity-60"
                                            >
                                                <div className="text-4xl mb-2 grayscale">{badge.emoji}</div>
                                                <p className="font-bold text-gray-600 text-sm">{badge.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{badge.requirement}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {earnedBadges.length === badges.length && (
                                <div className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold">🎊 ¡Felicidades! You've earned all badges! 🎊</p>
                                    <p className="text-sm mt-1">You're a Spanish learning champion!</p>
                                </div>
                            )}
                        </div>

                        {/* Category Stats Grid */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {Object.entries(categoryStats).map(([category, stats]) => (
                                <div key={category} className={`bg-white rounded-xl shadow-lg p-6 border-2 ${stats.percentage === 100 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-white' : 'border-green-300'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-800">{category}</h3>
                                        {stats.percentage === 100 && (
                                            <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                                <Trophy className="w-3 h-3" />
                                                MASTERED!
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between text-sm font-semibold mb-1">
                                                <span className="text-gray-600">Completion</span>
                                                <span className="text-pink-600">{stats.percentage}%</span>
                                            </div>
                                            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${stats.percentage === 100 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}
                                                    style={{ width: `${stats.percentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {stats.known} / {stats.total} cards
                                            </p>
                                        </div>

                                        {/* Time Spent */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-medium">Time Spent</span>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">
                      {formatTime(stats.timeSpent)}
                    </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Study Tips */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-yellow-400">
                            <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                                <span className="text-2xl">💡</span> Keep Going!
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-2 font-medium">
                                <li>🎯 Focus on categories with lower completion rates</li>
                                <li>🔄 Review cards you've marked as known regularly</li>
                                <li>⏰ Spend at least 5 minutes per category for best retention</li>
                                <li>🗣️ Practice speaking the phrases out loud!</li>
                                <li>🏆 Earn all badges to become a master Spanish learner!</li>
                            </ul>
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
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDashboard(true)}
                                className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-blue-400 flex items-center gap-2 hover:bg-blue-50 transition font-bold text-gray-800"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Stats
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-red-400 flex items-center gap-2 hover:bg-red-50 transition font-bold text-gray-800"
                            >
                                <LogOut className="w-4 h-4" />
                                Salir
                            </button>
                        </div>
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

                        {knownCards.has(flashcards.findIndex(card => card === filteredCards[currentCard])) && (
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
                                knownCards.has(flashcards.findIndex(card => card === filteredCards[currentCard]))
                                    ? 'bg-green-500 text-white hover:bg-green-600 border-green-700'
                                    : 'bg-white hover:bg-yellow-100 border-yellow-400 text-gray-800'
                            }`}
                        >
                            {knownCards.has(flashcards.findIndex(card => card === filteredCards[currentCard])) ? '✓ ¡Lo sé!' : 'Marcar'}
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