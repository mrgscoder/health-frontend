import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');
const ICON_SIZE = width > 400 ? 32 : 26;
const QUICK_ICON_SIZE = width > 400 ? 28 : 22;

export default function Index() {
  const handleCustomizeApp = () => {
    // Navigate to customization screen
    console.log("Customize app pressed");
  };

  const handleQuickAction = (action: string) => {
    console.log(`${action} pressed`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a6093' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6093" />
      {/* Header Section */}
      <View style={{ backgroundColor: '#1a6093', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>Good Morning</Text>
            <Text style={{ color: '#d1d5db', fontSize: 15 }}>How are you feeling today?</Text>
          </View>
          <TouchableOpacity style={{ padding: 8, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}>
            <Ionicons name="notifications-outline" size={ICON_SIZE - 6} color="#1a6093" />
          </TouchableOpacity>
        </View>
        {/* Customize App Button */}
        <TouchableOpacity
          onPress={handleCustomizeApp}
          style={{ backgroundColor: '#e0f2fe', borderColor: '#bae6fd', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={20} color="#1a6093" />
          <Text style={{ color: '#1a6093', fontWeight: '600', marginLeft: 8, fontSize: 15 }}>Customize your app according to you</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Health Overview Card */}
        <View style={{ marginHorizontal: 24, marginTop: 24, backgroundColor: '#2563eb', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 16, elevation: 4 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Today's Health Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#dbeafe', fontSize: 13 }}>Overall Status</Text>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Good</Text>
            </View>
            <View style={{ backgroundColor: '#fff', opacity: 0.18, borderRadius: 50, padding: 12 }}>
              <MaterialCommunityIcons name="heart-pulse" size={ICON_SIZE + 4} color="white" />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginHorizontal: 24, marginTop: 28 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[
              { name: 'Book Appointment', icon: 'calendar-check', color: '#22c55e' },
              { name: 'Symptoms Check', icon: 'stethoscope', color: '#ef4444' },
              { name: 'Medications', icon: 'pill', color: '#f59e42' },
              { name: 'Health Records', icon: 'file-document', color: '#3b82f6' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickAction(action.name)}
                style={{ width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
                activeOpacity={0.85}
              >
                <View style={{ backgroundColor: action.color, borderRadius: 14, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <MaterialCommunityIcons name={action.icon as any} size={QUICK_ICON_SIZE + 8} color="#fff" />
                </View>
                <Text style={{ color: '#1e293b', fontWeight: '600', fontSize: 15 }}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Stats */}
        <View style={{ marginHorizontal: 24, marginTop: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>Health Stats</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <MaterialCommunityIcons name="heart" size={QUICK_ICON_SIZE + 8} color="#ef4444" />
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Heart Rate</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444' }}>72 BPM</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <MaterialCommunityIcons name="water" size={QUICK_ICON_SIZE + 8} color="#3b82f6" />
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Blood Pressure</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3b82f6' }}>120/80</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <MaterialCommunityIcons name="weight" size={QUICK_ICON_SIZE + 8} color="#22c55e" />
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Weight</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#22c55e' }}>68 kg</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: 8, height: 8 }}>
                <View style={{ backgroundColor: '#22c55e', height: 8, borderRadius: 8, width: '75%' }} />
              </View>
              <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 12 }}>75% Health Score</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={{ marginHorizontal: 24, marginTop: 28, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>Upcoming Appointments</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#dbeafe', borderRadius: 50, padding: 10, marginRight: 16 }}>
                <MaterialCommunityIcons name="doctor" size={QUICK_ICON_SIZE + 4} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1e293b', fontWeight: '600', fontSize: 16 }}>Dr. Sarah Johnson</Text>
                <Text style={{ color: '#64748b', fontSize: 14 }}>General Checkup</Text>
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>Tomorrow, 10:00 AM</Text>
              </View>
              <TouchableOpacity style={{ backgroundColor: '#3b82f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Health Tips */}
        <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>Daily Health Tip</Text>
          <View style={{ backgroundColor: '#4ade80', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: '#fff', opacity: 0.18, borderRadius: 50, padding: 8, marginRight: 16 }}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={QUICK_ICON_SIZE + 2} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Stay Hydrated</Text>
              <Text style={{ color: 'white', fontSize: 14, opacity: 0.95 }}>
                Drink at least 8 glasses of water daily to keep your body hydrated and maintain optimal health.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}