import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchImageForFood } from '../services/imageService';

const ImageTest: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFoods = ['apple', 'pizza', 'salad', 'chicken', 'rice'];

  const testImageFetch = async (foodName: string) => {
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      console.log(`🧪 Testing image fetch for: ${foodName}`);
      const url = await fetchImageForFood(foodName);
      
      if (url) {
        setImageUrl(url);
        console.log(`✅ Successfully fetched image for ${foodName}:`, url);
      } else {
        setError(`No image found for ${foodName}`);
        console.log(`❌ No image found for ${foodName}`);
      }
    } catch (err) {
      setError(`Error fetching image for ${foodName}: ${err}`);
      console.error(`❌ Error fetching image for ${foodName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Pexels API Image Test
      </Text>

      {/* Test Buttons */}
      <View style={{ marginBottom: 20 }}>
        {testFoods.map((food) => (
          <TouchableOpacity
            key={food}
            onPress={() => testImageFetch(food)}
            style={{
              backgroundColor: '#4CAF50',
              padding: 10,
              marginVertical: 5,
              borderRadius: 5,
            }}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Test: {food}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading State */}
      {loading && (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ marginTop: 10 }}>Fetching image...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={{ backgroundColor: '#ffebee', padding: 10, borderRadius: 5, marginVertical: 10 }}>
          <Text style={{ color: '#c62828' }}>{error}</Text>
        </View>
      )}

      {/* Image Display */}
      {imageUrl && (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Fetched Image:</Text>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 200, height: 150, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Instructions */}
      <View style={{ backgroundColor: '#e8f5e8', padding: 15, borderRadius: 5, marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Instructions:</Text>
        <Text style={{ fontSize: 12, lineHeight: 18 }}>
          1. Make sure you've set up your Pexels API key in config.ts{'\n'}
          2. Tap any food button to test image fetching{'\n'}
          3. Check the console for detailed logs{'\n'}
          4. Images are cached to avoid repeated API calls
        </Text>
      </View>
    </View>
  );
};

export default ImageTest; 