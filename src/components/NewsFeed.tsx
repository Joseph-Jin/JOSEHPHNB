'use client';

import { useState } from 'react';
import { NewsItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface NewsFeedProps {
  news: NewsItem[];
}

export default function NewsFeed({ news }: NewsFeedProps) {
  const [activeTab, setActiveTab] = useState<'industry' | 'funding'>('industry');

  const filteredNews = news.filter(item => {
    const category = item.category || 'industry'; // Default to industry for old items
    return category === activeTab;
  });

  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'industry'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('industry')}
        >
          行业资讯 ({news.filter(i => (i.category || 'industry') === 'industry').length})
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'funding'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('funding')}
        >
          创投融资 ({news.filter(i => i.category === 'funding').length})
        </button>
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500">暂无相关资讯</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredNews.map((item) => (
            <article 
              key={item.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-start p-4 gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    item.source === 'TechCrunch' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    item.source === 'The Verge' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                    item.source === 'UploadVR' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                    item.source === 'Zhidx' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    item.source === 'ITHome' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {item.source}
                  </span>
                  <time className="text-xs text-gray-400 whitespace-nowrap" dateTime={item.date}>
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: zhCN })}
                  </time>
                </div>
                
                <h2 className="text-base font-bold leading-tight mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2">
                    {item.translatedTitle || item.title}
                  </a>
                </h2>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {item.translatedSummary || item.summary}
                </p>
              </div>

              {/* Optional: Add image thumbnail if desired for density, or keep text only for max density */}
              {/* For high density, maybe text only is better, or a very small thumbnail */}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
