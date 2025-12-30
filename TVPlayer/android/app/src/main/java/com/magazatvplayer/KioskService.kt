package com.magazatvplayer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * KioskService
 * Android 13+ arka plan kısıtları yüzünden boot sırasında direkt Activity başlatmak her cihazda çalışmayabilir.
 * Bu servis foreground olarak kalkıp uygulamayı öne getirmeyi dener.
 */
class KioskService : Service() {

  override fun onCreate() {
    super.onCreate()
    startForeground(NOTIFICATION_ID, buildNotification())
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    // Uygulamayı öne getirmeyi dene
    val launchIntent = Intent(this, MainActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      addFlags(Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
      addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }

    try {
      startActivity(launchIntent)
    } catch (_: Throwable) {
      // ignore
    }

    // Servisi burada durdurmuyoruz; screen-on için ileride genişletilebilir.
    return START_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun buildNotification(): Notification {
    val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Mağaza Pano",
        NotificationManager.IMPORTANCE_MIN
      )
      nm.createNotificationChannel(channel)
    }

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Mağaza Pano")
      .setContentText("Çalışıyor")
      .setSmallIcon(android.R.drawable.ic_media_play)
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .build()
  }

  companion object {
    private const val CHANNEL_ID = "magazapano_kiosk"
    private const val NOTIFICATION_ID = 1001
  }
}

