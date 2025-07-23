import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Color constants for consistency
export const medicineColors = {
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  lightGray: '#f0f0f0',
  textPrimary: '#333',
  textSecondary: '#666',
  textTertiary: '#999',
  border: '#eee',
};

export const medicineStyles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  
  // Safe area container
  safeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Card styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Text styles
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  
  // Medication card styles
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  medicationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Form styles
  inputContainer: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#333',
  },
  
  // Schedule styles
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  
  // Analytics styles
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Progress styles
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Additional styles for better organization
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  
  // Status badge styles
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  inactiveBadge: {
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Action button styles
  actionButton: {
    padding: 8,
    marginBottom: 4,
  },
  
  // Selection styles
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedContainer: {
    backgroundColor: '#f0f0f0',
  },
  
  // Step indicator styles
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: '#007AFF',
  },
  inactiveStep: {
    backgroundColor: '#ccc',
  },
  stepText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Time range selector styles
  timeRangeContainer: {
    flexDirection: 'row',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedTimeRange: {
    backgroundColor: '#007AFF',
  },
  unselectedTimeRange: {
    backgroundColor: '#f0f0f0',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTimeRangeText: {
    color: '#fff',
  },
  unselectedTimeRangeText: {
    color: '#333',
  },
  
  // Loading and empty state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
}); 