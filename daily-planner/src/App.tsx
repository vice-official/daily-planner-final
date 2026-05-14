import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Schedule } from './components/Schedule';
import { TaskModal } from './components/TaskModal';
import {
  Task,
  DayConfig,
  recalculateSchedule,
} from './lib/timeCalculation';

const DEFAULT_CONFIG: DayConfig = {
  sleepHours: 8,
  restHours: 2,
  dayStartTime: '08:00',
  bufferMinutes: 15,
};

interface WeekData {
  [day: number]: {
    config: DayConfig;
    tasks: Task[];
  };
}

function App() {
  const [currentDay, setCurrentDay] = useState(0);
  const [weekData, setWeekData] = useState<WeekData>(() => {
    const saved = localStorage.getItem('weekPlanner');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return createEmptyWeek();
      }
    }
    return createEmptyWeek();
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentDayData = weekData[currentDay];
  const { tasks: calculatedTasks, schedule } = recalculateSchedule(
      currentDayData.tasks,
      currentDayData.config
  );

  useEffect(() => {
    localStorage.setItem('weekPlanner', JSON.stringify(weekData));
  }, [weekData]);

  const handleConfigChange = useCallback((newConfig: DayConfig) => {
    setWeekData((prev) => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        config: newConfig,
      },
    }));
  }, [currentDay]);

  const handleAddTask = useCallback(
      (taskData: Omit<Task, 'id' | 'position' | 'startTime' | 'endTime'>) => {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...taskData,
          position: currentDayData.tasks.length,
        };

        setWeekData((prev) => ({
          ...prev,
          [currentDay]: {
            ...prev[currentDay],
            tasks: [...prev[currentDay].tasks, newTask],
          },
        }));
      },
      [currentDay, currentDayData.tasks.length]
  );

  const handleReorderTasks = useCallback(
      (reorderedTasks: Task[]) => {
        setWeekData((prev) => ({
          ...prev,
          [currentDay]: {
            ...prev[currentDay],
            tasks: reorderedTasks,
          },
        }));
      },
      [currentDay]
  );

  const handleRemoveTask = useCallback(
      (taskId: string) => {
        setWeekData((prev) => ({
          ...prev,
          [currentDay]: {
            ...prev[currentDay],
            tasks: prev[currentDay].tasks.filter((t) => t.id !== taskId),
          },
        }));
      },
      [currentDay]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(
      (updatedTask: Task) => {
        setWeekData((prev) => ({
          ...prev,
          [currentDay]: {
            ...prev[currentDay],
            tasks: prev[currentDay].tasks.map((t) =>
                t.id === updatedTask.id ? updatedTask : t
            ),
          },
        }));
        setSelectedTask(null);
      },
      [currentDay]
  );

  const handleRescheduleTask = useCallback(
      (task: Task, targetDay: number) => {
        setWeekData((prev) => ({
          ...prev,
          [currentDay]: {
            ...prev[currentDay],
            tasks: prev[currentDay].tasks.filter((t) => t.id !== task.id),
          },
          [targetDay]: {
            ...prev[targetDay],
            tasks: [...prev[targetDay].tasks, task],
          },
        }));
        setCurrentDay(targetDay);
        setSelectedTask(null);
      },
      [currentDay]
  );

  const handleToggleComplete = useCallback(
      (taskId: string) => {
        setWeekData((prev) => ({
          ...prev,
          [currentDay]: {
            ...prev[currentDay],
            tasks: prev[currentDay].tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
            ),
          },
        }));

        if (selectedTask?.id === taskId) {
          setSelectedTask((prev) =>
              prev ? { ...prev, completed: !prev.completed } : null
          );
        }
      },
      [currentDay, selectedTask]
  );

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col h-screen bg-neutral-900 text-white"
      >
        <Header
            currentDay={currentDay}
            onDayChange={setCurrentDay}
            schedule={schedule}
            config={currentDayData.config}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
              config={currentDayData.config}
              onConfigChange={handleConfigChange}
              onAddTask={handleAddTask}
              remainingMinutes={schedule.remainingMinutes}
              taskCount={currentDayData.tasks.length}
          />

          <Schedule
              schedule={{
                ...schedule,
                tasks: calculatedTasks,
              }}
              onReorder={handleReorderTasks}
              onRemoveTask={handleRemoveTask}
              onTaskClick={handleTaskClick}
          />
        </div>

        {selectedTask && (
            <TaskModal
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                onReschedule={handleRescheduleTask}
                onToggleComplete={handleToggleComplete}
                currentDay={currentDay}
                weekData={weekData}
            />
        )}
      </motion.div>
  );
}

function createEmptyWeek(): WeekData {
  const week: WeekData = {};
  for (let i = 0; i < 7; i++) {
    week[i] = {
      config: DEFAULT_CONFIG,
      tasks: [],
    };
  }
  return week;
}

export default App;
