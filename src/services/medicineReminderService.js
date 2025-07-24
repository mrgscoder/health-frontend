import axios from 'axios';
import { API_BASE_URL } from '../config';

const MEDICINE_REMINDER_API = `${API_BASE_URL}/medicine-reminders`;

export const createReminder = async (reminderData) => {
  try {
    const response = await axios.post(MEDICINE_REMINDER_API, reminderData);
    return response.data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error.response?.data || { message: 'Failed to create reminder' };
  }
};

export const getUserReminders = async (userId, activeOnly = true) => {
  try {
    const response = await axios.get(`${MEDICINE_REMINDER_API}/user/${userId}`, {
      params: { active_only: activeOnly }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error.response?.data || { message: 'Failed to fetch reminders' };
  }
};

export const updateReminder = async (reminderId, updateData) => {
  try {
    const response = await axios.put(`${MEDICINE_REMINDER_API}/${reminderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error.response?.data || { message: 'Failed to update reminder' };
  }
};

export const deleteReminder = async (reminderId) => {
  try {
    const response = await axios.delete(`${MEDICINE_REMINDER_API}/${reminderId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error.response?.data || { message: 'Failed to delete reminder' };
  }
};

export const logMedicineIntake = async (logData) => {
  try {
    const response = await axios.post(`${MEDICINE_REMINDER_API}/log-intake`, logData);
    return response.data;
  } catch (error) {
    console.error('Error logging intake:', error);
    throw error.response?.data || { message: 'Failed to log medicine intake' };
  }
};

export const getUpcomingReminders = async (userId, days = 7) => {
  try {
    const response = await axios.get(`${MEDICINE_REMINDER_API}/upcoming/${userId}`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    throw error.response?.data || { message: 'Failed to fetch upcoming reminders' };
  }
};
