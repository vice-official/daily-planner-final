import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Calendar } from 'lucide-react';
import { Task, DayConfig, recalculateSchedule } from '../lib/timeCalculation';

interface WeekDataType {
  [day: number]: {
    config: DayConfig;
    tasks: Task[];
  };
}

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onReschedule: (task: Task, targetDay: number) => void;
  onToggleComplete: (taskId: string) => void;
  currentDay: number;
  weekData: WeekDataType;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function TaskModal({
                            task,
                            isOpen,
                            onClose,
                            onSave,
                            onReschedule,
                            onToggleComplete,
                            currentDay,
                            weekData,
                          }: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [duration, setDuration] = useState({
    hours: Math.floor(task.durationMinutes / 60),
    minutes: task.durationMinutes % 60,
  });
  const [showRescheduleOptions, setShowRescheduleOptions] = useState(false);

  useEffect(() => {
    setEditedTask(task);
    setDuration({
      hours: Math.floor(task.durationMinutes / 60),
      minutes: task.durationMinutes % 60,
    });
  }, [task, isOpen]);

  const handleSave = () => {
    const durationMinutes = duration.hours * 60 + duration.minutes;
    const updatedTask = {
      ...editedTask,
      durationMinutes,
    };
    onSave(updatedTask);
    onClose();
  };

  const getAvailableRescheduleays = () => {
    const available = [];
    for (let day = 0; day < 7; day++) {
      if (day === currentDay) continue;

      const dayTasks = weekData[day].tasks.filter(t => t.id !== task.id);
      const { schedule } = recalculateSchedule(dayTasks, weekData[day].config);

      const durationMinutes = duration.hours * 60 + duration.minutes;
      if (schedule.remainingMinutes >= durationMinutes) {
        available.push(day);
      }
    }
    return available;
  };

  const availableDays = getAvailableRescheduleays();

  if (!isOpen) return null;

  return (
      <AnimatePresence>
        {isOpen && (
            <>
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="fixed inset-0 bg-black/50 z-40"
              />

              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">Редактирование задачи</h2>
                        <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                task.type === 'urgent'
                                    ? 'bg-red-900 text-red-200'
                                    : task.type === 'force_majeure'
                                        ? 'bg-purple-900 text-purple-200'
                                        : task.type === 'required'
                                            ? 'bg-blue-900 text-blue-200'
                                            : 'bg-neutral-700 text-neutral-300'
                            }`}
                        >
                          {task.type.replace('_', ' ')}
                        </div>
                      </div>
                      <button
                          onClick={onClose}
                          className="text-neutral-400 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Название задачи
                        </label>
                        <input
                            type="text"
                            value={editedTask.name}
                            onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                            className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Продолжительность
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-neutral-400 mb-1">Часы</div>
                            <div className="flex items-center bg-neutral-700 border border-neutral-600 rounded-lg">
                              <button
                                  onClick={() =>
                                      setDuration({ ...duration, hours: Math.max(0, duration.hours - 1) })
                                  }
                                  className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-600 transition-colors"
                              >
                                −
                              </button>
                              <input
                                  type="number"
                                  min="0"
                                  max="12"
                                  value={duration.hours}
                                  onChange={(e) =>
                                      setDuration({
                                        ...duration,
                                        hours: Math.max(0, parseInt(e.target.value) || 0),
                                      })
                                  }
                                  className="flex-1 bg-neutral-700 text-white text-center border-l border-r border-neutral-600 py-2 focus:outline-none"
                              />
                              <button
                                  onClick={() =>
                                      setDuration({ ...duration, hours: Math.min(12, duration.hours + 1) })
                                  }
                                  className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="text-xs text-neutral-400 mb-1">Минуты</div>
                            <div className="flex items-center bg-neutral-700 border border-neutral-600 rounded-lg">
                              <button
                                  onClick={() =>
                                      setDuration({
                                        ...duration,
                                        minutes: Math.max(0, duration.minutes - 15),
                                      })
                                  }
                                  className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-600 transition-colors"
                              >
                                −
                              </button>
                              <input
                                  type="number"
                                  min="0"
                                  max="59"
                                  step="15"
                                  value={duration.minutes}
                                  onChange={(e) =>
                                      setDuration({
                                        ...duration,
                                        minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                                      })
                                  }
                                  className="flex-1 bg-neutral-700 text-white text-center border-l border-r border-neutral-600 py-2 focus:outline-none"
                              />
                              <button
                                  onClick={() =>
                                      setDuration({
                                        ...duration,
                                        minutes: Math.min(59, duration.minutes + 15),
                                      })
                                  }
                                  className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Тип задачи
                        </label>
                        <select
                            value={editedTask.type}
                            onChange={(e) =>
                                setEditedTask({
                                  ...editedTask,
                                  type: e.target.value as Task['type'],
                                })
                            }
                            className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="required">Обязательная</option>
                          <option value="additional">Дополнительная</option>
                          <option value="urgent">Срочная</option>
                          <option value="force_majeure">Форс-мажор</option>
                        </select>
                      </div>

                      <div className="pt-4 border-t border-neutral-700">
                        <button
                            onClick={() => setShowRescheduleOptions(!showRescheduleOptions)}
                            className="w-full flex items-center justify-between bg-neutral-700 hover:bg-neutral-600 rounded-lg px-4 py-3 text-white font-medium transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Перенести на другой день
                          </div>
                          {availableDays.length > 0 && (
                              <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                          {availableDays.length} доступно
                        </span>
                          )}
                        </button>

                        {showRescheduleOptions && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 grid grid-cols-2 gap-2"
                            >
                              {DAYS.map((day, index) => {
                                const isAvailable = availableDays.includes(index);
                                const isCurrent = index === currentDay;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => {
                                          if (isAvailable) {
                                            onReschedule(editedTask, index);
                                            onClose();
                                          }
                                        }}
                                        disabled={!isAvailable || isCurrent}
                                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                            isCurrent
                                                ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                                                : isAvailable
                                                    ? 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                                                    : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                        }`}
                                    >
                                      {day}
                                    </button>
                                );
                              })}
                            </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-neutral-700">
                      <button
                          onClick={() => {
                            onToggleComplete(task.id);
                            onClose();
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-medium py-2 transition-colors ${
                              task.completed
                                  ? 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
                                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                          }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {task.completed ? 'Отметить как не выполненную' : 'Отметить как выполненную'}
                      </button>

                      <button
                          onClick={handleSave}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                      >
                        Сохранить изменения
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
        )}
      </AnimatePresence>
  );
}
