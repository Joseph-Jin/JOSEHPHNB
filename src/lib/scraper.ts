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
  'Display',
  'Camera',
  'Lens',
  'CMOS',
  'Sony',
  'Canon',
  'Nikon',
  'Fujifilm',
  'Leica',
  'Hasselblad',
  'Sigma',
  'Tamron',
  'Panasonic',
  'Olympus',
  'Imaging',
  'Robot',
  'Robotics',
  'Humanoid',
  'AI',
  'Semiconductor',
  'Manufacturing',
  'SpaceX',
  'Tesla',
  'Xiaomi',
  'Huawei',
  'Apple',
  'Samsung',
  'Microsoft',
  'Google',
  'Meta',
  'Amazon',
  'Nvidia',
  'Intel',
  'AMD',
  'Qualcomm'
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
  '估值',
  '份额',
  'LP',
  'GP',
  '基金',
  '并购',
  '老股'
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

async function scrapePetaPixel(): Promise<NewsItem[]> {
  try {
    const url = 'https://petapixel.com/';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    const newsItems: NewsItem[] = [];

    $('article').each((index, element) => {
      const titleElement = $(element).find('h2 a');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href') || '';
      
      let summary = '';
      const summaryElement = $(element).find('.post-excerpt, p');
      if (summaryElement.length > 0) summary = summaryElement.first().text().trim();
      
      const dateElement = $(element).find('time');
      const date = dateElement.attr('datetime') || new Date().toISOString();
      
      const imageElement = $(element).find('img');
      const imageUrl = imageElement.attr('src') || '';

      if (title && link) {
        const item = processItem('PetaPixel', title, link, summary, date, imageUrl, index);
        if (item) newsItems.push(item);
      }
    });

    return newsItems;
  } catch (error) {
    console.error('Error scraping PetaPixel:', error);
    return [];
  }
}

async function scrape36Kr(): Promise<NewsItem[]> {
  try {
    const url = 'https://36kr.com/feed';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const $ = cheerio.load(data, { xmlMode: true });
    const newsItems: NewsItem[] = [];

    $('item').each((index, element) => {
      const title = $(element).find('title').text().trim();
      const link = $(element).find('link').text().trim();
      const description = $(element).find('description').text().trim();
      const pubDate = $(element).find('pubDate').text().trim();
      
      let date = new Date().toISOString();
      if (pubDate) {
        try {
            date = new Date(pubDate).toISOString();
        } catch (e) {
            console.error('Error parsing date:', pubDate);
        }
      }

      // Check for funding keywords specifically for 36Kr to ensure we capture investment news
      // even if it doesn't match hardware keywords perfectly (though we added many).
      const contentToCheck = `${title} ${description}`;
      const isFunding = FUNDING_KEYWORDS.some(k => contentToCheck.toLowerCase().includes(k.toLowerCase()));
      
      // We process it normally, but if it's funding news, we might want to be more lenient on the main KEYWORDS check
      // OR we just rely on the updated KEYWORDS list.
      // Given the user wants "Smart Hardware and its core supply chain's venture capital info", 
      // strict keyword matching is safer to avoid irrelevant news (e.g. pure software/internet funding).
      // But "36Kr Venture Capital" (requested by user) might imply they want general VC news too?
      // No, user said "Smart Hardware... venture capital info".
      // So I will stick to processItem logic.
      
      const item = processItem('36Kr', title, link, description, date, '', index);
      if (item) {
          newsItems.push(item);
      } else if (isFunding) {
          // Fallback: If it's funding news but missed by hardware keywords, 
          // let's double check if it's really irrelevant.
          // For now, let's trust the hardware keywords list is comprehensive enough.
          // Actually, let's include it if it mentions "Fund", "Capital" etc AND matches ANY of our expanded keywords.
      }
    });

    return newsItems;
  } catch (error) {
    console.error('Error scraping 36Kr:', error);
    return [];
  }
}

export async function scrapeAllNews(): Promise<NewsItem[]> {
  const [tc, tv, pp, zh, it, kr] = await Promise.all([
    scrapeTechCrunch(),
    scrapeTheVerge(),
    scrapePetaPixel(),
    scrapeZhidx(),
    scrapeITHome(),
    scrape36Kr()
  ]);
  
  const allNews = [...tc, ...tv, ...pp, ...zh, ...it, ...kr];

  // Translate items (in parallel)
  await Promise.all(allNews.map(async (item) => {
     if (['TechCrunch', 'The Verge', 'PetaPixel'].includes(item.source)) {
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
