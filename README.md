# Tech News Aggregator

This is a Next.js application that aggregates news about Action Cameras, Thumb Cameras, and Smart Glasses from major tech media, translates them into Chinese, and presents them in a clean, mobile-friendly interface.

## Features

- **Automated Scraping**: Fetches news from TechCrunch (expandable to other sources).
- **Keyword Filtering**: Focuses on specific hardware like Insta360, GoPro, DJI, Smart Glasses, AR/VR.
- **Translation**: Automatically translates titles and summaries to Chinese.
- **Responsive UI**: Built with Tailwind CSS for mobile and desktop.
- **Manual/Auto Refresh**: Supports manual refresh via UI and automated updates via Cron.

## Getting Started

### Prerequisites

- Node.js 18+ installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd news-aggregator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Usage

- The homepage displays the latest news.
- Click "立即抓取更新" to fetch the latest articles manually.
- Click on any news item to read the original article.

## Deployment on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Deploy.

### Setting up Cron Jobs (Optional)

To enable automatic daily updates:

1. Create a `vercel.json` file in the root directory:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron",
         "schedule": "0 8 * * *"
       }
     ]
   }
   ```
2. Set an environment variable `CRON_SECRET` in your Vercel project settings.
3. Update `src/app/api/cron/route.ts` to check for this secret if you want to secure the endpoint.

## License

MIT
