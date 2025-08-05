import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useTasks } from '../context/TasksContext';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

/**
 * The elimination screen presents tasks as swipeable cards. Users swipe right to
 * select a task for today or left to defer it. The process continues until all
 * candidate tasks have been swiped or the list ends. Upon completion the
 * selection flags are saved and the screen closes.
 */
const EliminationScreen = () => {
  const navigation = useNavigation();
  const {
    getEliminationCandidates,
    setTodaySelected,
    updateLastActiveDate
  } = useTasks();
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const translateX = useSharedValue(0);

  useEffect(() => {
    // Prepare candidate list on mount.
    const cands = getEliminationCandidates();
    setCandidates(cands);
    setCurrentIndex(0);
  }, [getEliminationCandidates]);

  // Gesture handler for swiping the card.
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: event => {
      const x = translateX.value;
      if (x > SWIPE_THRESHOLD) {
        // Swiped right: accept task
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(handleSwipe)('right');
        });
      } else if (x < -SWIPE_THRESHOLD) {
        // Swiped left: reject task
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(handleSwipe)('left');
        });
      } else {
        // Return to centre
        translateX.value = withSpring(0);
      }
    }
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = translateX.value / 20;
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` }
      ]
    };
  });

  const handleSwipe = direction => {
    if (!candidates[currentIndex]) return;
    const task = candidates[currentIndex];
    const accepted = direction === 'right';
    setTodaySelected(task.id, accepted);
    if (accepted) {
      Haptics.selectionAsync();
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    translateX.value = 0;
    // If done, update last active date and leave screen.
    if (nextIndex >= candidates.length) {
      updateLastActiveDate();
      navigation.goBack();
    }
  };

  const currentTask = candidates[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.instructions}>
        <Text style={styles.title}>Pick your top tasks</Text>
        <Text style={styles.subtitle}>Swipe right to take on today, left to defer</Text>
      </View>
      {currentTask ? (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            <Text style={styles.cardName}>{currentTask.name}</Text>
            <Text style={styles.cardDetails}>
              {currentTask.type} • {currentTask.timing} • Weight {currentTask.weight}
            </Text>
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <View style={styles.doneContainer}>
          <Text style={styles.doneText}>All done!</Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              updateLastActiveDate();
              navigation.goBack();
            }}
          >
            <Text style={styles.doneButtonText}>Return</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingTop: 60
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  cardName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  cardDetails: {
    fontSize: 14,
    color: '#8e8e93'
  },
  doneContainer: {
    alignItems: 'center'
  },
  doneText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default EliminationScreen;