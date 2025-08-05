# To Do or Not To Do

This is a simple productivity application built with **React Native** and **Expo**. The app helps you prioritise your daily tasks using a fun elimination process. It persists data locally using AsyncStorage, supports editing and deletion of tasks, and guides you through a daily flow to re‑evaluate your priorities.

## Features

* **Two‑tab layout** – a **Today** dashboard listing the tasks you have selected for the current day, and an **All Tasks** tab containing every task you’ve entered.
* **Daily elimination** – an elimination screen presents your top weighted tasks as swipeable cards. Swipe right to take on the task today or left to defer it. At most ten tasks appear each day, chosen based on the highest combined weight of *type* (Want, Need, Both) and *timing* (Today or Later).
* **Add and edit tasks** – tap the “+” button to add a new task. Each task can be edited or removed by tapping it in the master list. Fields include name, type and timing. The weight is calculated automatically.
* **Persistent storage** – tasks persist locally using `@react-native-async-storage/async-storage` so your data survives app restarts.
* **Haptic feedback & animations** – subtle tactile feedback accompanies task interactions and the elimination phase uses gesture‑driven animations powered by `react-native-reanimated` and `react-native-gesture-handler`.

## Running the app

1. Install dependencies: `npm install` (you’ll need `expo` installed globally or use `npx expo`).
2. Start the development server: `npm start` or `expo start`.
3. Press `i` to run on iOS simulator, `a` for Android or scan the QR code using the Expo Go app on your device.

### Daily Flow

When you open the app on a new day it will prompt you to:

1. **Modify your task list** – choose to add, edit or remove tasks.
2. **Re‑prioritise** – if you say yes, the elimination process runs and selects your top tasks for the day. If you say no, unfinished tasks from the previous day remain on the **Today** tab.

Use the **Day Complete** button on the **Today** tab to mark all current tasks as done once you finish them. Completed tasks remain in the master list but are excluded from future elimination rounds.

## Customising

The app uses a simple light theme by default. You can adjust colours in the various `StyleSheet` definitions under `src/screens` and `src/components`. To implement multiple colour themes, consider lifting the palette into a context and providing theme toggles.

## Directory structure

```
todo-or-not-to-do/
├── App.js                      # Root of the app; sets up navigation and context
├── package.json                # Project manifest with dependencies
├── src/
│   ├── context/
│   │   └── TasksContext.js     # Global state management and persistence
│   ├── navigation/
│   │   └── BottomTabNavigator.js
│   └── screens/
│       ├── TodayScreen.js      # Dashboard for today’s tasks
│       ├── AllTasksScreen.js   # Master list with add/edit/delete
│       └── EliminationScreen.js# Swipeable cards for prioritising
└── README.md
```

## Notes

* This application relies solely on local storage and does not communicate with external services.
* It has been tested with Expo SDK 50 and should run on both Android and iOS devices.
* To change the initial sample tasks, edit the array in `TasksContext.js` where tasks are seeded on first launch.