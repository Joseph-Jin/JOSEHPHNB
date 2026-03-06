import axios from 'axios';

export async function translateText(text: string, targetLang: string = 'zh-CN'): Promise<string> {
  try {
    // Using the free Google Translate API endpoint (unofficial, for demonstration purposes)
    // In a production environment, you should use a paid API like Google Cloud Translation or DeepL
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url);
    
    // The response structure is typically [[["translated text", "original text", ...], ...], ...]
    if (response.data && response.data[0] && response.data[0][0] && response.data[0][0][0]) {
      // Concatenate all parts of the translation
      return response.data[0].map((part: any) => part[0]).join('');
    }
    
    return text; // Fallback to original text if translation fails
  } catch (error) {
    // console.error('Translation error:', error);
    return text; // Fallback to original text
  }
}
