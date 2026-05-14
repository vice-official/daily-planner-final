import { motion } from 'framer-motion';
import { GripVertical, AlertCircle, Star, Zap } from 'lucide-react';
import { Task } from '../lib/timeCalculation';

interface TaskCardProps {
  task: Task;
  index: number;
  isDragging: boolean;
  draggedOverIndex: number | null;
  onRemove: () => void;
  buffer?: number;
  onClick: () => void;
}

function getTaskColor(type: Task['type']): { bg: string; border: string; tag: string; icon: React.ReactNode } {
  switch (type) {
    case 'urgent':
      return {
        bg: 'bg-red-950',
        border: 'border-red-800',
        tag: 'bg-red-900 text-red-200',
        icon: <AlertCircle className="w-4 h-4" />,
      };
    case 'required':
      return {
        bg: 'bg-blue-950',
        border: 'border-blue-800',
        tag: 'bg-blue-900 text-blue-200',
        icon: <Star className="w-4 h-4" />,
      };
    case 'force_majeure':
      return {
        bg: 'bg-purple-950',
        border: 'border-purple-800',
        tag: 'bg-purple-900 text-purple-200',
        icon: <Zap className="w-4 h-4" />,
      };
    default:
      return {
        bg: 'bg-neutral-800',
        border: 'border-neutral-700',
        tag: 'bg-neutral-700 text-neutral-300',
        icon: null,
      };
  }
}

export function TaskCard({
                           task,
                           index,
                           isDragging,
                           draggedOverIndex,
                           onRemove,
                           buffer,
                           onClick,
                         }: TaskCardProps) {
  const colors = getTaskColor(task.type);
  const isOverThis = draggedOverIndex === index;

  if (!task.fitted) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="opacity-50"
        >
          <div
              onClick={onClick}
              className={`${colors.bg} border-2 border-dashed ${colors.border} rounded-lg p-4 cursor-pointer hover:border-opacity-100 transition-all`}
          >
            <div className="text-red-400 text-sm font-semibold mb-2">Не подходит - нет свободного времени</div>
            <div className="text-neutral-300 font-medium truncate">{task.name}</div>
            <div className="text-xs text-neutral-400 mt-1">
              Продолжительность: {Math.floor(task.durationMinutes / 60)}ч{task.durationMinutes % 60}м
            </div>
          </div>
        </motion.div>
    );
  }

  return (
      <>
        {buffer !== undefined && buffer > 0 && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-2"
            >
              <div className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">
                Gap: {buffer}m
              </div>
            </motion.div>
        )}

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            layout
            className={`group relative transition-all ${isOverThis ? 'scale-105 z-50' : ''}`}
        >
          <div
              onClick={onClick}
              className={`${colors.bg} border ${colors.border} rounded-lg p-4 hover:border-opacity-100 transition-all cursor-grab active:cursor-grabbing
          ${isDragging ? 'opacity-50' : 'hover:shadow-lg hover:shadow-blue-500/10'}
          ${isOverThis ? 'ring-2 ring-blue-500' : ''}
          ${task.completed ? 'opacity-60 bg-opacity-50' : ''}`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <GripVertical className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-2xl font-bold ${task.completed ? 'text-neutral-500' : 'text-white'}`}>
                  {task.startTime}
                </span>
                  <span className="text-neutral-500">-</span>
                  <span className={`text-lg ${task.completed ? 'text-neutral-500' : 'text-neutral-300'}`}>
                  {task.endTime}
                </span>
                  <span
                      className={`${colors.tag} text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 capitalize`}
                  >
                  {colors.icon}
                    {task.type.replace('_', ' ')}
                </span>
                  {task.completed && (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-900 text-emerald-200">
                    Completed
                  </span>
                  )}
                </div>

                <h3 className={`font-semibold text-lg mb-1 break-words ${task.completed ? 'text-neutral-500 line-through' : 'text-white'}`}>
                  {task.name}
                </h3>

                <div className="text-sm text-neutral-400">
                  {Math.floor(task.durationMinutes / 60) > 0 && (
                      <span>{Math.floor(task.durationMinutes / 60)}ч </span>
                  )}
                  {task.durationMinutes % 60}м
                </div>
              </div>

              <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="flex-shrink-0 text-neutral-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </motion.button>
            </div>
          </div>
        </motion.div>
      </>
  );
}
