import { motion } from 'framer-motion';
import { Moon, Sun, CheckSquare2, Clock } from 'lucide-react';
import { DaySchedule, formatMinutesToHM, getCompletionPercentage } from '../lib/timeCalculation';

interface HeaderProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  schedule: DaySchedule;
  config: {
    sleepHours: number;
    restHours: number;
  };
}

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export function Header({ currentDay, onDayChange, schedule, config }: HeaderProps) {
  const percentage = getCompletionPercentage(schedule);
  const tasksCount = schedule.tasks.filter(t => t.fitted).length;

  return (
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Планировщик задач</h1>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS.map((day, index) => (
                <motion.button
                    key={day}
                    onClick={() => onDayChange(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        currentDay === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                  {day}
                </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-800 rounded-lg p-4 border border-neutral-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-blue-400" />
                <span className="text-neutral-400 text-sm">Сон</span>
              </div>
              <div className="text-2xl font-bold text-white">{config.sleepHours}ч</div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-neutral-800 rounded-lg p-4 border border-neutral-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="text-neutral-400 text-sm">Отдых</span>
              </div>
              <div className="text-2xl font-bold text-white">{config.restHours}ч</div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-neutral-800 rounded-lg p-4 border border-neutral-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare2 className="w-5 h-5 text-emerald-400" />
                <span className="text-neutral-400 text-sm">Задачи</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {tasksCount}/{schedule.tasks.length}
              </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-neutral-800 rounded-lg p-4 border border-neutral-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-neutral-400 text-sm">Рабочее время</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatMinutesToHM(schedule.usedMinutes)}
              </div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Прогресс выполнения</span>
              <span className="text-white font-semibold">{percentage}%</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-3 border border-neutral-700 overflow-hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
  );
}
