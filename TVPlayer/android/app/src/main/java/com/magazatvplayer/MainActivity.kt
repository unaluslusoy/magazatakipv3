package com.magazatvplayer

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.content.res.Configuration
import android.widget.Toast
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  private var wakeLock: PowerManager.WakeLock? = null
  private val handler = Handler(Looper.getMainLooper())

  // Admin çıkış için tıklama sayacı
  private var tapCount = 0
  private var lastTapTime = 0L
  private val TAP_THRESHOLD = 500L // 500ms içinde tıklama
  private val REQUIRED_TAPS = 7 // 7 kez hızlı tıklama

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // FLAG_KEEP_SCREEN_ON - Ekran asla kapanmasın
    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
      WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
      WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
      WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
    )

    // Android 11+ için layout'u tam ekran yap
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.setDecorFitsSystemWindows(false)
    }

    // Tam ekran modunu uygula
    hideSystemUI()

    // Kilit ekranını devre dışı bırak (API 27+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
      val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      keyguardManager.requestDismissKeyguard(this, null)
    }

    // WakeLock ile uyku modunu engelle
    val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = powerManager.newWakeLock(
      PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
      "MagazaPano::WakeLock"
    )
    wakeLock?.acquire()

    // Sistem UI değişikliklerini dinle (Android 9-10 için)
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      setupSystemUiVisibilityListener()
    }
  }

  /**
   * Tam ekran immersive modu uygula
   * Android 11+ ve Android 9-10 için ayrı implementasyon
   */
  private fun hideSystemUI() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Android 11+ (API 30+) - WindowInsetsController kullan
      window.insetsController?.let {
        it.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
        it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      }
    } else {
      // Android 9-10 (API 28-29) - SYSTEM_UI_FLAG_IMMERSIVE_STICKY kullan
      @Suppress("DEPRECATION")
      window.decorView.systemUiVisibility = (
        View.SYSTEM_UI_FLAG_FULLSCREEN
        or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      )
    }
  }

  /**
   * Android 9-10 için sistem UI değişikliklerini dinle
   * Bazı özel ROM'lar UI'ı otomatik gösterebilir, bu durumda 1 saniye sonra tekrar gizle
   */
  @Suppress("DEPRECATION")
  private fun setupSystemUiVisibilityListener() {
    window.decorView.setOnSystemUiVisibilityChangeListener { visibility ->
      // Eğer status bar veya navigation bar görünür olduysa
      if (visibility and View.SYSTEM_UI_FLAG_FULLSCREEN == 0) {
        // 1 saniye sonra tekrar gizle
        handler.postDelayed({
          hideSystemUI()
        }, 1000)
      }
    }
  }

  /**
   * Activity resume olduğunda sistem UI'ı tekrar gizle
   * Başka bir uygulamadan dönüldüğünde UI tekrar gösterilebilir
   */
  override fun onResume() {
    super.onResume()
    hideSystemUI()
  }

  /**
   * Window focus değiştiğinde sistem UI'ı tekrar gizle
   * Kullanıcı ekrana dokunduğunda UI görünebilir
   */
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      hideSystemUI()
    }
  }

  /**
   * Geri tuşunu engelle - Kiosk modu
   * Kullanıcının yanlışlıkla uygulamadan çıkmasını engeller
   * Admin çıkışı için 7 kez hızlı tıklama gerekli
   */
  @Deprecated("Deprecated in Java")
  @Suppress("DEPRECATION")
  override fun onBackPressed() {
    val currentTime = System.currentTimeMillis()

    if (currentTime - lastTapTime < TAP_THRESHOLD) {
      tapCount++
    } else {
      tapCount = 1
    }
    lastTapTime = currentTime

    if (tapCount >= REQUIRED_TAPS) {
      // 7 kez hızlı tıklandı - Admin çıkış izni ver
      tapCount = 0
      Toast.makeText(this, "Admin modu - Çıkış izni verildi", Toast.LENGTH_SHORT).show()
      super.onBackPressed()
    } else if (tapCount >= 3) {
      // 3+ tıklamada ipucu göster
      val remaining = REQUIRED_TAPS - tapCount
      Toast.makeText(this, "Admin çıkışı için $remaining tıklama daha", Toast.LENGTH_SHORT).show()
    }
    // Aksi halde hiçbir şey yapma - uygulamadan çıkılmasını engelle
  }

  override fun onDestroy() {
    super.onDestroy()
    wakeLock?.release()
    handler.removeCallbacksAndMessages(null)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    // Configuration değiştiğinde UI'ı tekrar gizle
    hideSystemUI()

    val intent = Intent("onConfigurationChanged")
    intent.putExtra("newConfig", newConfig)
    this.sendBroadcast(intent)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "magaza-tv-player"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
