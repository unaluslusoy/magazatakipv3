package com.magazatvplayer

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import android.util.Log

/**
 * Ekran paylaşımı izni alma Activity'si
 * MediaProjection izni için kullanıcı onayı gerekir
 */
class ScreenCaptureActivity : Activity() {

    companion object {
        private const val TAG = "ScreenCaptureActivity"
        private const val REQUEST_CODE = 1000

        fun start(context: Context) {
            val intent = Intent(context, ScreenCaptureActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Log.i(TAG, "Ekran paylaşımı izni isteniyor...")

        val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        startActivityForResult(projectionManager.createScreenCaptureIntent(), REQUEST_CODE)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_CODE) {
            if (resultCode == RESULT_OK && data != null) {
                Log.i(TAG, "Ekran paylaşımı izni verildi")

                // MediaProjection'ı kaydet
                val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
                ScreenShareService.mediaProjection = projectionManager.getMediaProjection(resultCode, data)
                ScreenShareService.resultCode = resultCode
                ScreenShareService.resultData = data

                // Servisi başlat
                val serviceIntent = Intent(this, ScreenShareService::class.java)
                serviceIntent.action = "START"
                startForegroundService(serviceIntent)

            } else {
                Log.w(TAG, "Ekran paylaşımı izni reddedildi")
            }
        }

        finish()
    }
}
