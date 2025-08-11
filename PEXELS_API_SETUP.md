# Pexels API Setup Guide

This guide explains how to set up the Pexels API for fetching food images in the Health app.

## What is Pexels API?

Pexels is a free stock photo and video service that provides high-quality images. The API allows us to search for food-related images to enhance the user experience in the food diary.

## Setup Instructions

### 1. Get a Pexels API Key

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key

### 2. Configure the API Key

1. Open `frontend/health/src/config.ts`
2. Replace `YOUR_PEXELS_API_KEY` with your actual API key:

```typescript
export const PEXELS_API_KEY = "your_actual_api_key_here";
```

### 3. API Usage Limits

- **Free Plan**: 200 requests per hour
- **Paid Plans**: Higher limits available

## Features

### Image Caching
- Images are cached locally to avoid repeated API calls
- Cache is cleared when the app restarts
- Failed requests are cached to avoid repeated failed calls

### Fallback Display
- If no image is found, the food icon is displayed instead
- Graceful error handling ensures the app continues to work

### Image Quality
- Uses `large2x` size for optimal quality
- Landscape orientation for better food presentation
- Automatic resizing and cropping

## Implementation Details

### Files Modified:
- `frontend/health/src/config.ts` - API configuration
- `frontend/health/app/navigation/tabs/food/services/imageService.ts` - Image fetching service
- `frontend/health/app/navigation/tabs/food/services/foodService.ts` - Integration with food data
- `frontend/health/app/navigation/tabs/food/types/foodTypes.ts` - Added imageUrl property
- `frontend/health/app/navigation/tabs/foodList.tsx` - Updated UI to show images
- `frontend/health/app/navigation/tabs/food/components/MealSection.tsx` - Updated saved foods display

### Key Functions:
- `fetchImageForFood(foodName)` - Fetches image for a single food item
- `fetchImagesForFoodItems(foodItems)` - Fetches images for multiple food items
- `clearImageCache()` - Clears the image cache
- `getCacheStats()` - Gets cache statistics

## Testing

1. Set up your API key
2. Run the app
3. Navigate to the Food Diary
4. Try adding foods to see if images appear
5. Check the console for API request logs

## Troubleshooting

### No Images Appearing
- Verify your API key is correct
- Check the console for error messages
- Ensure you have internet connectivity
- Verify the API key has sufficient quota

### API Rate Limiting
- The app includes caching to minimize API calls
- If you hit rate limits, wait for the hour to reset
- Consider upgrading to a paid plan for higher limits

### Performance Issues
- Images are loaded asynchronously
- Fallback icons are shown while loading
- Cache reduces repeated API calls

## Security Notes

- API keys should be kept secure
- Consider using environment variables for production
- The current implementation uses the key directly in the config file
- For production, use a backend proxy to hide the API key 