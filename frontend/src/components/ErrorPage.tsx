import { useState } from 'react';
import { RefreshCw, Home, Server, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
    title?: string;
    message?: string;
    showBackButton?: boolean;
    onRefresh?: () => void;
}

export default function ErrorPage({
    title = "Oops! Server Tengah Bangun 😴",
    message = "Server baru lepas restart. Jangan risau, cuba refresh sekejap ya!",
    showBackButton = true,
    onRefresh
}: ErrorPageProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        if (onRefresh) {
            onRefresh();
        } else {
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-white/50">

                {/* Animated Illustration */}
                <div className="relative mb-8">
                    {/* Main Server Icon with Animation */}
                    <div className="flex justify-center items-center">
                        <div className="relative">
                            {/* Floating Background Circles */}
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-200/50 rounded-full animate-pulse"></div>
                            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-pink-200/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute top-1/2 -right-8 w-8 h-8 bg-blue-200/50 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>

                            {/* Server Icon with Bounce */}
                            <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center transform hover:scale-105 transition-transform animate-bounce" style={{ animationDuration: '3s' }}>
                                <Server className="w-16 h-16 text-white" />

                                {/* Sleeping Zzzs */}
                                <div className="absolute -top-2 -right-2 text-2xl animate-pulse">💤</div>
                            </div>

                            {/* WiFi Icons */}
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                <WifiOff className="w-5 h-5 text-red-400 animate-pulse" />
                                <Wifi className="w-5 h-5 text-green-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                            </div>
                        </div>
                    </div>

                    {/* Floating Error Icons */}
                    <div className="absolute top-0 left-8 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>⚡</div>
                    <div className="absolute top-4 right-8 text-xl animate-bounce" style={{ animationDelay: '0.8s' }}>🔧</div>
                    <div className="absolute bottom-0 left-12 text-lg animate-bounce" style={{ animationDelay: '1.2s' }}>⚙️</div>
                </div>

                {/* Headline */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-relaxed">
                    {title}
                </h1>

                {/* Supporting Text */}
                <p className="text-gray-600 mb-6 text-lg">
                    {message}
                </p>

                {/* Loading Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>

                {/* Fun Extra Message */}
                <p className="text-sm text-gray-500 mb-8 italic">
                    Kalau masih tak jalan, mungkin server tengah stretch badan 💪
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {/* Primary Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <span>{isRefreshing ? 'Refreshing...' : '🔄 Refresh Page'}</span>
                    </button>

                    {/* Secondary Back to Dashboard Button */}
                    {showBackButton && (
                        <Link
                            to="/admin"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                            <Home className="w-5 h-5" />
                            <span>🏠 Back to Dashboard</span>
                        </Link>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        E-CARE System • Don't worry, we're on it! 🚀
                    </p>
                </div>
            </div>
        </div>
    );
}
