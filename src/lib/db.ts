import fs from 'fs';
import path from 'path';
import { NewsItem } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'news.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize DB if empty
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

export const getNews = (): NewsItem[] => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading news database:', error);
    return [];
  }
};

export const saveNews = (news: NewsItem[]) => {
  try {
    // Merge new news with existing news, avoiding duplicates by URL
    const existingNews = getNews();
    const existingUrls = new Set(existingNews.map(item => item.url));
    
    const newUniqueNews = news.filter(item => !existingUrls.has(item.url));
    const updatedNews = [...newUniqueNews, ...existingNews];
    
    // Sort by date descending
    updatedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    fs.writeFileSync(DB_PATH, JSON.stringify(updatedNews, null, 2));
    return newUniqueNews.length; // Return count of new items added
  } catch (error) {
    console.error('Error saving news database:', error);
    return 0;
  }
};
