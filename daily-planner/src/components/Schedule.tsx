import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, DaySchedule } from '../lib/timeCalculation';
import { TaskCard } from './TaskCard';

interface ScheduleProps {
  schedule: DaySchedule;
  onReorder: (newOrder: Task[]) => void;
  onRemoveTask: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export function Schedule({ schedule, onReorder, onRemoveTask, onTaskClick }: ScheduleProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const dragStartIndex = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragStartIndex.current = index;
    setDraggedTaskId(schedule.tasks[index].id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDraggedOverIndex(null);

    if (dragStartIndex.current === null || dragStartIndex.current === dropIndex) return;

    const newTasks = [...schedule.tasks];
    const draggedTask = newTasks[dragStartIndex.current];
    newTasks.splice(dragStartIndex.current, 1);
    newTasks.splice(dropIndex, 0, draggedTask);

    const reorderedTasks = newTasks.map((task, idx) => ({
      ...task,
      position: idx,
    }));

    setDraggedTaskId(null);
    dragStartIndex.current = null;
    onReorder(reorderedTasks);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    dragStartIndex.current = null;
    setDraggedOverIndex(null);
  };

  const fittedTasks = schedule.tasks.filter(t => t.fitted);
  const overflowTasks = schedule.tasks.filter(t => !t.fitted);

  return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {fittedTasks.length === 0 && overflowTasks.length === 0 && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-neutral-400 text-lg">Нет запланированных задач</p>
                <p className="text-neutral-500 text-sm mt-2">Добавьте задачу, чтобы начать</p>
              </div>
            </div>
        )}

        {fittedTasks.length > 0 && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {fittedTasks.map((task, taskIndex) => {
                  const taskScheduleIndex = schedule.tasks.findIndex(t => t.id === task.id);

                  return (
                      <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, taskScheduleIndex)}
                          onDragOver={(e) => handleDragOver(e, taskScheduleIndex)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, taskScheduleIndex)}
                          onDragEnd={handleDragEnd}
                          className="transition-transform duration-200"
                      >
                        <TaskCard
                            task={task}
                            index={taskIndex}
                            isDragging={draggedTaskId === task.id}
                            draggedOverIndex={
                              draggedOverIndex === taskScheduleIndex
                                  ? taskIndex
                                  : null
                            }
                            onRemove={() => onRemoveTask(task.id)}
                            onClick={() => onTaskClick(task)}
                            buffer={undefined}
                        />
                      </div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
        )}

        {overflowTasks.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t border-neutral-800 space-y-4"
            >
              <div className="flex items-center gap-2 text-red-400 font-semibold">
                <span className="text-xl">⚠️</span>
                <span>Задачи, которые не подходят</span>
                <span className="text-sm text-red-300">({overflowTasks.length})</span>
              </div>
              <p className="text-neutral-400 text-sm">
                Эти задачи не соответствуют вашему доступному времени на сегодня. Рассмотрите возможность их удаления или переноса на другой день.
              </p>

              <AnimatePresence mode="popLayout">
                {overflowTasks.map((task) => (
                    <div key={task.id}>
                      <TaskCard
                          task={task}
                          index={schedule.tasks.findIndex(t => t.id === task.id)}
                          isDragging={draggedTaskId === task.id}
                          draggedOverIndex={null}
                          onRemove={() => onRemoveTask(task.id)}
                          onClick={() => onTaskClick(task)}
                      />
                    </div>
                ))}
              </AnimatePresence>
            </motion.div>
        )}
      </div>
  );
}
