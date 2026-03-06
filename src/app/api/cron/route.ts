import { NextResponse } from 'next/server';
import { saveNews } from '@/lib/db';
import { scrapeAllNews } from '@/lib/scraper';

export async function GET(request: Request) {
  // Check for authorization header (simple check for Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const news = await scrapeAllNews();
    const count = saveNews(news);
    return NextResponse.json({ message: `Cron job executed. Scraped ${news.length} items. Added ${count} new items.` });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
