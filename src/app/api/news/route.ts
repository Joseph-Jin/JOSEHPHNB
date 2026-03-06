import { NextResponse } from 'next/server';
import { getNews, saveNews } from '@/lib/db';
import { scrapeAllNews } from '@/lib/scraper';

export async function GET() {
  const news = getNews();
  return NextResponse.json(news);
}

export async function POST() {
  try {
    const news = await scrapeAllNews();
    const count = saveNews(news);
    return NextResponse.json({ message: `Scraped ${news.length} items. Added ${count} new items.` });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape news' }, { status: 500 });
  }
}
