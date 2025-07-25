import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { getAllAssessmentResults, getAssessmentResults } from './utils/storage';
import { commonStyles } from './styles/commonStyles';

// Define a type for the filter state for better type safety.
type FilterType = 'all' | 'stress' | 'anxiety';

// Define the shape of a raw assessment result from storage, which might not have the 'type'.
interface RawAssessmentResult {
  id: string | number;
  date: string;
  score: number;
  interpretation: {
    description: string;
  };
}

// Define the full assessment result object shape used within the component.
interface AssessmentResult extends RawAssessmentResult {
  type: 'stress' | 'anxiety';
}

// Assume the storage utility functions return Promises with the defined types.
// We are assuming getAssessmentResults returns results without a 'type' property,
// while getAllAssessmentResults returns results with the 'type' property included.
declare module '../utils/storage' {
  export function getAssessmentResults(type: 'stress' | 'anxiety'): Promise<RawAssessmentResult[]>;
  export function getAllAssessmentResults(): Promise<AssessmentResult[]>;
}

export default function HistoryScreen(): JSX.Element {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadResults();
  }, [filter]);

  const loadResults = async (): Promise<void> => {
    setLoading(true);
    try {
      let data: AssessmentResult[];

      if (filter === 'all') {
        data = await getAllAssessmentResults();
      } else {
        // Fetch raw results for a specific type and add the 'type' property.
        const rawData = await getAssessmentResults(filter);
        data = rawData.map((result) => ({ ...result, type: filter }));
      }
      // BUG FIX: Set results for both 'all' and specific filters.
      // In the original code, this was only called inside the 'else' block.
      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]); // Clear results on error
    } finally {
      // Ensure loading is set to false after the operation completes or fails.
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAssessmentDisplayName = (type: 'stress' | 'anxiety'): string => {
    return type === 'stress' ? 'Stress' : 'Anxiety';
  };

  const renderFilterButtons = (): JSX.Element => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
        onPress={() => setFilter('all')}>
        <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
          All Assessments
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'stress' && styles.activeFilter]}
        onPress={() => setFilter('stress')}>
        <Text style={[styles.filterText, filter === 'stress' && styles.activeFilterText]}>
          Stress History
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'anxiety' && styles.activeFilter]}
        onPress={() => setFilter('anxiety')}>
        <Text style={[styles.filterText, filter === 'anxiety' && styles.activeFilterText]}>
          Anxiety History
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResultItem = ({ item }: ListRenderItemInfo<AssessmentResult>): JSX.Element => (
    <View style={styles.resultItem}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultDate}>{formatDate(item.date)}</Text>
        <Text style={styles.resultType}>{getAssessmentDisplayName(item.type)}</Text>
      </View>
      <View style={styles.resultDetails}>
        <Text style={styles.resultScore}>Score: {item.score}</Text>
        <Text style={styles.resultLevel}>{item.interpretation.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.innerContainer}>
        <Text style={commonStyles.title}>Assessment History</Text>
        {renderFilterButtons()}
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : results.length === 0 ? (
          <Text style={styles.emptyText}>No assessment results found.</Text>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Styles remain the same, no conversion needed.
const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  activeFilterText: {
    color: 'white',
  },
  resultItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  resultType: {
    fontSize: 14,
    color: '#7f8c8d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resultLevel: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 50,
  },
});
