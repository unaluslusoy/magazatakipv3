package com.magazatvplayer

import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.MediaRecorder
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.IBinder
import android.util.DisplayMetrics
import android.util.Log
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import org.json.JSONObject
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.media.Image
import android.media.ImageReader
import java.io.ByteArrayOutputStream
import android.util.Base64

/**
 * Ekran Paylaşım Servisi
 * Admin panelden uzaktan izleme için ekran görüntüsü yakalar ve gönderir
 */
class ScreenShareService : Service() {

    companion object {
        private const val TAG = "ScreenShareService"
        private const val CHANNEL_ID = "screen_share_channel"
        private const val NOTIFICATION_ID = 2

        // Ekran paylaşımı durumu
        var isSharing = false
        var mediaProjection: MediaProjection? = null
        var resultCode: Int = Activity.RESULT_CANCELED
        var resultData: Intent? = null

        // Paylaşım ayarları
        private const val FRAME_INTERVAL_MS = 500L // 2 FPS - düşük bant genişliği
        private const val QUALITY = 50 // JPEG kalitesi (0-100)
        private const val SCALE_FACTOR = 0.5f // Yarı çözünürlük
    }

    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private val executor = Executors.newSingleThreadExecutor()
    private var isCapturing = false
    private var screenWidth = 0
    private var screenHeight = 0
    private var screenDensity = 0

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        // Ekran boyutlarını al
        val windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val metrics = DisplayMetrics()
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getMetrics(metrics)
        screenWidth = (metrics.widthPixels * SCALE_FACTOR).toInt()
        screenHeight = (metrics.heightPixels * SCALE_FACTOR).toInt()
        screenDensity = metrics.densityDpi
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START" -> startScreenShare()
            "STOP" -> stopScreenShare()
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Ekran Paylaşımı",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Admin panel ekran izleme servisi"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun getNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Mağaza Pano")
            .setContentText("Ekran paylaşımı aktif")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun startScreenShare() {
        if (isSharing || mediaProjection == null) {
            Log.w(TAG, "Ekran paylaşımı başlatılamadı: isSharing=$isSharing, mediaProjection=$mediaProjection")
            return
        }

        startForeground(NOTIFICATION_ID, getNotification())

        try {
            // ImageReader oluştur
            imageReader = ImageReader.newInstance(
                screenWidth,
                screenHeight,
                PixelFormat.RGBA_8888,
                2
            )

            // VirtualDisplay oluştur
            virtualDisplay = mediaProjection?.createVirtualDisplay(
                "ScreenShare",
                screenWidth,
                screenHeight,
                screenDensity,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                imageReader?.surface,
                null,
                null
            )

            isSharing = true
            isCapturing = true

            // Frame yakalama döngüsünü başlat
            startFrameCapture()

            Log.i(TAG, "Ekran paylaşımı başlatıldı: ${screenWidth}x${screenHeight}")

        } catch (e: Exception) {
            Log.e(TAG, "Ekran paylaşımı başlatma hatası", e)
            stopScreenShare()
        }
    }

    private fun startFrameCapture() {
        executor.execute {
            while (isCapturing) {
                try {
                    captureAndSendFrame()
                    Thread.sleep(FRAME_INTERVAL_MS)
                } catch (e: InterruptedException) {
                    break
                } catch (e: Exception) {
                    Log.e(TAG, "Frame yakalama hatası", e)
                }
            }
        }
    }

    private fun captureAndSendFrame() {
        val image: Image? = imageReader?.acquireLatestImage()
        if (image == null) return

        try {
            val planes = image.planes
            val buffer = planes[0].buffer
            val pixelStride = planes[0].pixelStride
            val rowStride = planes[0].rowStride
            val rowPadding = rowStride - pixelStride * screenWidth

            // Bitmap oluştur
            val bitmap = Bitmap.createBitmap(
                screenWidth + rowPadding / pixelStride,
                screenHeight,
                Bitmap.Config.ARGB_8888
            )
            bitmap.copyPixelsFromBuffer(buffer)

            // Gereksiz padding'i kırp
            val croppedBitmap = Bitmap.createBitmap(bitmap, 0, 0, screenWidth, screenHeight)
            bitmap.recycle()

            // JPEG olarak sıkıştır
            val outputStream = ByteArrayOutputStream()
            croppedBitmap.compress(Bitmap.CompressFormat.JPEG, QUALITY, outputStream)
            croppedBitmap.recycle()

            // Base64 encode
            val base64Image = Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)

            // Backend'e gönder
            sendFrameToBackend(base64Image)

        } finally {
            image.close()
        }
    }

    private fun sendFrameToBackend(base64Image: String) {
        try {
            // Cihaz bilgilerini al
            val prefs = getSharedPreferences("MagazaPano", Context.MODE_PRIVATE)
            val deviceCode = prefs.getString("device_code", "") ?: ""
            val token = prefs.getString("auth_token", "") ?: ""

            if (deviceCode.isEmpty() || token.isEmpty()) return

            val url = URL("https://mtapi.magazatakip.com.tr/api/devices/screen-frame")
            val connection = url.openConnection() as HttpURLConnection

            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer $token")
                doOutput = true
                connectTimeout = 5000
                readTimeout = 5000
            }

            val payload = JSONObject().apply {
                put("device_code", deviceCode)
                put("frame", base64Image)
                put("width", screenWidth)
                put("height", screenHeight)
                put("timestamp", System.currentTimeMillis())
            }

            DataOutputStream(connection.outputStream).use {
                it.writeBytes(payload.toString())
            }

            val responseCode = connection.responseCode
            if (responseCode != 200) {
                Log.w(TAG, "Frame gönderme hatası: $responseCode")
            }

            connection.disconnect()

        } catch (e: Exception) {
            Log.e(TAG, "Frame gönderme hatası", e)
        }
    }

    private fun stopScreenShare() {
        isCapturing = false
        isSharing = false

        virtualDisplay?.release()
        virtualDisplay = null

        imageReader?.close()
        imageReader = null

        mediaProjection?.stop()
        mediaProjection = null

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()

        Log.i(TAG, "Ekran paylaşımı durduruldu")
    }

    override fun onDestroy() {
        stopScreenShare()
        executor.shutdownNow()
        super.onDestroy()
    }
}

