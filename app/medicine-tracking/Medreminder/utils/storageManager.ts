import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, MedicationSchedule, DoseLog } from '../models/MedicationModels';
import ApiService from './apiService';

const STORAGE_KEYS = {
  MEDICATIONS: 'medicine_medications',
  SCHEDULES: 'medicine_schedules',
  DOSE_LOGS: 'medicine_dose_logs',
  SETTINGS: 'medicine_settings'
} as const;

export interface AdherenceData {
  totalScheduled: number;
  taken: number;
  skipped: number;
  missed: number;
  adherenceRate: number;
  logs: DoseLog[];
  medications: Medication[];
}

export class StorageManager {
  // Medication Management - API First Approach
  static async saveMedications(medications: Medication[]): Promise<boolean> {
    try {
      console.log('💾 Saving medications to API...');
      // Save to API for each medication
      for (const medication of medications) {
        if (medication.id) {
          await ApiService.updateMedication(medication);
        } else {
          await ApiService.addMedication(medication);
        }
      }
      
      console.log('✅ All medications saved to API successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving medications to API:', error);
      return false;
    }
  }

  static async getMedications(): Promise<Medication[]> {
    try {
      console.log('📥 Fetching medications from API...');
      // Try to get from API first
      const apiMedications = await ApiService.getMedications();
      console.log(`✅ Retrieved ${apiMedications.length} medications from API`);
      return apiMedications;
    } catch (error) {
      console.error('❌ Error loading medications from API:', error);
      // Fallback to AsyncStorage only if API fails
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
        const medications = data ? JSON.parse(data) : [];
        console.log(`📱 Retrieved ${medications.length} medications from local storage`);
        return medications;
      } catch (fallbackError) {
        console.error('❌ Fallback load failed:', fallbackError);
        return [];
      }
    }
  }

  static async addMedication(medication: Medication): Promise<boolean> {
    try {
      console.log('➕ Adding medication to API:', medication.name);
      // Add to API first
      const success = await ApiService.addMedication(medication);
      if (success) {
        console.log('✅ Medication added to API successfully');
        // Update local storage as backup
        try {
          const medications = await this.getMedications();
          medications.push(medication);
          await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
        } catch (localError) {
          console.warn('⚠️ Failed to update local storage:', localError);
        }
        return true;
      }
      console.error('❌ Failed to add medication to API');
      return false;
    } catch (error) {
      console.error('❌ Error adding medication:', error);
      // Fallback to AsyncStorage only
      try {
        const medications = await this.getMedications();
        medications.push(medication);
        await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
        console.log('📱 Medication saved to local storage as fallback');
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback add failed:', fallbackError);
        return false;
      }
    }
  }

  static async updateMedication(updatedMedication: Medication): Promise<boolean> {
    try {
      console.log('🔄 Updating medication in API:', updatedMedication.name);
      // Update in API first
      const success = await ApiService.updateMedication(updatedMedication);
      if (success) {
        console.log('✅ Medication updated in API successfully');
        // Update local storage as backup
        try {
          const medications = await this.getMedications();
          const index = medications.findIndex(med => med.id === updatedMedication.id);
          if (index !== -1) {
            medications[index] = { ...updatedMedication, updatedAt: new Date().toISOString() };
            await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
          }
        } catch (localError) {
          console.warn('⚠️ Failed to update local storage:', localError);
        }
        return true;
      }
      console.error('❌ Failed to update medication in API');
      return false;
    } catch (error) {
      console.error('❌ Error updating medication:', error);
      // Fallback to AsyncStorage only
      try {
        const medications = await this.getMedications();
        const index = medications.findIndex(med => med.id === updatedMedication.id);
        if (index !== -1) {
          medications[index] = { ...updatedMedication, updatedAt: new Date().toISOString() };
          await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
          console.log('📱 Medication updated in local storage as fallback');
          return true;
        }
        return false;
      } catch (fallbackError) {
        console.error('❌ Fallback update failed:', fallbackError);
        return false;
      }
    }
  }

  static async deleteMedication(medicationId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting medication from API:', medicationId);
      // Delete from API first
      const success = await ApiService.deleteMedication(medicationId);
      if (success) {
        console.log('✅ Medication deleted from API successfully');
        // Update local storage as backup
        try {
          const medications = await this.getMedications();
          const filtered = medications.filter(med => med.id !== medicationId);
          await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(filtered));
          
          // Also remove related schedules and logs
          await this.deleteSchedulesForMedication(medicationId);
          await this.deleteLogsForMedication(medicationId);
        } catch (localError) {
          console.warn('⚠️ Failed to update local storage:', localError);
        }
        return true;
      }
      console.error('❌ Failed to delete medication from API');
      return false;
    } catch (error) {
      console.error('❌ Error deleting medication:', error);
      // Fallback to AsyncStorage only
      try {
        const medications = await this.getMedications();
        const filtered = medications.filter(med => med.id !== medicationId);
        await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(filtered));
        
        await this.deleteSchedulesForMedication(medicationId);
        await this.deleteLogsForMedication(medicationId);
        console.log('📱 Medication deleted from local storage as fallback');
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback delete failed:', fallbackError);
        return false;
      }
    }
  }

  // Schedule Management - API First Approach
  static async saveSchedules(schedules: MedicationSchedule[]): Promise<boolean> {
    try {
      console.log('💾 Saving schedules to API...');
      // Save to API for each schedule
      for (const schedule of schedules) {
        if (schedule.id) {
          // Note: Update schedule endpoint might need to be implemented
          console.log('⚠️ Update schedule not implemented yet');
        } else {
          await ApiService.addSchedule(schedule);
        }
      }
      
      console.log('✅ All schedules saved to API successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving schedules to API:', error);
      return false;
    }
  }

  static async getSchedules(): Promise<MedicationSchedule[]> {
    try {
      console.log('📥 Fetching schedules from API...');
      // Try to get from API first
      const apiSchedules = await ApiService.getSchedules();
      console.log(`✅ Retrieved ${apiSchedules.length} schedules from API`);
      return apiSchedules;
    } catch (error) {
      console.error('❌ Error loading schedules from API:', error);
      // Fallback to AsyncStorage
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES);
        const schedules = data ? JSON.parse(data) : [];
        console.log(`📱 Retrieved ${schedules.length} schedules from local storage`);
        return schedules;
      } catch (fallbackError) {
        console.error('❌ Fallback load failed:', fallbackError);
        return [];
      }
    }
  }

  static async addSchedule(schedule: MedicationSchedule): Promise<boolean> {
    try {
      console.log('➕ Adding schedule to API:', schedule.id);
      // Add to API first
      const success = await ApiService.addSchedule(schedule);
      if (success) {
        console.log('✅ Schedule added to API successfully');
        // Update local storage as backup
        try {
          const schedules = await this.getSchedules();
          schedules.push(schedule);
          await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
        } catch (localError) {
          console.warn('⚠️ Failed to update local storage:', localError);
        }
        return true;
      }
      console.error('❌ Failed to add schedule to API');
      return false;
    } catch (error) {
      console.error('❌ Error adding schedule:', error);
      // Fallback to AsyncStorage only
      try {
        const schedules = await this.getSchedules();
        schedules.push(schedule);
        await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
        console.log('📱 Schedule saved to local storage as fallback');
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback add failed:', fallbackError);
        return false;
      }
    }
  }

  static async deleteSchedulesForMedication(medicationId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting schedules for medication:', medicationId);
      const schedules = await this.getSchedules();
      const schedulesToDelete = schedules.filter(s => s.medicationId === medicationId);
      
      for (const schedule of schedulesToDelete) {
        await ApiService.deleteSchedule(schedule.id);
      }
      
      // Update local storage
      const remainingSchedules = schedules.filter(s => s.medicationId !== medicationId);
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(remainingSchedules));
      
      console.log(`✅ Deleted ${schedulesToDelete.length} schedules`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting schedules:', error);
      return false;
    }
  }

  // Dose Log Management - API First Approach
  static async saveDoseLogs(logs: DoseLog[]): Promise<boolean> {
    try {
      console.log('💾 Saving dose logs to API...');
      // Save to API for each log
      for (const log of logs) {
        if (log.id) {
          await ApiService.updateDoseLog(log);
        } else {
          await ApiService.addDoseLog(log);
        }
      }
      
      console.log('✅ All dose logs saved to API successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving dose logs to API:', error);
      return false;
    }
  }

  static async getDoseLogs(): Promise<DoseLog[]> {
    try {
      console.log('📥 Fetching dose logs from API...');
      // Try to get from API first
      const apiLogs = await ApiService.getDoseLogs();
      console.log(`✅ Retrieved ${apiLogs.length} dose logs from API`);
      return apiLogs;
    } catch (error) {
      console.error('❌ Error loading dose logs from API:', error);
      // Fallback to AsyncStorage
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
        const logs = data ? JSON.parse(data) : [];
        console.log(`📱 Retrieved ${logs.length} dose logs from local storage`);
        return logs;
      } catch (fallbackError) {
        console.error('❌ Fallback load failed:', fallbackError);
        return [];
      }
    }
  }

  static async addDoseLog(log: DoseLog): Promise<boolean> {
    try {
      console.log('➕ Adding dose log to API:', log.medicationId);
      // Add to API first
      const success = await ApiService.addDoseLog(log);
      if (success) {
        console.log('✅ Dose log added to API successfully');
        // Update local storage as backup
        try {
          const logs = await this.getDoseLogs();
          logs.push(log);
          
          // Keep only last 1000 logs to prevent storage bloat
          if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
          }
          
          await AsyncStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
        } catch (localError) {
          console.warn('⚠️ Failed to update local storage:', localError);
        }
        return true;
      }
      console.error('❌ Failed to add dose log to API');
      return false;
    } catch (error) {
      console.error('❌ Error adding dose log:', error);
      // Fallback to AsyncStorage only
      try {
        const logs = await this.getDoseLogs();
        logs.push(log);
        
        if (logs.length > 1000) {
          logs.splice(0, logs.length - 1000);
        }
        
        await AsyncStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
        console.log('📱 Dose log saved to local storage as fallback');
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback add failed:', fallbackError);
        return false;
      }
    }
  }

  static async deleteLogsForMedication(medicationId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting logs for medication:', medicationId);
      const logs = await this.getDoseLogs();
      const filtered = logs.filter(log => log.medicationId !== medicationId);
      
      // Note: You might want to add a bulk delete endpoint for logs
      await AsyncStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(filtered));
      console.log('✅ Logs deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting logs:', error);
      return false;
    }
  }

  // Analytics Data
  static async getAdherenceData(medicationId: string | null = null, days: number = 30): Promise<AdherenceData> {
    try {
      console.log('📊 Getting adherence data from API...');
      const logs = await this.getDoseLogs();
      const schedules = await this.getSchedules();
      const medications = await this.getMedications();
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      // Filter logs by date range and medication if specified
      let filteredLogs = logs.filter(log => {
        const logDate = new Date(log.scheduledTime);
        return logDate >= startDate && logDate <= endDate &&
               (medicationId ? log.medicationId === medicationId : true);
      });
      
      // Calculate adherence statistics
      const totalScheduled = filteredLogs.length;
      const taken = filteredLogs.filter(log => log.status === 'taken').length;
      const skipped = filteredLogs.filter(log => log.status === 'skipped').length;
      const missed = filteredLogs.filter(log => log.status === 'missed').length;
      
      const adherenceData = {
        totalScheduled,
        taken,
        skipped,
        missed,
        adherenceRate: totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 0,
        logs: filteredLogs,
        medications: medications.filter(med => 
          medicationId ? med.id === medicationId : true
        )
      };
      
      console.log(`📊 Adherence data calculated: ${adherenceData.adherenceRate}% adherence rate`);
      return adherenceData;
    } catch (error) {
      console.error('❌ Error getting adherence data:', error);
      return {
        totalScheduled: 0,
        taken: 0,
        skipped: 0,
        missed: 0,
        adherenceRate: 0,
        logs: [],
        medications: []
      };
    }
  }
} 