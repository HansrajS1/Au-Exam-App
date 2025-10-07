# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native Paper
-keep class com.facebook.yoga.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Appwrite SDK
-keep class io.appwrite.** { *; }

# Expo modules
-keep class expo.modules.** { *; }
-keep class com.swmansion.** { *; }

# NativeWind (Tailwind for RN)
-keep class com.nativewind.** { *; }

# WebView
-keep class com.reactnativecommunity.webview.** { *; }

# Prevent stripping of annotations
-keepattributes *Annotation*

# Keep native module metadata
-keepclassmembers class * {
  native <methods>;
}

# Uncomment to debug minification
# -dontobfuscate
# -printmapping build/outputs/mapping.txt
