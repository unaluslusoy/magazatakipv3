package com.magazatvplayer

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader

// Native packages (manuel, settings.gradle ile uyumlu)
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage
import com.rnfs.RNFSPackage
import com.swmansion.gesturehandler.RNGestureHandlerPackage
import com.swmansion.rnscreens.RNScreensPackage
import com.th3rdwave.safeareacontext.SafeAreaContextPackage
import com.brentvatne.react.ReactVideoPackage
import org.wonday.orientation.OrientationPackage
import com.oblador.vectoricons.VectorIconsPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): MutableList<ReactPackage> {
          return mutableListOf(
              // RN core components (Text, View, ProgressBar, etc.)
              MainReactPackage(),
              // 3rd party native modules
              AsyncStoragePackage(),
              RNFSPackage(),
              RNGestureHandlerPackage(),
              RNScreensPackage(),
              SafeAreaContextPackage(),
              ReactVideoPackage(),
              OrientationPackage(),
              VectorIconsPackage(),
              // Custom modules
              ScreenSharePackage(),
          )
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
