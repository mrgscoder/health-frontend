import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const userAvatar = require('../../assets/images/account.png');
const doctorAvatar = require('../../assets/images/account.png');

const Home = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [activeNav, setActiveNav] = useState('home');
  const scaleValues = {
    bell: useSharedValue(1),
    message: useSharedValue(1),
    call: useSharedValue(1),
    navItems: {
      home: useSharedValue(1),
      services: useSharedValue(1),
      workout: useSharedValue(1),
      calendar: useSharedValue(1),
      profile: useSharedValue(1),
    },
  };

  useEffect(() => {
    const fetchName = async () => {
      const name = await AsyncStorage.getItem('userFullName');
      if (name) setUserName(name);
    };
    fetchName();
  }, []);

  const handlePressIn = (scale: any) => {
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = (scale: any, action?: () => void) => {
    scale.value = withSpring(1);
    if (action) action();
  };

  const createAnimatedStyle = (scale: any) => useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Navigation actions using Expo Router
  const navActions = {
    home: () => router.push('/health/Home'),
    services: () => router.push('/health/Services'),
    workout: () => router.push('/health/Workout'),
    calendar: () => router.push('/health/Calendar'),
    profile: () => router.push('/health/Profile'),
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.header}>
        <Image source={userAvatar} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.greeting}>Hi, {userName}</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </View>
        <Animated.View style={createAnimatedStyle(scaleValues.bell)}>
          <Pressable
            onPressIn={() => handlePressIn(scaleValues.bell)}
            onPressOut={() => handlePressOut(scaleValues.bell, () => router.push('/health/Notifications'))}
          >
            <Feather name="bell" size={22} color="#fff" />
          </Pressable>
        </Animated.View>
        <Animated.View style={[createAnimatedStyle(scaleValues.message), { marginLeft: 16 }]}> 
          <Pressable
            onPressIn={() => handlePressIn(scaleValues.message)}
            onPressOut={() => handlePressOut(scaleValues.message, () => router.push('/health/Messages'))}
          >
            <Feather name="message-circle" size={22} color="#fff" />
          </Pressable>
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Doctor Card */}
        <Animated.View style={[styles.doctorCard, createAnimatedStyle(scaleValues.call)]}>
          <Pressable
            onPressIn={() => handlePressIn(scaleValues.call)}
            onPressOut={() => handlePressOut(scaleValues.call, () => router.push('/health/DoctorProfile'))}
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
          >
            <Image source={doctorAvatar} style={styles.doctorAvatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.doctorName}>Dr. Turja Sen Das</Text>
              <Text style={styles.doctorSpecialty}>Child Specialist</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Feather name="calendar" size={16} color="#6b7280" />
                <Text style={styles.doctorTime}> Today   14:30 - 15:30 AM</Text>
              </View>
            </View>
            <View style={styles.callButton}>
              <Feather name="phone-call" size={20} color="#fff" />
            </View>
          </Pressable>
        </Animated.View>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: '#06b6d4' }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Specialist Services */}
        <Text style={styles.sectionTitle}>Specialist Services</Text>
        <View style={styles.gridRow}>
          {[
            { icon: 'tooth-outline', label: 'Tooth', screen: '/health/Dentist' },
            { icon: 'eye-outline', label: 'Eye', screen: '/health/Ophthalmologist' },
            { icon: 'lungs', label: 'Lungs', screen: '/health/Pulmonologist' },
            { icon: 'food-variant', label: 'Intestines', screen: '/health/Gastroenterologist' },
          ].map((item, index) => (
            <Animated.View key={index} style={[styles.gridItem, createAnimatedStyle(useSharedValue(1))]}>
              <Pressable
                onPressIn={() => handlePressIn(useSharedValue(1))}
                onPressOut={() => handlePressOut(useSharedValue(1), () => router.push(item.screen))}
              >
                <LinearGradient colors={['#e0f7fa', '#f0f9ff']} style={styles.gridItemIcon}>
                  <MaterialCommunityIcons name={item.icon} size={28} color="#06b6d4" />
                </LinearGradient>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Health Needs */}
        <Text style={styles.sectionTitle}>Health Needs</Text>
        <View style={styles.gridRow}>
          {[
            { icon: 'medical-bag', label: 'Pharmacy', screen: '/health/Pharmacy', IconComponent: MaterialCommunityIcons },
            { icon: 'hospital-building', label: 'Hospital', screen: '/health/Hospital', IconComponent: MaterialCommunityIcons },
            { icon: 'user-md', label: 'General Practitioner', screen: '/health/GeneralPractitioner', IconComponent: FontAwesome5 },
            { icon: 'ambulance', label: 'Ambulance', screen: '/health/Ambulance', IconComponent: MaterialCommunityIcons },
          ].map((item, index) => (
            <Animated.View key={index} style={[styles.gridItem, createAnimatedStyle(useSharedValue(1))]}>
              <Pressable
                onPressIn={() => handlePressIn(useSharedValue(1))}
                onPressOut={() => handlePressOut(useSharedValue(1), () => router.push(item.screen))}
              >
                <LinearGradient colors={['#e0f7fa', '#f0f9ff']} style={styles.gridItemIcon}>
                  <item.IconComponent name={item.icon} size={28} color="#06b6d4" />
                </LinearGradient>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Popular Doctor */}
        <View style={styles.popularHeader}>
          <Text style={styles.sectionTitle}>Popular Doctor</Text>
          <Pressable onPress={() => router.push('/health/AllDoctors')}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>
        <Animated.View style={[styles.popularDoctorCard, createAnimatedStyle(useSharedValue(1))]}>
          <Pressable
            onPressIn={() => handlePressIn(useSharedValue(1))}
            onPressOut={() => handlePressOut(useSharedValue(1), () => router.push('/health/DoctorProfile'))}
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
          >
            <Image source={doctorAvatar} style={styles.popularDoctorAvatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.popularDoctorName}>Edward Franklin</Text>
              <Text style={styles.popularDoctorSpecialty}>General Practitioner</Text>
            </View>
          </Pressable>
        </Animated.View>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <LinearGradient colors={['#fff', '#f8fafc']} style={styles.bottomNav}>
        {[
          { icon: 'home', name: 'home' },
          { icon: 'medical-services', name: 'services', IconComponent: MaterialIcons },
          { icon: 'barbell-outline', name: 'workout', IconComponent: Ionicons, isCenter: true },
          { icon: 'calendar', name: 'calendar' },
          { icon: 'user', name: 'profile' },
        ].map((item, index) => (
          <Animated.View
            key={index}
            style={[item.isCenter ? styles.navItemCenter : styles.navItem, createAnimatedStyle(scaleValues.navItems[item.name])]}>
            <Pressable
              onPressIn={() => handlePressIn(scaleValues.navItems[item.name])}
              onPressOut={() => handlePressOut(scaleValues.navItems[item.name], navActions[item.name])}
            >
              {item.IconComponent ? (
                <item.IconComponent name={item.icon} size={item.isCenter ? 28 : 24} color={item.isCenter ? '#fff' : item.name === activeNav ? '#06b6d4' : '#6b7280'} />
              ) : (
                <Feather name={item.icon as any} size={item.isCenter ? 28 : 24} color={item.isCenter ? '#fff' : item.name === activeNav ? '#06b6d4' : '#6b7280'} />
              )}
            </Pressable>
          </Animated.View>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0f7fa',
    marginTop: 2,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#06b6d4',
    marginTop: 2,
  },
  doctorTime: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  callButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 16,
    padding: 12,
    marginLeft: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  gridItemIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 18,
  },
  seeAll: {
    color: '#06b6d4',
    fontWeight: '600',
    fontSize: 14,
  },
  popularDoctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  popularDoctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  popularDoctorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  popularDoctorSpecialty: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navItemCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -28,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Home;