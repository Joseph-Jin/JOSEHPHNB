import axios from 'axios';
import * as cheerio from 'cheerio';
import { subDays, isAfter, parseISO } from 'date-fns';
import { NewsItem } from './types';
import { translateText } from './translate';

const KEYWORDS = [
  'Action Camera',
  'Insta360',
  'GoPro',
  'DJI',
  'Smart Glasses',
  'Ray-Ban',
  'AR',
  'VR',
  'Thumb Camera',
  '360 Camera',
  'Wearable',
  'Drone',
  'Xreal',
  'Rokid',
  'Pico',
  'Quest',
  'Vision Pro',
  'Spatial Computing',
  'Smart Ring',
  'AI Pin',
  'MicroLED',
  'Waveguide',
  'Optical',
  'Sensor',
  'Chip',
  'Processor',
  'Display'
];

const FUNDING_KEYWORDS = [
  'Funding',
  'Series A',
  'Series B',
  'Series C',
  'Series D',
  'Pre-seed',
  'Seed',
  'Angel',
  'IPO',
  'Acquisition',
  'Invest',
  'Capital',
  'Venture',
  'Raise',
  'Equity',
  'Unicorn',
  'Valuation',
  '融资',
  '投资',
  '上市',
  '收购',
  '资金',
  '创投',
  'Supply Chain',
  '供应链',
  '股份',
  '估值'
];

function isRecent(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const thirtyDaysAgo = subDays(new Date(), 30);
    return isAfter(date, thirtyDaysAgo);
  } catch (e) {
    return true; // Keep if date parsing fails, to be safe
  }
}

function processItem(
  source: string, 
  title: string, 
  link: string, 
  summary: string, 
  date: string, 
  imageUrl: string, 
  index: number
): NewsItem | null {
  if (!title || !link) return null;

  // Date Filtering
  if (!isRecent(date)) return null;

  // Keyword filtering
  const contentToCheck = `${title} ${summary}`;
  const hasKeyword = KEYWORDS.some(keyword => 
    contentToCheck.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasKeyword) {
    // Determine category
    const isFunding = FUNDING_KEYWORDS.some(keyword => 
      contentToCheck.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      id: `${source.toLowerCase().replace(/\s/g, '-')}-${index}-${Date.now()}`,
      title,
      translatedTitle: '',
      summary: summary || title,
      translatedSummary: '',
      source,
      url: link,
      date,
      imageUrl,
      category: isFunding ? 'funding' : 'industry'
    };
  }
  return null;
}

async function scrapeTechCrunch(): Promise<NewsItem[]> {
  try {
    const url = 'https://techcrunch.com/category/gadgets/';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    const newsItems: NewsItem[] = [];

    $('h2, h3').each((index, element) => {
      const titleElement = $(element).find('a');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href') || '';
      
      let summary = '';
      const parent = $(element).parent();
      const summaryElement = parent.find('p, .excerpt, .content');
      if (summaryElement.length > 0) summary = summaryElement.first().text().trim();
      
      const dateElement = parent.find('time');
      const date = dateElement.attr('datetime') || new Date().toISOString();
      
      const imageElement = parent.find('img');
      const imageUrl = imageElement.attr('src') || '';

      if (link.includes('techcrunch.com')) {
        const item = processItem('TechCrunch', title, link, summary, date, imageUrl, index);
        if (item) newsItems.push(item);
      }
    });

    return newsItems;
  } catch (error) {
    console.error('Error scraping TechCrunch:', error);
    return [];
  }
}

async function scrapeTheVerge(): Promise<NewsItem[]> {
  try {
    const url = 'https://www.theverge.com/tech';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    const newsItems: NewsItem[] = [];

    // The Verge structure varies. Often h2 a
    $('h2').each((index, element) => {
      let title = $(element).text().trim();
      let link = $(element).find('a').attr('href') || $(element).parents('a').attr('href') || '';
      
      // If title is empty, try to find a inside
      if (!title) {
         title = $(element).find('a').text().trim();
      }

      if (link && !link.startsWith('http')) {
        link = `https://www.theverge.com${link}`;
      }

      // Try to find time
      // Often time is not in the immediate parent on listing pages, skip date check or assume recent if on front page
      const date = new Date().toISOString();
      
      const item = processItem('The Verge', title, link, title, date, '', index);
      if (item) newsItems.push(item);
    });

    return newsItems;
  } catch (error) {
    console.error('Error scraping The Verge:', error);
    return [];
  }
}

