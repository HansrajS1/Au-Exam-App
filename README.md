# AU Exam App

A full-stack mobile application for uploading and managing academic papers, built for Alliance University. Users can submit papers, preview uploads, and manage content by subject, topic, and grade/branch.
---
App download Link : [Au-Exam-App](https://auexamapp.netlify.app/) 

##  Features

-  Upload academic papers (PDF)
-  Upload preview images
-  Select university, subject, topic, and grade/branch
-  Authentication via Appwrite
-  Context-based routing with Expo Router
-  Native APK build with full offline support
-  Real-device testing and crash-free deployment

---

##  Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | React Native + Expo Router     |
| Backend     | [Spring Boot (REST API)](https://github.com/HansrajS1/Au-Exam-App-backend)      |
| Auth        | Appwrite                       |
| Styling     | NativeWind + Tailwind CSS      |
| Build Tools | EAS Build / Android Studio / CLI |
| Debugging   | ADB + Hermes + Logcat          |

---

##  Installation

```bash
git clone https://github.com/HansrajS1/Au-Exam-App
cd Au-Exam-App
npm install
```

---

##  Development

```bash
npx expo start
```

To test with native modules:

```bash
eas build --profile development
npx expo start --dev-client
```

---

##  Building APK Locally

### Option 1: Android Studio

1. Run `npx expo prebuild`
2. Open `android/` folder in Android Studio
3. Go to **Build > Build APK(s)**
4. Find APK at `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: CLI

```bash
npx expo prebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

Install on device:

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

---

##  Environment Variables

Create a `.env` file:

```env
APPWRITE_ENDPOINT=https://cloud.example.io/v1
APPWRITE_PROJECT_ID=your_project_id
```

Use `react-native-dotenv` to load them.

---

##  Folder Structure

```
app/
 ├── (tabs)/         # Tab navigation screens
 ├── auth/           # Login & signup screens
 ├── upload/         # Add paper screen
 ├── _layout.tsx     # Root layout with AuthProvider
lib/
 └── authcontext.tsx # Appwrite auth logic
assets/
 └── icon.png        # App icon
```

---

##  Troubleshooting

- **White placeholder text in APK**  
  → Set `placeholderTextColor="#000"` explicitly

- **Hermes crash on APK boot**  
  → Guard `segment[0]` and context access in `RouterGuard`

- **Appwrite auth warning**  
  → Ensure `AuthProvider` wraps layout in `_layout.tsx`

- **EAS build fails**  
  → Use `./gradlew assembleRelease` locally instead

- **Stretched or blurry icon**  
  → Use 1024×1024 PNG, square, no text, and define adaptive icon in `app.json`

---

##  Author

**HANS RAJ**
bengaluru, India  

---

##  License

MIT — feel free to fork, extend, and deploy.
