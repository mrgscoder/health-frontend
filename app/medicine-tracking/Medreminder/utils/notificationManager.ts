import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication, MedicationSchedule } from '../models/MedicationModels';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface MedicationReminderData {
  medicationId: string;
  medicationName: string;
  dosage: string;
  unit: string;
  time: string; // '09:30' format
  scheduleId: string;
}

export class NotificationManager {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleMedicationReminder({
    medicationId,
    medicationName,
    dosage,
    unit,
    time, // '09:30' format
    scheduleId
  }: MedicationReminderData): Promise<string | null> {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medicine Reminder',
          body: `Time to take ${medicationName} (${dosage} ${unit})`,
          data: {
            medicationId,
            scheduleId,
            type: 'medication_reminder'
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }

  static async cancelAllNotificationsForMedication(medicationId: string): Promise<boolean> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.medicationId === medicationId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error canceling notifications for medication:', error);
      return false;
    }
  }

  static async rescheduleAllNotifications(medications: Medication[], schedules: MedicationSchedule[]): Promise<boolean> {
    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Reschedule active medications
      for (const medication of medications) {
        if (!medication.isActive) continue;
        
        const medicationSchedules = schedules.filter(s => 
          s.medicationId === medication.id && s.isActive
        );
        
        for (const schedule of medicationSchedules) {
          for (const time of schedule.times) {
            await this.scheduleMedicationReminder({
              medicationId: medication.id,
              medicationName: medication.name,
              dosage: medication.dosage,
              unit: medication.unit,
              time: time,
              scheduleId: schedule.id
            });
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
      return false;
    }
  }

  static async sendImmediateNotification(title: string, body: string, data: Record<string, any> = {}): Promise<boolean> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });
      return true;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      return false;
    }
  }
} 