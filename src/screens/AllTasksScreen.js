import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useTasks } from '../context/TasksContext';
import Haptics from 'expo-haptics';

/**
 * The AllTasksScreen displays every task ever created, regardless of its current
 * status. Users can add new tasks, edit existing ones, or delete tasks. Each
 * task row shows its name, type, timing and calculated weight, along with
 * visual indicators for completion status. Editing allows changing the type
 * and timing, and adding allows specifying all fields.
 */
const AllTasksScreen = () => {
  const {
    tasks,
    addTask,
    updateTask,
    removeTask,
    toggleCompleted
  } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState('Want');
  const [timingInput, setTimingInput] = useState('Today');

  const openAddModal = () => {
    setEditingTask(null);
    setNameInput('');
    setTypeInput('Want');
    setTimingInput('Today');
    setModalVisible(true);
  };

  const openEditModal = task => {
    setEditingTask(task);
    setNameInput(task.name);
    setTypeInput(task.type);
    setTimingInput(task.timing);
    setModalVisible(true);
  };

  const handleSave = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert('Please enter a task name.');
      return;
    }
    if (editingTask) {
      updateTask(editingTask.id, {
        name: trimmed,
        type: typeInput,
        timing: timingInput
      });
    } else {
      addTask(trimmed, typeInput, timingInput);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
  };

  const handleDelete = task => {
    Alert.alert('Delete task', `Are you sure you want to delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeTask(task.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.statusCircle, item.completed && styles.statusCompleted]}
        onPress={() => toggleCompleted(item.id)}
      >
        {item.completed && <Text style={styles.statusCheck}>✓</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.rowInfo} onPress={() => openEditModal(item)}>
        <Text style={[styles.name, item.completed && styles.completedText]}>{item.name}</Text>
        <Text style={styles.details}>
          {item.type} • {item.timing} • Weight {item.weight}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tasks yet.</Text>
          <Text style={styles.emptySubText}>Tap the + button below to add your first task.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks.sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonIcon}>＋</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'Add New Task'}</Text>
            <TextInput
              placeholder="Task name"
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.input}
            />
            <View style={styles.selectorContainer}>
              {['Want', 'Need', 'Both'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.selectorOption, typeInput === option && styles.selectorOptionSelected]}
                  onPress={() => setTypeInput(option)}
                >
                  <Text
                    style={[styles.selectorText, typeInput === option && styles.selectorTextSelected]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.selectorContainer}>
              {['Today', 'Later'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.selectorOption, timingInput === option && styles.selectorOptionSelected]}
                  onPress={() => setTimingInput(option)}
                >
                  <Text
                    style={[styles.selectorText, timingInput === option && styles.selectorTextSelected]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              {editingTask && (
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    handleDelete(editingTask);
                  }}
                  style={[styles.modalButton, styles.deleteAction]}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.modalButton, styles.saveAction]}>
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  listContent: {
    paddingBottom: 80
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE'
  },
  statusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  statusCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759'
  },
  statusCheck: {
    color: 'white',
    fontSize: 14
  },
  rowInfo: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  details: {
    fontSize: 12,
    color: '#8e8e93'
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#8e8e93'
  },
  deleteButton: {
    paddingLeft: 12
  },
  deleteText: {
    fontSize: 18
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5
  },
  addButtonIcon: {
    color: 'white',
    fontSize: 32,
    lineHeight: 32
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
    marginBottom: 8
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 12
  },
  selectorOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8
  },
  selectorOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  selectorText: {
    color: '#333'
  },
  selectorTextSelected: {
    color: 'white'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  modalButtonText: {
    fontSize: 16,
    color: '#007AFF'
  },
  deleteAction: {
    marginRight: 8
  },
  saveAction: {
    backgroundColor: '#007AFF',
    borderRadius: 6
  }
});

export default AllTasksScreen;