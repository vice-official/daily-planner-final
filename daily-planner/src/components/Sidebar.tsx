import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { DayConfig, Task, formatMinutesToHM } from '../lib/timeCalculation';

interface SidebarProps {
  config: DayConfig;
  onConfigChange: (config: DayConfig) => void;
  onAddTask: (task: Omit<Task, 'id' | 'position' | 'startTime' | 'endTime'>) => void;
  remainingMinutes: number;
  taskCount: number;
}

export function Sidebar({
                          config,
                          onConfigChange,
                          onAddTask,
                          remainingMinutes,
                          taskCount,
                        }: SidebarProps) {
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState({ hours: 0, minutes: 30 });
  const [taskType, setTaskType] = useState<Task['type']>('required');
  const [expandedSection, setExpandedSection] = useState<'settings' | 'add' | null>('settings');

  const handleAddTask = () => {
    if (!taskName.trim()) return;

    const durationMinutes = duration.hours * 60 + duration.minutes;
    if (durationMinutes === 0) return;

    onAddTask({
      name: taskName,
      durationMinutes,
      type: taskType,
      fitted: true,
    });

    setTaskName('');
    setDuration({ hours: 0, minutes: 30 });
    setTaskType('required');
  };


  return (
      <div className="w-full lg:w-80 bg-neutral-900 border-r border-neutral-800 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="p-6 space-y-6">
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
          >
            <button
                onClick={() =>
                    setExpandedSection(expandedSection === 'settings' ? null : 'settings')
                }
                className="w-full flex items-center justify-between bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-white">Настройки дня</span>
              </div>
              <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform ${
                      expandedSection === 'settings' ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {expandedSection === 'settings' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-5"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Часы сна: <span className="text-blue-400 font-bold">{config.sleepHours}ч</span>
                    </label>
                    <input
                        type="range"
                        min="4"
                        max="12"
                        step="0.5"
                        value={config.sleepHours}
                        onChange={(e) =>
                            onConfigChange({
                              ...config,
                              sleepHours: parseFloat(e.target.value),
                            })
                        }
                        className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Часы отдыха: <span className="text-amber-400 font-bold">{config.restHours}ч</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="6"
                        step="0.5"
                        value={config.restHours}
                        onChange={(e) =>
                            onConfigChange({
                              ...config,
                              restHours: parseFloat(e.target.value),
                            })
                        }
                        className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Начало дня</label>
                    <input
                        type="time"
                        value={config.dayStartTime}
                        onChange={(e) =>
                            onConfigChange({
                              ...config,
                              dayStartTime: e.target.value,
                            })
                        }
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Пауза между задачами: <span className="text-purple-400 font-bold">{config.bufferMinutes}м</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="60"
                        step="5"
                        value={config.bufferMinutes}
                        onChange={(e) =>
                            onConfigChange({
                              ...config,
                              bufferMinutes: parseInt(e.target.value),
                            })
                        }
                        className="w-full accent-purple-500"
                    />
                  </div>

                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    <div className="text-sm text-neutral-400 mb-2">Доступное время</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatMinutesToHM(remainingMinutes)}
                    </div>
                  </div>
                </motion.div>
            )}
          </motion.div>

          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
          >
            <button
                onClick={() => setExpandedSection(expandedSection === 'add' ? null : 'add')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-blue-500 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Добавить задачу</span>
              </div>
              <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                      expandedSection === 'add' ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {expandedSection === 'add' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Название задачи</label>
                    <input
                        type="text"
                        placeholder="Например, встреча с командой"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Продолжительность</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="text-xs text-neutral-400 mb-1">Часы</div>
                        <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded">
                          <button
                              onClick={() =>
                                  setDuration({ ...duration, hours: Math.max(0, duration.hours - 1) })
                              }
                              className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-700 transition-colors"
                          >
                            −
                          </button>
                          <input
                              type="number"
                              min="0"
                              max="12"
                              value={duration.hours}
                              onChange={(e) =>
                                  setDuration({ ...duration, hours: Math.max(0, parseInt(e.target.value) || 0) })
                              }
                              className="flex-1 bg-neutral-800 text-white text-center border-l border-r border-neutral-700 py-2 focus:outline-none"
                          />
                          <button
                              onClick={() =>
                                  setDuration({ ...duration, hours: Math.min(12, duration.hours + 1) })
                              }
                              className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-700 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-neutral-400 mb-1">Минуты</div>
                        <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded">
                          <button
                              onClick={() =>
                                  setDuration({
                                    ...duration,
                                    minutes: Math.max(0, duration.minutes - 15),
                                  })
                              }
                              className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-700 transition-colors"
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
                              className="flex-1 bg-neutral-800 text-white text-center border-l border-r border-neutral-700 py-2 focus:outline-none"
                          />
                          <button
                              onClick={() =>
                                  setDuration({
                                    ...duration,
                                    minutes: Math.min(59, duration.minutes + 15),
                                  })
                              }
                              className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-700 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Тип задачи</label>
                    <select
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value as Task['type'])}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
                    >
                      <option value="required" className="bg-neutral-900">
                        Обязательная
                      </option>
                      <option value="additional" className="bg-neutral-900">
                        Дополнительная
                      </option>
                      <option value="urgent" className="bg-neutral-900">
                        Срочная
                      </option>
                      <option value="force_majeure" className="bg-neutral-900">
                        Форс-мажор
                      </option>
                    </select>
                  </div>

                  <button
                      onClick={handleAddTask}
                      disabled={!taskName.trim() || duration.hours === 0 && duration.minutes === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg py-2 font-semibold text-white transition-colors"
                  >
                    Добавить задачу
                  </button>
                </motion.div>
            )}
          </motion.div>

          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 space-y-2">
            <div className="text-xs text-neutral-400 uppercase tracking-wide">Сводка</div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Всего задач:</span>
              <span className="text-white font-semibold">{taskCount}</span>
            </div>
          </div>
        </div>
      </div>
  );
}
