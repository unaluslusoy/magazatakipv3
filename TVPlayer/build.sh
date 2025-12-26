#!/usr/bin/env bash

# TV Player Build Script

echo "🚀 Building Mağaza Panel TV Player..."

# Check Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"

# Clean
echo "🧹 Cleaning..."
cd android
./gradlew clean
cd ..

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Release APK
echo "🔨 Building Release APK..."
cd android
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copy to root for easy access
    cp app/build/outputs/apk/release/app-release.apk ../MagazaPanel-TV-$(date +%Y%m%d).apk
    echo "📦 APK copied to: MagazaPanel-TV-$(date +%Y%m%d).apk"
else
    echo "❌ Build failed!"
    exit 1
fi