async function scrapeUploadVR(): Promise<NewsItem[]> {
  try {
    const url = 'https://www.uploadvr.com/';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    const newsItems: NewsItem[] = [];

    // UploadVR cards
    $('a.card, article, .post-card, .card').each((index, element) => {
       // Title might be in h2, h3, or just text
       let title = $(element).find('h2, h3, .card__title, .post-title').text().trim();
       
       let link = $(element).attr('href') || $(element).find('a').attr('href') || '';
       if (link && !link.startsWith('http')) {
         link = `https://www.uploadvr.com${link}`;
       }
       
       const dateElement = $(element).find('time');
       const date = dateElement.attr('datetime') || new Date().toISOString();

       if (title && link) {
         const item = processItem('UploadVR', title, link, title, date, '', index);
         if (item) newsItems.push(item);
       }
    });

    return newsItems;
  } catch (error) {
    console.error('Error scraping UploadVR:', error);
    return [];
  }
}

async function scrapeZhidx(): Promise<NewsItem[]> {
    try {
      const url = 'https://zhidx.com/';
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      const $ = cheerio.load(data);
    const newsItems: NewsItem[] = [];

    $('.post-list-item, article, .item, .post, li.post').each((index, element) => {
      let title = $(element).find('h2 a, h3 a, .title a, a.title').text().trim();
      if (!title) title = $(element).find('a').first().text().trim();
      
      const titleElement = $(element).find('h2 a, h3 a, .title a, a.title');
      let link = titleElement.attr('href') || $(element).find('a').attr('href') || '';
      const summary = $(element).find('.excerpt, p, .desc').text().trim();
      
      const date = new Date().toISOString(); 
      
      if (title && link) {
        const item = processItem('Zhidx', title, link, summary, date, '', index);
        if (item) newsItems.push(item);
      }
    });
  
      return newsItems;
    } catch (error) {
      console.error('Error scraping Zhidx:', error);
      return [];
    }
}

async function scrapeITHome(): Promise<NewsItem[]> {
    try {
      const url = 'https://www.ithome.com/';
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      const $ = cheerio.load(data);
    const newsItems: NewsItem[] = [];

    // ITHome
    $('.new-list-1 li, .list li, .n_list li, .ul-list li, ul#list li').each((index, element) => {
      let titleElement = $(element).find('h2 a');
      if (titleElement.length === 0) titleElement = $(element).find('a').first();
      
      const title = titleElement.text().trim();
      let link = titleElement.attr('href') || '';
      if (link && !link.startsWith('http')) link = `https://www.ithome.com${link}`;
        
      const date = new Date().toISOString(); 
      
      if (title && link) {
          const item = processItem('ITHome', title, link, title, date, '', index);
          if (item) newsItems.push(item);
      }
    });
  
      return newsItems;
    } catch (error) {
      console.error('Error scraping ITHome:', error);
      return [];
    }
}

export async function scrapeAllNews(): Promise<NewsItem[]> {
  const [tc, tv, uv, zh, it] = await Promise.all([
    scrapeTechCrunch(),
    scrapeTheVerge(),
    scrapeUploadVR(),
    scrapeZhidx(),
    scrapeITHome()
  ]);
  
  const allNews = [...tc, ...tv, ...uv, ...zh, ...it];

  // Translate items (in parallel)
  await Promise.all(allNews.map(async (item) => {
     if (['TechCrunch', 'The Verge', 'UploadVR'].includes(item.source)) {
         item.translatedTitle = await translateText(item.title);
         item.translatedSummary = await translateText(item.summary);
     } else {
         // Chinese sources - keep original
         item.translatedTitle = item.title;
         item.translatedSummary = item.summary;
     }
  }));

  return allNews;
}
