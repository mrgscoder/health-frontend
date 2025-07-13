import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HealthTrackerDashboard = () => {
  const [currentDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [goals] = useState({
    calories: { current: 850, target: 1550 },
    water: { current: 6, target: 8 },
    steps: { current: 7240, target: 10000 },
    sleep: { current: 6.5, target: 8 },
    weight: { current: 68.5, target: 65 },
    workout: { current: 3, target: 5 }
  });

  const [macros] = useState({
    protein: { current: 25, target: 120 },
    carbs: { current: 45, target: 200 },
    fat: { current: 18, target: 65 },
    fiber: { current: 12, target: 25 }
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#0cb6ab';
    if (percentage >= 50) return '#14b8a6';
    return '#5eead4';
  };

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const ProgressBar = ({ current, target, color }) => (
    <View style={styles.progressBarContainer}>
      <View 
        style={[
          styles.progressBar, 
          { 
            width: `${calculateProgress(current, target)}%`, 
            backgroundColor: color 
          }
        ]} 
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Icon name="person" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.date}>{formatDate(currentDate)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.badge}>
              <Text style={styles.badgeText}>3 days left</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#0cb6ab" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Today's Goals Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <MaterialCommunityIcons name="target" size={24} color="#0cb6ab" />
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={[
              styles.statCard,
              selectedItems.has('calories') && styles.selectedCard
            ]}
            onPress={() => handleItemSelect('calories')}
          >
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#0cb6ab" />
              <TouchableOpacity style={styles.addIconButton}>
                <Icon name="add" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.statTitle}>Calories</Text>
            <Text style={styles.statValue}>{goals.calories.current}</Text>
            <Text style={styles.statTarget}>of {goals.calories.target}</Text>
            <ProgressBar 
              current={goals.calories.current} 
              target={goals.calories.target} 
              color={getProgressColor(calculateProgress(goals.calories.current, goals.calories.target))}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.statCard,
              selectedItems.has('water') && styles.selectedCard
            ]}
            onPress={() => handleItemSelect('water')}
          >
            <View style={styles.statHeader}>
              <Ionicons name="water-outline" size={24} color="#0cb6ab" />
              <TouchableOpacity style={styles.addIconButton}>
                <Icon name="add" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.statTitle}>Water</Text>
            <Text style={styles.statValue}>{goals.water.current}</Text>
            <Text style={styles.statTarget}>of {goals.water.target} glasses</Text>
            <ProgressBar 
              current={goals.water.current} 
              target={goals.water.target} 
              color={getProgressColor(calculateProgress(goals.water.current, goals.water.target))}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.statCard,
              selectedItems.has('steps') && styles.selectedCard
            ]}
            onPress={() => handleItemSelect('steps')}
          >
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="walk" size={24} color="#0cb6ab" />
              <TouchableOpacity style={styles.addIconButton}>
                <Icon name="trending-up" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.statTitle}>Steps</Text>
            <Text style={styles.statValue}>{goals.steps.current.toLocaleString()}</Text>
            <Text style={styles.statTarget}>of {goals.steps.target.toLocaleString()}</Text>
            <ProgressBar 
              current={goals.steps.current} 
              target={goals.steps.target} 
              color={getProgressColor(calculateProgress(goals.steps.current, goals.steps.target))}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.statCard,
              selectedItems.has('sleep') && styles.selectedCard
            ]}
            onPress={() => handleItemSelect('sleep')}
          >
            <View style={styles.statHeader}>
              <Ionicons name="moon-outline" size={24} color="#0cb6ab" />
              <TouchableOpacity style={styles.addIconButton}>
                <MaterialCommunityIcons name="trophy-outline" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.statTitle}>Sleep</Text>
            <Text style={styles.statValue}>{goals.sleep.current}h</Text>
            <Text style={styles.statTarget}>of {goals.sleep.target}h</Text>
            <ProgressBar 
              current={goals.sleep.current} 
              target={goals.sleep.target} 
              color={getProgressColor(calculateProgress(goals.sleep.current, goals.sleep.target))}
            />
          </TouchableOpacity>
        </View>

        {/* Food Tracking Card */}
        <TouchableOpacity 
          style={[
            styles.foodCard,
            selectedItems.has('food') && styles.selectedCard
          ]}
          onPress={() => handleItemSelect('food')}
        >
          <View style={styles.foodHeader}>
            <View style={styles.foodHeaderLeft}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#0cb6ab" />
              <View>
                <Text style={styles.foodTitle}>Track Food</Text>
                <Text style={styles.foodSubtitle}>Eat {goals.calories.target} cal</Text>
              </View>
            </View>
            <View style={styles.foodHeaderRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="calendar-today" size={18} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconButton, styles.addButton]}>
                <Icon name="add" size={18} color="#0cb6ab" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.premiumSection}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{macros.protein.current}g</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${calculateProgress(macros.protein.current, macros.protein.target)}%`, backgroundColor: '#0cb6ab' }]} />
                </View>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{macros.carbs.current}g</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${calculateProgress(macros.carbs.current, macros.carbs.target)}%`, backgroundColor: '#14b8a6' }]} />
                </View>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{macros.fat.current}g</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${calculateProgress(macros.fat.current, macros.fat.target)}%`, backgroundColor: '#2dd4bf' }]} />
                </View>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fiber</Text>
                <Text style={styles.macroValue}>{macros.fiber.current}g</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${calculateProgress(macros.fiber.current, macros.fiber.target)}%`, backgroundColor: '#5eead4' }]} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[
                styles.actionItem, 
                styles.weightAction,
                selectedItems.has('weight') && styles.selectedActionItem
              ]}
              onPress={() => handleItemSelect('weight')}
            >
              <MaterialCommunityIcons name="scale-bathroom" size={32} color="#0cb6ab" />
              <Text style={styles.actionLabel}>Weight</Text>
              <Text style={styles.actionValue}>{goals.weight.current}kg</Text>
              <Text style={styles.actionTarget}>Target: {goals.weight.target}kg</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionItem, 
                styles.workoutAction,
                selectedItems.has('workout') && styles.selectedActionItem
              ]}
              onPress={() => handleItemSelect('workout')}
            >
              <MaterialCommunityIcons name="dumbbell" size={32} color="#0cb6ab" />
              <Text style={styles.actionLabel}>Workout</Text>
              <Text style={styles.actionValue}>{goals.workout.current}/{goals.workout.target}</Text>
              <Text style={styles.actionTarget}>This week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionItem, 
                styles.sleepAction,
                selectedItems.has('sleep-action') && styles.selectedActionItem
              ]}
              onPress={() => handleItemSelect('sleep-action')}
            >
              <Ionicons name="moon-outline" size={32} color="#0cb6ab" />
              <Text style={styles.actionLabel}>Sleep</Text>
              <Text style={styles.actionValue}>{goals.sleep.current}h</Text>
              <Text style={styles.actionTarget}>Last night</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionItem, 
                styles.waterAction,
                selectedItems.has('water-action') && styles.selectedActionItem
              ]}
              onPress={() => handleItemSelect('water-action')}
            >
              <Ionicons name="water-outline" size={32} color="#0cb6ab" />
              <Text style={styles.actionLabel}>Water</Text>
              <Text style={styles.actionValue}>{goals.water.current}/{goals.water.target}</Text>
              <Text style={styles.actionTarget}>Glasses today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#0cb6ab',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    color: '#ffffff',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0cb6ab',
  },
  notificationButton: {
    padding: 8,
  },
  sectionHeader: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  targetIcon: {
    fontSize: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#0cb6ab',
    backgroundColor: '#f0fdfa',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    fontSize: 28,
  },
  addIconButton: {
    width: 24,
    height: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  statTarget: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  foodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  foodHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  foodSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  foodHeaderRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconButtonText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#ccfbf1',
  },
  premiumSection: {
    backgroundColor: '#f0fdfa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  premiumBadge: {
    alignSelf: 'center',
    backgroundColor: '#0cb6ab',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '48%',
    marginBottom: 16,
  },
  macroLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedActionItem: {
    borderColor: '#0cb6ab',
  },
  weightAction: {
    backgroundColor: '#f0fdfa',
  },
  workoutAction: {
    backgroundColor: '#ecfdf5',
  },
  sleepAction: {
    backgroundColor: '#f0f9ff',
  },
  waterAction: {
    backgroundColor: '#f0fdfa',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
    marginTop: 12,
  },
  actionValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionTarget: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default HealthTrackerDashboard;