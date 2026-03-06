export interface NewsItem {
  id: string;
  title: string;
  translatedTitle: string;
  summary: string;
  translatedSummary: string;
  source: string;
  url: string;
  date: string; // ISO string
  imageUrl?: string;
  category: 'industry' | 'funding';
}
