export interface TimeRange {
  hours: number;
  minutes: number;
}

export interface Task {
  id: string;
  name: string;
  durationMinutes: number;
  type: 'required' | 'additional' | 'urgent' | 'force_majeure';
  position: number;
  startTime?: string;
  endTime?: string;
  fitted: boolean;
  completed?: boolean;
}

export interface DayConfig {
  sleepHours: number;
  restHours: number;
  dayStartTime: string;
  bufferMinutes: number;
}

export interface DaySchedule {
  tasks: Task[];
  availableMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  totalMinutes: number;
}

export const MINUTES_PER_DAY = 24 * 60;

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function calculateAvailableTime(config: DayConfig): number {
  const sleepMinutes = config.sleepHours * 60;
  const restMinutes = config.restHours * 60;
  return MINUTES_PER_DAY - sleepMinutes - restMinutes;
}

export function calculateTaskTimes(
  tasks: Task[],
  config: DayConfig
): Task[] {
  const dayStartMinutes = timeToMinutes(config.dayStartTime);
  const availableMinutes = calculateAvailableTime(config);

  let currentTimeMinutes = dayStartMinutes;
  let totalUsedMinutes = 0;

  return tasks.map((task) => {
    const startMinutes = currentTimeMinutes;
    const endMinutes = startMinutes + task.durationMinutes;

    totalUsedMinutes += task.durationMinutes;

    const isFitted = totalUsedMinutes <= availableMinutes;

    currentTimeMinutes = endMinutes + config.bufferMinutes;

    return {
      ...task,
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(endMinutes),
      fitted: isFitted,
    };
  });
}

export function recalculateSchedule(
  tasks: Task[],
  config: DayConfig
): { tasks: Task[]; schedule: DaySchedule } {
  const calculatedTasks = calculateTaskTimes(tasks, config);

  const usedMinutes = calculatedTasks
    .filter(t => t.fitted)
    .reduce((sum, task) => sum + task.durationMinutes, 0);

  const availableMinutes = calculateAvailableTime(config);
  const remainingMinutes = Math.max(0, availableMinutes - usedMinutes);

  const schedule: DaySchedule = {
    tasks: calculatedTasks,
    availableMinutes,
    usedMinutes,
    remainingMinutes,
    totalMinutes: MINUTES_PER_DAY,
  };

  return { tasks: calculatedTasks, schedule };
}

export function formatMinutesToHM(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getCompletionPercentage(schedule: DaySchedule): number {
  const completedTasks = schedule.tasks.filter(t => t.completed).length;
  const totalTasks = schedule.tasks.filter(t => t.fitted).length;
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}
