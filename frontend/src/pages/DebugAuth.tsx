import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DebugAuth() {
    const { user, role, token, isAuthenticated } = useAuth();
    const [storageData, setStorageData] = useState<any>({});

    useEffect(() => {
        const updateData = () => {
            setStorageData({
                localToken: localStorage.getItem('token'),
                localRole: localStorage.getItem('role'),
                localUser: localStorage.getItem('user'),
            });
        };

        updateData();
        const interval = setInterval(updateData, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-10 bg-gray-100 min-h-screen font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Debug Auth Status</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b mb-2">Auth Context State</h2>
                    <pre>{JSON.stringify({ isAuthenticated, role, hasUser: !!user, hasToken: !!token }, null, 2)}</pre>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b mb-2">Local Storage (Raw)</h2>
                    <p><strong>Token:</strong> {storageData.localToken ? 'Present (First 10 chars: ' + storageData.localToken.substring(0, 10) + '...)' : 'MISSING'}</p>
                    <p><strong>Role:</strong> {storageData.localRole || 'MISSING'}</p>
                    <p><strong>User:</strong> {storageData.localUser ? 'Present' : 'MISSING'}</p>
                    {storageData.localUser && (
                        <pre className="mt-2 bg-gray-50 p-2 text-xs overflow-auto">
                            {storageData.localUser}
                        </pre>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-white p-4 rounded shadow">
                <h2 className="font-bold border-b mb-2">Actions</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear Storage & Reload
                    </button>
                    <a
                        href="/admin"
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 inline-block"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        </div>
    );
}
