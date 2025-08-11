import axios from 'axios';
import { PEXELS_API_KEY } from '../../../../../src/config';

const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

// Cache for storing fetched images to avoid repeated API calls
const imageCache = new Map<string, string>();

export interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
  url: string;
}

/**
 * Fetch image for a single food item from Pexels API
 * @param foodName - The name of the food item
 * @returns Promise<string | null> - The image URL or null if not found
 */
export const fetchImageForFood = async (foodName: string): Promise<string | null> => {
  try {
    // Check cache first
    if (imageCache.has(foodName)) {
      console.log(`📸 Using cached image for: ${foodName}`);
      return imageCache.get(foodName) || null;
    }

    console.log(`🔍 Fetching image for: ${foodName}`);
    console.log(`🌐 API URL: ${PEXELS_API_URL}`);
    console.log(`🔑 API Key: ${PEXELS_API_KEY.substring(0, 10)}...`);
    
    const response = await axios.get<PexelsResponse>(PEXELS_API_URL, {
      headers: { 
        Authorization: PEXELS_API_KEY 
      },
      params: { 
        query: `${foodName} food`, 
        per_page: 1,
        orientation: 'landscape'
      },
    });

    // Log response headers and status
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Response Headers:`, response.headers);
    console.log(`📈 Rate Limit Remaining: ${response.headers['x-ratelimit-remaining'] || 'Unknown'}`);
    console.log(`📈 Rate Limit Reset: ${response.headers['x-ratelimit-reset'] || 'Unknown'}`);
    console.log(`📈 Total Results: ${response.data.total_results || 0}`);
    console.log(`📈 Per Page: ${response.data.per_page || 0}`);

    const photo = response.data.photos[0];
    
    if (photo) {
      const imageUrl = photo.src.large2x;
      // Cache the result
      imageCache.set(foodName, imageUrl);
      console.log(`✅ Image found for: ${foodName}`);
      console.log(`🖼️ Image URL: ${imageUrl}`);
      console.log(`📏 Image ID: ${photo.id}`);
      console.log(`📝 Alt Text: ${photo.alt || 'No alt text'}`);
      return imageUrl;
    } else {
      console.log(`❌ No image found for: ${foodName}`);
      console.log(`📊 Total results in response: ${response.data.photos?.length || 0}`);
      // Cache null result to avoid repeated failed requests
      imageCache.set(foodName, '');
      return null;
    }
  } catch (error: any) {
    console.error(`❌ Failed to fetch image for ${foodName}:`, error);
    if (error.response) {
      console.error(`📊 Error Status: ${error.response.status}`);
      console.error(`📋 Error Headers:`, error.response.headers);
      console.error(`📄 Error Data:`, error.response.data);
    }
    return null;
  }
};

/**
 * Fetch images for multiple food items
 * @param foodItems - Array of food items
 * @returns Promise<Array<T & { imageUrl?: string }>>
 */
export const fetchImagesForFoodItems = async <T extends { name: string }>(
  foodItems: T[]
): Promise<Array<T & { imageUrl?: string }>> => {
  console.log(`🖼️ Fetching images for ${foodItems.length} food items`);
  console.log(`📋 Food items:`, foodItems.map(item => item.name));
  
  const startTime = Date.now();
  const itemsWithImages = await Promise.all(
    foodItems.map(async (item) => {
      const imageUrl = await fetchImageForFood(item.name);
      return { ...item, imageUrl: imageUrl || undefined };
    })
  );

  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const successCount = itemsWithImages.filter(item => item.imageUrl).length;
  const failureCount = itemsWithImages.length - successCount;
  
  console.log(`✅ Completed fetching images for ${foodItems.length} items in ${duration}ms`);
  console.log(`📊 Success: ${successCount}, Failed: ${failureCount}`);
  console.log(`📈 Success Rate: ${((successCount / itemsWithImages.length) * 100).toFixed(1)}%`);
  
  return itemsWithImages;
};

/**
 * Clear the image cache
 */
export const clearImageCache = (): void => {
  imageCache.clear();
  console.log('🗑️ Image cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys())
  };
}; 