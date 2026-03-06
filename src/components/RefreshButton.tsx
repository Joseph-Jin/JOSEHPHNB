'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetch('/api/news', { method: 'POST' });
      router.refresh(); // Refresh the server component data
    } catch (error) {
      console.error('Failed to refresh', error);
      alert('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          正在更新...
        </>
      ) : (
        '立即抓取更新'
      )}
    </button>
  );
}
