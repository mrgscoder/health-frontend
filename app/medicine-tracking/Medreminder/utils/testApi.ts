import ApiService from './apiService';
import { StorageManager } from './storageManager';

export const testApiConnection = async () => {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test 1: Check if we can reach the API
    const medications = await ApiService.getMedications();
    console.log('✅ API connection successful');
    console.log(`📋 Found ${medications.length} existing medications`);
    
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

export const testAddMedication = async () => {
  console.log('🧪 Testing medication addition...');
  
  try {
    const testMedication = {
      name: 'Test Medication',
      category: 'prescription',
      dosage: '500',
      unit: 'mg',
      instructions: 'Take with food',
      color: '#007AFF',
      isActive: true
    };
    
    const success = await ApiService.addMedication(testMedication);
    
    if (success) {
      console.log('✅ Test medication added successfully');
      
      // Verify it was added by fetching all medications
      const medications = await ApiService.getMedications();
      const addedMedication = medications.find(med => med.name === 'Test Medication');
      
      if (addedMedication) {
        console.log('✅ Medication found in database:', addedMedication);
        return addedMedication.id;
      } else {
        console.log('⚠️ Medication not found in database after adding');
        return null;
      }
    } else {
      console.log('❌ Failed to add test medication');
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing medication addition:', error);
    return null;
  }
};

export const testDeleteMedication = async (medicationId: string) => {
  console.log('🧪 Testing medication deletion...');
  
  try {
    const success = await ApiService.deleteMedication(medicationId);
    
    if (success) {
      console.log('✅ Test medication deleted successfully');
      return true;
    } else {
      console.log('❌ Failed to delete test medication');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing medication deletion:', error);
    return false;
  }
};

export const runFullTest = async () => {
  console.log('🚀 Starting full API test...');
  
  // Test 1: Connection
  const connectionOk = await testApiConnection();
  if (!connectionOk) {
    console.log('❌ API connection failed, stopping tests');
    return;
  }
  
  // Test 2: Add medication
  const medicationId = await testAddMedication();
  if (!medicationId) {
    console.log('❌ Medication addition failed');
    return;
  }
  
  // Test 3: Delete medication
  const deleteOk = await testDeleteMedication(medicationId);
  if (!deleteOk) {
    console.log('❌ Medication deletion failed');
    return;
  }
  
  console.log('✅ All tests passed! API and database are working correctly.');
};

export const testStorageManager = async () => {
  console.log('🧪 Testing StorageManager...');
  
  try {
    // Test adding medication through StorageManager
    const testMedication = {
      id: 'test-' + Date.now(),
      name: 'StorageManager Test',
      category: 'prescription',
      dosage: '250',
      unit: 'mg',
      instructions: 'Test medication',
      color: '#FF9500',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const success = await StorageManager.addMedication(testMedication);
    
    if (success) {
      console.log('✅ StorageManager.addMedication() successful');
      
      // Test fetching medications
      const medications = await StorageManager.getMedications();
      console.log(`📋 Retrieved ${medications.length} medications through StorageManager`);
      
      return true;
    } else {
      console.log('❌ StorageManager.addMedication() failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing StorageManager:', error);
    return false;
  }
}; 