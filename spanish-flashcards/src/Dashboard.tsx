import React from 'react';
import { BarChart3, Clock, Trophy, User } from 'lucide-react';

interface CategoryStats {
    total: number;
    known: number;
    percentage: number;
    timeSpent: number;
}

interface DashboardProps {
    username: string;
    categoryStats: Record<string, CategoryStats>;
    overallProgress: {
        total: number;
        known: number;
        percentage: number;
    };
    onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
                                                 username,
                                                 categoryStats,
                                                 overallProgress,
                                                 onBack
                                             }) => {
    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

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
                        onClick={onBack}
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

                {/* Category Stats Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {Object.entries(categoryStats).map(([category, stats]) => (
                        <div key={category} className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-300">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{category}</h3>

                            <div className="space-y-3">
                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between text-sm font-semibold mb-1">
                                        <span className="text-gray-600">Completion</span>
                                        <span className="text-pink-600">{stats.percentage}%</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all"
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
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;