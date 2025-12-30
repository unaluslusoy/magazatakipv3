# React Native / Hermes genel kurallar
# Bu dosya release build'de shrink/minify açıkken crash olmaması için temel korumaları içerir.

# React Native core
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Hermes
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# OkHttp / Okio (axios native networking)
-dontwarn okhttp3.**
-dontwarn okio.**

# Kotlin metadata
-keep class kotlin.Metadata { *; }

# React Native Video / ExoPlayer
-dontwarn com.google.android.exoplayer2.**
-keep class com.google.android.exoplayer2.** { *; }

# Vector icons
-dontwarn com.oblador.vectoricons.**
-keep class com.oblador.vectoricons.** { *; }

# Gesture handler / Screens / SafeArea
-dontwarn com.swmansion.**
-keep class com.swmansion.** { *; }
-dontwarn com.th3rdwave.**
-keep class com.th3rdwave.** { *; }

# RNFS, AsyncStorage
-dontwarn com.rnfs.**
-keep class com.rnfs.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**
-keep class com.reactnativecommunity.asyncstorage.** { *; }

