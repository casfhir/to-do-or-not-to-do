import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Define type weights and timing weights for calculating priority.
const TYPE_WEIGHTS = {
  Want: 1,
  Need: 2,
  Both: 3
};
const TIMING_WEIGHTS = {
  Today: 2,
  Later: 1
};

// Helper to compute the weight of a task based on its type and timing.
const computeWeight = task => {
  const typeWeight = TYPE_WEIGHTS[task.type] || 1;
  const timingWeight = TIMING_WEIGHTS[task.timing] || 1;
  return typeWeight * timingWeight;
};

const TasksContext = createContext({});

export const useTasks = () => useContext(TasksContext);

/**
 * The TasksProvider component wraps the application and provides
 * the tasks state, along with helpers for persisting and manipulating
 * tasks. It utilises AsyncStorage so that data persists between app launches.
 */
export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [lastActiveDate, setLastActiveDate] = useState(null);
  const [isInitialised, setIsInitialised] = useState(false);

  // Load persisted tasks and last active date on mount.
  useEffect(() => {
    const init = async () => {
      try {
        const tasksJSON = await AsyncStorage.getItem('@tasks');
        const dateStr = await AsyncStorage.getItem('@lastActiveDate');
        if (tasksJSON) {
          const parsed = JSON.parse(tasksJSON);
          // Recalculate weights on load in case of version changes.
          const withWeights = parsed.map(t => ({ ...t, weight: computeWeight(t) }));
          setTasks(withWeights);
        } else {
          // Populate with some sample tasks on first launch.
          const sample = [
            {
              id: uuidv4(),
              name: 'Read a book',
              type: 'Want',
              timing: 'Later',
              completed: false,
              todaySelected: false,
              createdAt: Date.now(),
              updatedAt: Date.now()
            },
            {
              id: uuidv4(),
              name: 'Pay bills',
              type: 'Need',
              timing: 'Today',
              completed: false,
              todaySelected: false,
              createdAt: Date.now(),
              updatedAt: Date.now()
            },
            {
              id: uuidv4(),
              name: 'Exercise',
              type: 'Both',
              timing: 'Today',
              completed: false,
              todaySelected: false,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ];
          const sampleWithWeights = sample.map(t => ({ ...t, weight: computeWeight(t) }));
          setTasks(sampleWithWeights);
        }
        setLastActiveDate(dateStr);
      } catch (err) {
        console.error('Error loading tasks from storage', err);
      } finally {
        setIsInitialised(true);
      }
    };
    init();
  }, []);

  // Persist tasks and last active date to storage whenever they change.
  useEffect(() => {
    if (!isInitialised) return;
    AsyncStorage.setItem('@tasks', JSON.stringify(tasks)).catch(err => {
      console.error('Error saving tasks to storage', err);
    });
  }, [tasks, isInitialised]);

  useEffect(() => {
    if (!isInitialised) return;
    if (lastActiveDate) {
      AsyncStorage.setItem('@lastActiveDate', lastActiveDate).catch(err => {
        console.error('Error saving last active date', err);
      });
    }
  }, [lastActiveDate, isInitialised]);

  /**
   * Adds a new task to the task list.
   */
  const addTask = (name, type, timing) => {
    const newTask = {
      id: uuidv4(),
      name: name.trim(),
      type,
      timing,
      completed: false,
      todaySelected: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    newTask.weight = computeWeight(newTask);
    setTasks(prev => [newTask, ...prev]);
  };

  /**
   * Updates an existing task based on its id. Also recomputes its weight.
   */
  const updateTask = (id, updates) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates, updatedAt: Date.now() };
        updated.weight = computeWeight(updated);
        return updated;
      })
    );
  };

  /**
   * Removes a task from the list by id.
   */
  const removeTask = id => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Marks a task as completed/incomplete.
   */
  const toggleCompleted = id => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          return { ...t, completed: !t.completed, todaySelected: t.completed ? t.todaySelected : false, updatedAt: Date.now() };
        }
        return t;
      })
    );
  };

  /**
   * Sets whether a task should appear on the Today dashboard.
   */
  const setTodaySelected = (id, selected) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, todaySelected: selected, updatedAt: Date.now() } : t))
    );
  };

  /**
   * Clears the Today selected flag on all tasks. Typically used when starting a new day or prior to re-prioritising.
   */
  const clearTodaySelections = () => {
    setTasks(prev => prev.map(t => ({ ...t, todaySelected: false })));
  };

  /**
   * Checks if the current date is different from the last active date stored. Returns true if it's a new day.
   */
  const isNewDay = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return lastActiveDate !== todayStr;
  };

  /**
   * Updates the last active date to today.
   */
  const updateLastActiveDate = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setLastActiveDate(todayStr);
  };

  /**
   * Returns a sorted list of tasks to present in the elimination process. Excludes completed tasks.
   * It computes unique weight values, sorted descending, and returns up to 10 tasks.
   */
  const getEliminationCandidates = () => {
    // Exclude completed tasks
    const pending = tasks.filter(t => !t.completed);
    // Sort by weight desc, then name asc
    const sorted = pending.sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.name.localeCompare(b.name);
    });
    // Determine top 5 unique weight values
    const uniqueWeights = Array.from(new Set(sorted.map(t => t.weight))).sort((a, b) => b - a).slice(0, 5);
    // Filter tasks whose weight is in top unique weights
    const filtered = sorted.filter(t => uniqueWeights.includes(t.weight));
    return filtered.slice(0, 10);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        removeTask,
        toggleCompleted,
        setTodaySelected,
        clearTodaySelections,
        isNewDay,
        updateLastActiveDate,
        getEliminationCandidates
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};