import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import BASE_URL from '../../src/config';
import { clearAuthData, checkAuthStatus } from '../utils/authUtils';

const { width } = Dimensions.get('window');

// Types based on your signup flow
interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  bmi: number;
  activityLevel: 'sedentary' | 'lightly active' | 'moderately active' | 'very active';
  sleepHours: '<5 hours' | '5-6 hours' | '6-8 hours' | '>8 hours';
  dietPreference: 'vegetarian' | 'vegan' | 'omnivore' | 'keto' | 'other';
  goals: string[];
  stressLevel: 'low' | 'moderate' | 'high';
  healthScore: number;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      console.log('Fetching user form data with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${BASE_URL}/api/user-form/user-form`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('User form response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User form response data:', data);
        
        if (data.data) {
          // Transform the database data to match our interface
          const userData = data.data;
          const transformedUser: UserProfile = {
            name: userData.name || 'User',
            age: parseInt(userData.age) || 25,
            gender: userData.gender || 'other',
            height: parseFloat(userData.height) || 0,
            weight: parseFloat(userData.weight) || 0,
            bmi: parseFloat(userData.bmi) || 0,
            activityLevel: userData.activity_level || 'sedentary',
            sleepHours: userData.sleep_hours || '6-8 hours',
            dietPreference: userData.diet_preference || 'omnivore',
            goals: userData.goals ? [userData.goals] : [],
            stressLevel: userData.stress_level || 'moderate',
            healthScore: parseInt(userData.health_score) || 0,
          };
          
          setUser(transformedUser);
          console.log('User form data fetched successfully:', transformedUser);
        } else {
          console.log('No user form data in response');
          setUser(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Failed to fetch user form data:', response.status, errorData);
        
        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please log in again.');
        } else if (response.status === 404) {
          console.log('No user form data found for this user');
          setUser(null);
        } else {
          Alert.alert('Error', 'Failed to fetch profile data. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching user form data:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit functionality coming soon!');
  };

  const handleSaveProfile = () => {
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Starting logout process...');
              
              // Clear all authentication data
              await clearAuthData();
              console.log('✅ Auth data cleared successfully');
              
              // Add a small delay to ensure data is cleared
              await new Promise(resolve => setTimeout(resolve, 200));
              
              // Force navigation to welcome screen and clear navigation stack
              console.log('🚀 Navigating to welcome screen...');
              
              try {
                // Navigate to health index (based on your file structure)
                router.replace('/health');
                
              } catch (navError) {
                console.log('Navigation failed:', navError);
                Alert.alert(
                  'Logout Successful',
                  'You have been logged out successfully. Please restart the app.',
                  [{ text: 'OK' }]
                );
              }
              
            } catch (error) {
              console.error('❌ Error during logout:', error);
              Alert.alert(
                'Logout Error',
                'An error occurred during logout. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Circular Progress Component
  const CircularProgress = ({ size = 120, strokeWidth = 10, progress = 0 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    // Color based on progress
    const getProgressColor = (progress: number) => {
      if (progress >= 70) return '#10b981'; // Green
      if (progress >= 40) return '#f59e0b'; // Yellow
      return '#ef4444'; // Red
    };

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getProgressColor(progress)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text style={styles.healthScoreText}>
          {progress}%
        </Text>
      </View>
    );
  };

  const getActivityIcon = (level: string) => {
    switch (level) {
      case 'sedentary': 
        return <Icon name="chair" size={20} color="#19b7d0" />;
      case 'lightly active': 
        return <Icon name="directions-walk" size={20} color="#19b7d0" />;
      case 'moderately active': 
        return <Icon name="directions-run" size={20} color="#19b7d0" />;
      case 'very active': 
        return <Icon name="fitness-center" size={20} color="#19b7d0" />;
      default: 
        return <Icon name="directions-walk" size={20} color="#19b7d0" />;
    }
  };

  const getSleepIcon = (hours: string) => {
    switch (hours) {
      case '<5 hours': 
        return <Ionicons name="bed" size={20} color="#19b7d0" />;
      case '5-6 hours': 
        return <Ionicons name="moon" size={20} color="#19b7d0" />;
      case '6-8 hours': 
        return <Ionicons name="bed" size={20} color="#19b7d0" />;
      case '>8 hours': 
        return <Ionicons name="happy" size={20} color="#19b7d0" />;
      default: 
        return <Ionicons name="moon" size={20} color="#19b7d0" />;
    }
  };

  const getDietIcon = (diet: string) => {
    switch (diet) {
      case 'vegetarian': 
        return <Icon name="eco" size={20} color="#19b7d0" />;
      case 'vegan': 
        return <FontAwesome name="leaf" size={20} color="#19b7d0" />;
      case 'omnivore': 
        return <Icon name="restaurant" size={20} color="#19b7d0" />;
      case 'keto': 
        return <FontAwesome name="apple" size={20} color="#19b7d0" />;
      default: 
        return <Icon name="eco" size={20} color="#19b7d0" />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#11B5CF', '#0EA5BF', '#0B95AF', '#08859F', '#05758F', '#02657F', '#01556F', '#00455F', '#00354F', '#00253F']}
          style={{ flex: 1 }}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Show no data state
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#11B5CF', '#0EA5BF', '#0B95AF', '#08859F', '#05758F', '#02657F', '#01556F', '#00455F', '#00354F', '#00253F']}
          style={{ flex: 1 }}
        >
          <View style={styles.noDataContainer}>
            <Icon name="person" size={60} color="#ffffff" />
            <Text style={styles.noDataTitle}>No Profile Data</Text>
            <Text style={styles.noDataSubtitle}>
              Complete your health assessment to see your profile data
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/health/forms/Signup')}
            >
              <Text style={styles.primaryButtonText}>
                Complete Health Assessment
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
      colors={['#11B5CF', '#0EA5BF', '#0B95AF', '#08859F', '#05758F', '#02657F', '#01556F', '#00455F', '#00354F', '#00253F']}
      style={{ flex: 1 }}
    >
        <View style={styles.header}>
  <View style={styles.headerContent}>
    <View style={styles.profileIconContainer}>
      <Icon name="account-circle" size={40} color="#ffffff" />
    </View>
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>
        Hi, {user.name}!
      </Text>
      <Text style={styles.headerSubtitle}>
        Manage your health profile
      </Text>
    </View>
  </View>
</View>

        {/* Health Score Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Health Score
          </Text>
          <View style={styles.healthScoreContainer}>
            <CircularProgress 
              size={120} 
              strokeWidth={10} 
              progress={user.healthScore} 
            />
            <Text style={styles.healthScoreSubtext}>
              Your score: {user.healthScore}/100
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Basic Information
            </Text>
            <TouchableOpacity 
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{user.height} cm</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{user.weight} kg</Text>
            </View>
            
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>BMI</Text>
              <View style={styles.bmiContainer}>
                <Text style={styles.infoValue}>{user.bmi}</Text>
                <Text style={styles.healthyText}>Healthy</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lifestyle Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Lifestyle Preferences
          </Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Activity Level</Text>
              <View style={styles.iconRow}>
                <Text style={styles.infoValue}>
                  {user.activityLevel}
                </Text>
                <View style={styles.iconContainer}>
                  {getActivityIcon(user.activityLevel)}
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sleep Hours</Text>
              <View style={styles.iconRow}>
                <Text style={styles.infoValue}>
                  {user.sleepHours}
                </Text>
                <View style={styles.iconContainer}>
                  {getSleepIcon(user.sleepHours)}
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diet Preference</Text>
              <View style={styles.iconRow}>
                <Text style={styles.infoValue}>
                  {user.dietPreference}
                </Text>
                <View style={styles.iconContainer}>
                  {getDietIcon(user.dietPreference)}
                </View>
              </View>
            </View>
            
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Stress Level</Text>
              <Text style={styles.infoValue}>{user.stressLevel}</Text>
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Health Goals
          </Text>
          <View style={styles.goalsContainer}>
            {user.goals.length > 0 ? (
              user.goals.map((goal, index) => (
                <View key={index} style={styles.goalChip}>
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noGoalsText}>No goals set yet</Text>
            )}
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Medical Information
          </Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="medication" size={22} color="#19b7d0" style={styles.menuIcon} />
              <Text style={styles.menuText}>Medications</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#19b7d0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="warning" size={22} color="#19b7d0" style={styles.menuIcon} />
              <Text style={styles.menuText}>Allergies</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#19b7d0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuItemLeft}>
              <Icon name="local-hospital" size={22} color="#19b7d0" style={styles.menuIcon} />
              <Text style={styles.menuText}>Medical Conditions</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#19b7d0" />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Settings
          </Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="notifications" size={22} color="#19b7d0" style={styles.menuIcon} />
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#19b7d0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="lock" size={22} color="#19b7d0" style={styles.menuIcon} />
              <Text style={styles.menuText}>Privacy & Security</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#19b7d0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="assessment" size={22} color="#19b7d0" style={styles.menuIcon} />
              <Text style={styles.menuText}>Data Export</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#19b7d0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuItemLeft}>
              <Icon name="help" size={22} color="#19b7d0" style={styles.menuIcon} />
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#19b7d0" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => Alert.alert('Update', 'Updating health recommendations...')}
          >
            <Text style={styles.primaryButtonText}>
              Update Health Recommendations
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleLogout}
          >
            <Text style={styles.secondaryButtonText}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  noDataTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  healthScoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  healthScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  healthScoreSubtext: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
  infoContainer: {
    marginTop: -8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 16,
  },
  infoValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
  },
  bmiContainer: {
    alignItems: 'flex-end',
  },
  healthyText: {
    color: '#10b981',
    fontSize: 14,
    marginTop: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginLeft: 8,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  goalChip: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  goalText: {
    color: '#0369a1',
    fontWeight: '500',
    fontSize: 14,
  },
  noGoalsText: {
    color: '#6b7280',
    fontSize: 16,
    fontStyle: 'italic',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: '#111827',
    fontSize: 16,
  },
  buttonContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfilePage;
