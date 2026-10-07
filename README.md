# TestMarks (Mobile App)

TestMarks is a school test and marks management app. Admins, teachers and students each get their own home screen: admins manage users, classes, sections and subjects; teachers create tests and enter marks; students see their results, rankings and analytics.

This repository is the **React Native (Expo) mobile app**. The backend API lives in [vishvajeet2012/serversql](https://github.com/vishvajeet2012/serversql).

## Features

- **Role-based app:** separate admin, teacher and student home screens, with sign-up, login, onboarding and forgot-password flows
- **Admin tools:** add and manage users, class and section management, assign teachers to sections, admin analytics charts
- **Teachers:** create and manage tests, enter marks for their sections
- **Students:** dashboard and analytics screen for their own test performance
- **Feedback** on tests between students and teachers
- **Push notifications** with Firebase Cloud Messaging (`@react-native-firebase/messaging`)

## Tech stack

- React Native with Expo and Expo Router (file-based routing)
- TypeScript
- Redux Toolkit with async thunks for API calls, Axios
- Firebase Cloud Messaging for notifications
- EAS for builds

## Project structure

```text
app/         Screens (Expo Router): login, admin/teacher/student home, tests, classes, sections
components/  Shared UI components
redux/       Store and slices (auth, user, manageUser, feedback)
thunk/       Async API calls grouped by feature
services/    Notification service
utils/       API base URLs
```

## Getting started

Requirements: Node.js 18+ and an Android emulator, iOS simulator or physical device. Push notifications need a development build, not Expo Go.

```bash
git clone https://github.com/vishvajeet2012/Testmarks-Native.git
cd Testmarks-Native
npm install
npx expo start          # start the dev server
npm run android         # or build and run on Android
```

Point `utils/baseUrl.ts` at your running instance of the [TestMarks API](https://github.com/vishvajeet2012/serversql).

## Author

Built by [Vishvajeet Shukla](https://www.vishvajeetshukla.in).
