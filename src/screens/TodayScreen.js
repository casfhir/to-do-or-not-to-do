import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../context/TasksContext';
import Haptics from 'expo-haptics';

/**
 * This screen displays tasks that have been selected for the current day. It also
 * checks whether it's a new day and, if so, prompts the user to review their
 * tasks and possibly re-prioritise. Users can mark tasks as complete and
 * complete the day once all tasks are finished.
 */
const TodayScreen = () => {
  const navigation = useNavigation();
  const {
    tasks,
    toggleCompleted,
    isNewDay,
    updateLastActiveDate,
    clearTodaySelections
  } = useTasks();

  const [didPrompt, setDidPrompt] = useState(false);

  // Derive today's tasks sorted by weight desc and then name asc.
  const todayTasks = tasks
    .filter(t => t.todaySelected && !t.completed)
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.name.localeCompare(b.name);
    });

  const handleDayComplete = () => {
    // Mark all selected tasks as completed.
    todayTasks.forEach(task => toggleCompleted(task.id));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Great job!', 'You have completed your tasks for today.');
  };

  const promptForDaySetup = useCallback(() => {
    if (!isNewDay()) return;
    // Show first alert asking to modify tasks.
    Alert.alert(
      'New day, new focus',
      'Add or modify any tasks?',
      [
        {
          text: 'Yes',
          onPress: () => {
            // Navigate to All Tasks tab so user can edit.
            navigation.navigate('All Tasks');
          }
        },
        {
          text: 'No',
          onPress: () => {
            // Continue to next step.
            promptForReprioritise();
          }
        }
      ],
      { cancelable: false }
    );
  }, [isNewDay, navigation]);

  const promptForReprioritise = () => {
    Alert.alert(
      'Daily focus',
      'Re‑prioritise today\'s focus?',
      [
        {
          text: 'Yes',
          onPress: () => {
            // Clear previous selections and navigate to elimination modal.
            clearTodaySelections();
            navigation.navigate('Elimination');
          }
        },
        {
          text: 'No',
          onPress: () => {
            // Retain yesterday's unfinished tasks and mark today as handled.
            updateLastActiveDate();
          }
        }
      ],
      { cancelable: false }
    );
  };

  // Prompt for new day setup once per focus.
  useFocusEffect(
    useCallback(() => {
      if (isNewDay() && !didPrompt) {
        setDidPrompt(true);
        promptForDaySetup();
      }
      // Reset prompt flag when leaving screen so it triggers next time if needed.
      return () => setDidPrompt(false);
    }, [didPrompt, isNewDay, promptForDaySetup])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskRow}
      onPress={() => {
        toggleCompleted(item.id);
        Haptics.selectionAsync();
      }}
    >
      <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {todayTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tasks selected for today.</Text>
          <Text style={styles.emptySubText}>Tap the Add button on the All Tasks tab to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      {todayTasks.length > 0 && (
        <TouchableOpacity style={styles.completeButton} onPress={handleDayComplete}>
          <Text style={styles.completeButtonText}>Day Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7'
  },
  listContent: {
    padding: 16
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  checkboxCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759'
  },
  checkmark: {
    color: 'white',
    fontSize: 16
  },
  taskText: {
    fontSize: 16,
    color: '#333'
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8e8e93'
  },
  completeButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});

export default TodayScreen;