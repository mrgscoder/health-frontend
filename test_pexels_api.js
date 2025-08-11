const axios = require('axios');

const PEXELS_API_KEY = "51jK6lrhunQGAx64k3po8vVs0d5ADhDFsyBhyt4T8YVIPt3o4j689D3R";
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

async function testPexelsAPI() {
  try {
    console.log('🧪 Testing Pexels API...');
    console.log('🔑 API Key:', PEXELS_API_KEY.substring(0, 10) + '...');
    console.log('🌐 API URL:', PEXELS_API_URL);
    
    const response = await axios.get(PEXELS_API_URL, {
      headers: { 
        Authorization: PEXELS_API_KEY 
      },
      params: { 
        query: 'apple food', 
        per_page: 1,
        orientation: 'landscape'
      },
    });

    console.log('✅ API Response Status:', response.status);
    console.log('📋 Response Headers:', response.headers);
    console.log('📈 Rate Limit Remaining:', response.headers['x-ratelimit-remaining'] || 'Unknown');
    console.log('📈 Total Results:', response.data.total_results || 0);
    console.log('📈 Photos Found:', response.data.photos?.length || 0);
    
    if (response.data.photos && response.data.photos.length > 0) {
      const photo = response.data.photos[0];
      console.log('🖼️ Image URL:', photo.src.large2x);
      console.log('📏 Image ID:', photo.id);
      console.log('📝 Alt Text:', photo.alt || 'No alt text');
      console.log('✅ Pexels API is working correctly!');
    } else {
      console.log('❌ No photos found in response');
    }
    
  } catch (error) {
    console.error('❌ Pexels API Error:', error.message);
    if (error.response) {
      console.error('📊 Error Status:', error.response.status);
      console.error('📋 Error Headers:', error.response.headers);
      console.error('📄 Error Data:', error.response.data);
    }
  }
}

testPexelsAPI();
