import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { MedicationClass } from './Medreminder/models/MedicationModels';
import { StorageManager } from './Medreminder/utils/storageManager';
import { testApiConnection, testAddMedication, testDeleteMedication } from './Medreminder/utils/testApi';
import { medicineStyles } from './Medreminder/styles/medicineStyles';

interface MedicationData {
  name: string;
  category: string;
  dosage: string;
  unit: string;
  instructions: string;
  color: string;
}

export default function AddMedicationScreen() {
  const [medicationData, setMedicationData] = useState<MedicationData>({
    name: '',
    category: 'prescription',
    dosage: '',
    unit: 'tablet',
    instructions: '',
    color: '#007AFF'
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const params = useLocalSearchParams();
  const isEditing = params.medication ? JSON.parse(params.medication as string) : null;

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return medicationData.name.trim().length > 0;
      case 2:
        return medicationData.category.length > 0;
      case 3:
        return medicationData.dosage.trim().length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        saveMedication();
      }
    } else {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const testApiConnectivity = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing API connectivity...');
      
      // Test 1: Connection
      const connectionOk = await testApiConnection();
      if (!connectionOk) {
        Alert.alert('API Test Failed', 'Cannot connect to the API server. Please check if the backend is running.');
        return;
      }
      
      // Test 2: Add medication
      const medicationId = await testAddMedication();
      if (!medicationId) {
        Alert.alert('API Test Failed', 'Cannot add medication to database. Please check database connection.');
        return;
      }
      
      // Test 3: Delete medication
      const deleteOk = await testDeleteMedication(medicationId);
      if (!deleteOk) {
        Alert.alert('API Test Failed', 'Cannot delete medication from database.');
        return;
      }
      
      Alert.alert('API Test Successful', '✅ API connection and database storage are working correctly!');
      
    } catch (error) {
      console.error('Test failed:', error);
      Alert.alert('API Test Failed', 'An error occurred during testing. Check console for details.');
    } finally {
      setTesting(false);
    }
  };

  const saveMedication = async () => {
    try {
      setLoading(true);
      
      let savedMedicationId: string;
      
      if (isEditing) {
        await StorageManager.updateMedication({
          ...medicationData,
          id: isEditing.id,
          updatedAt: new Date().toISOString()
        });
        savedMedicationId = isEditing.id;
      } else {
        const medication = new MedicationClass(medicationData);
        const savedMedication = medication.toJSON();
        await StorageManager.addMedication(savedMedication);
        savedMedicationId = savedMedication.id;
      }
      
      Alert.alert(
        'Success',
        `${medicationData.name} has been ${isEditing ? 'updated' : 'added'} successfully!`,
        [
          {
            text: 'Add Schedule',
            onPress: () => {
              router.replace('/medicine-tracking/schedule', { 
                medicationId: savedMedicationId,
                medicationName: medicationData.name
              });
            }
          },
          {
            text: 'Done',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  const updateMedicationData = (key: keyof MedicationData, value: string) => {
    setMedicationData(prev => ({ ...prev, [key]: value }));
  };

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
      {[1, 2, 3, 4].map(step => (
        <View
          key={step}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: step <= currentStep ? '#007AFF' : '#ccc',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 4
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{step}</Text>
        </View>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderNameStep();
      case 2:
        return renderCategoryStep();
      case 3:
        return renderDosageStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderNameStep = () => (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        What's the name of your medication?
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Enter the name as it appears on your prescription or medication bottle.
      </Text>
      
      <View style={medicineStyles.inputContainer}>
        <TextInput
          style={medicineStyles.textInput}
          placeholder="e.g., Aspirin, Metformin"
          value={medicationData.name}
          onChangeText={(text) => updateMedicationData('name', text)}
          autoFocus
        />
      </View>
    </View>
  );

  const renderCategoryStep = () => (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        What type of medication is this?
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        This helps us organize your medications better.
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {[
          { id: 'prescription', name: 'Prescription', color: '#007AFF', icon: 'medical' },
          { id: 'vitamins', name: 'Vitamins', color: '#34C759', icon: 'nutrition' },
          { id: 'supplements', name: 'Supplements', color: '#FF9500', icon: 'fitness' },
          { id: 'otc', name: 'Over-the-Counter', color: '#5856D6', icon: 'bandage' },
          { id: 'herbal', name: 'Herbal/Natural', color: '#32D74B', icon: 'leaf' }
        ].map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              medicineStyles.categoryCard,
              {
                backgroundColor: medicationData.category === category.id ? category.color : '#f8f9fa',
                borderColor: medicationData.category === category.id ? category.color : '#e9ecef'
              }
            ]}
            onPress={() => updateMedicationData('category', category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={24} 
              color={medicationData.category === category.id ? '#fff' : category.color} 
            />
            <Text style={[
              medicineStyles.categoryText,
              { color: medicationData.category === category.id ? '#fff' : '#333' }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDosageStep = () => (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        What's the dosage?
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Enter the amount and unit of your medication.
      </Text>
      
      <View style={medicineStyles.inputContainer}>
        <TextInput
          style={[medicineStyles.textInput, { flex: 1 }]}
          placeholder="e.g., 500"
          value={medicationData.dosage}
          onChangeText={(text) => updateMedicationData('dosage', text)}
          keyboardType="numeric"
        />
      </View>
      
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Unit
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['tablet', 'capsule', 'mg', 'ml', 'drops', 'spray'].map((unit) => (
          <TouchableOpacity
            key={unit}
            style={[
              medicineStyles.unitButton,
              {
                backgroundColor: medicationData.unit === unit ? '#007AFF' : '#f8f9fa',
                borderColor: medicationData.unit === unit ? '#007AFF' : '#e9ecef'
              }
            ]}
            onPress={() => updateMedicationData('unit', unit)}
          >
            <Text style={[
              medicineStyles.unitText,
              { color: medicationData.unit === unit ? '#fff' : '#333' }
            ]}>
              {unit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 24, marginBottom: 12 }}>
        Instructions (Optional)
      </Text>
      
      <View style={medicineStyles.inputContainer}>
        <TextInput
          style={[medicineStyles.textInput, { height: 80, textAlignVertical: 'top' }]}
          placeholder="e.g., Take with food, Avoid dairy products"
          value={medicationData.instructions}
          onChangeText={(text) => updateMedicationData('instructions', text)}
          multiline
        />
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        Review Your Medication
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Please review the information before saving.
      </Text>
      
      <View style={medicineStyles.card}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          {medicationData.name}
        </Text>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Category</Text>
          <Text style={{ fontSize: 16 }}>{medicationData.category}</Text>
        </View>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Dosage</Text>
          <Text style={{ fontSize: 16 }}>{medicationData.dosage} {medicationData.unit}</Text>
        </View>
        
        {medicationData.instructions && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: '#666' }}>Instructions</Text>
            <Text style={{ fontSize: 16 }}>{medicationData.instructions}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={medicineStyles.container}>
      <ScrollView>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            {isEditing ? 'Edit Medication' : 'Add Medication'}
          </Text>
        </View>

        {/* Test API Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#FF9500',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={testApiConnectivity}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="bug" size={20} color="#fff" />
          )}
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: 'bold' }}>
            {testing ? 'Testing API...' : 'Test API Connection'}
          </Text>
        </TouchableOpacity>

        {renderStepIndicator()}
        {renderStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={medicineStyles.bottomContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[medicineStyles.button, medicineStyles.secondaryButton]}
            onPress={previousStep}
            disabled={loading}
          >
            <Text style={medicineStyles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[medicineStyles.button, medicineStyles.primaryButton]}
          onPress={nextStep}
          disabled={loading || !validateCurrentStep()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={medicineStyles.primaryButtonText}>
              {currentStep === 4 ? 'Save Medication' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 