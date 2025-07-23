import uuid from 'react-native-uuid';

export interface MedicationData {
  name: string;
  category?: string;
  dosage: string;
  unit?: string;
  instructions?: string;
  color?: string;
  isActive?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  category: string;
  dosage: string;
  unit: string;
  instructions: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  schedules: string[];
}

export interface MedicationScheduleData {
  medicationId: string;
  times?: string[];
  frequency?: string;
  duration?: string | null;
  mealTiming?: string;
  isActive?: boolean;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  times: string[];
  frequency: string;
  duration: string | null;
  mealTiming: string;
  isActive: boolean;
  createdAt: string;
}

export interface DoseLogData {
  medicationId: string;
  scheduledTime: string;
  status?: 'taken' | 'skipped' | 'missed';
  actualTime?: string | null;
  notes?: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduledTime: string;
  status: 'taken' | 'skipped' | 'missed';
  actualTime: string;
  notes: string;
  loggedAt: string;
}

export class MedicationClass {
  id: string;
  name: string;
  category: string;
  dosage: string;
  unit: string;
  instructions: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  schedules: string[];

  constructor({
    name,
    category = 'prescription',
    dosage,
    unit = 'tablet',
    instructions = '',
    color = '#007AFF',
    isActive = true
  }: MedicationData) {
    this.id = uuid.v4() as string;
    this.name = name;
    this.category = category;
    this.dosage = dosage;
    this.unit = unit;
    this.instructions = instructions;
    this.color = color;
    this.isActive = isActive;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.schedules = [];
  }

  toJSON(): Medication {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      dosage: this.dosage,
      unit: this.unit,
      instructions: this.instructions,
      color: this.color,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      schedules: this.schedules
    };
  }
}

export class MedicationScheduleClass {
  id: string;
  medicationId: string;
  times: string[];
  frequency: string;
  duration: string | null;
  mealTiming: string;
  isActive: boolean;
  createdAt: string;

  constructor({
    medicationId,
    times = [],
    frequency = 'daily',
    duration = null,
    mealTiming = 'anytime',
    isActive = true
  }: MedicationScheduleData) {
    this.id = uuid.v4() as string;
    this.medicationId = medicationId;
    this.times = times;
    this.frequency = frequency;
    this.duration = duration;
    this.mealTiming = mealTiming;
    this.isActive = isActive;
    this.createdAt = new Date().toISOString();
  }
}

export class DoseLogClass {
  id: string;
  medicationId: string;
  scheduledTime: string;
  status: 'taken' | 'skipped' | 'missed';
  actualTime: string;
  notes: string;
  loggedAt: string;

  constructor({
    medicationId,
    scheduledTime,
    status = 'taken',
    actualTime = null,
    notes = ''
  }: DoseLogData) {
    this.id = uuid.v4() as string;
    this.medicationId = medicationId;
    this.scheduledTime = scheduledTime;
    this.status = status;
    this.actualTime = actualTime || new Date().toISOString();
    this.notes = notes;
    this.loggedAt = new Date().toISOString();
  }
} 