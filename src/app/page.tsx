import { getNews } from '@/lib/db';
import RefreshButton from '@/components/RefreshButton';
import NewsFeed from '@/components/NewsFeed';

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';

export default async function Home() {
  const news = getNews();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            智能硬件每日资讯
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            汇集全球主流科技媒体关于运动相机、拇指相机、智能眼镜的最新报道
          </p>
          <div className="mt-4 text-sm text-gray-500">
            每日定时更新 • 3分钟速览 • 仅展示近30天资讯
          </div>
          <div className="mt-6 flex justify-center">
             <RefreshButton />
          </div>
        </header>

        <NewsFeed news={news} />
        
        <footer className="mt-12 text-center text-sm text-gray-500 border-t pt-8">
          <p>© {new Date().getFullYear()} 智能硬件资讯聚合. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
