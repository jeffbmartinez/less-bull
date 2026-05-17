# less-bull

This app was vibe coded.

less-bull is a personal Expo app for tracking daily habits and Red Bull intake. It gives each day a simple point score, then shows those scores on a calendar so progress is easy to scan.

## What it tracks

- Red Bull intake: `1 Redbull or less` or `2 redbulls`
- Healthy meals
- Worked out or took a long walk
- No significant candy or heavy snacking
- Bonus exercise

Each completed item contributes points to the selected day. Daily records are stored locally on the device with AsyncStorage.

## Tech stack

- Expo SDK 54
- Expo Router
- React Native
- TypeScript
- AsyncStorage for local persistence

The app can run on iOS, Android, and web.

## Get started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

From the Expo CLI output, choose where to open the app:

- Android emulator or device
- iOS simulator or device
- Expo Go
- Web browser

You can also start a specific target directly:

```bash
npm run android
npm run ios
npm run web
```

Run linting:

```bash
npm run lint
```

## Android APK preview build

This project has an EAS `preview` build profile that creates an Android APK for internal distribution. The APK includes the app bundle, so it does not need `npx expo start` or an Expo development server running.

1. Log in to Expo:

   ```bash
   npx eas-cli@latest login
   ```

2. Create the Android APK:

   ```bash
   npx eas-cli@latest build -p android --profile preview
   ```

3. When EAS finishes, open the build URL on your Android phone and install the APK. Android may ask you to allow installs from that browser before continuing.
