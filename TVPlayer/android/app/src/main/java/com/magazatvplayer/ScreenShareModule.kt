package com.magazatvplayer

import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeMap

/**
 * React Native Native Module
 * Ekran paylaşımı kontrolü için JavaScript'ten çağrılabilir
 */
class ScreenShareModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "ScreenShareModule"
    }

    override fun getName(): String = "ScreenShareModule"

    /**
     * Ekran paylaşımını başlat
     * Önce kullanıcıdan izin alınır, sonra paylaşım başlar
     */
    @ReactMethod
    fun startScreenShare(promise: Promise) {
        try {
            Log.i(TAG, "Ekran paylaşımı başlatılıyor...")

            // Cihaz bilgilerini SharedPreferences'a kaydet (servis kullanacak)
            saveDeviceInfo()

            // İzin alma activity'sini başlat
            ScreenCaptureActivity.start(reactApplicationContext)

            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Ekran paylaşımı başlatma hatası", e)
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Ekran paylaşımını durdur
     */
    @ReactMethod
    fun stopScreenShare(promise: Promise) {
        try {
            Log.i(TAG, "Ekran paylaşımı durduruluyor...")

            val intent = Intent(reactApplicationContext, ScreenShareService::class.java)
            intent.action = "STOP"
            reactApplicationContext.startService(intent)

            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Ekran paylaşımı durdurma hatası", e)
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Ekran paylaşımı durumunu kontrol et
     */
    @ReactMethod
    fun isScreenSharing(promise: Promise) {
        promise.resolve(ScreenShareService.isSharing)
    }

    /**
     * Cihaz bilgilerini al
     */
    @ReactMethod
    fun getDeviceInfo(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("MagazaPano", Context.MODE_PRIVATE)

            val result = WritableNativeMap()
            result.putString("device_code", prefs.getString("device_code", ""))
            result.putBoolean("is_sharing", ScreenShareService.isSharing)

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * StorageService'ten cihaz bilgilerini SharedPreferences'a kaydet
     * Servis bu bilgileri kullanacak
     */
    private fun saveDeviceInfo() {
        try {
            // AsyncStorage'dan okuma yapamayız, bu yüzden React Native tarafından çağrılacak
        } catch (e: Exception) {
            Log.e(TAG, "Cihaz bilgileri kaydedilemedi", e)
        }
    }

    /**
     * Cihaz bilgilerini kaydet (React Native'den çağrılır)
     */
    @ReactMethod
    fun setDeviceInfo(deviceCode: String, token: String, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("MagazaPano", Context.MODE_PRIVATE)
            prefs.edit()
                .putString("device_code", deviceCode)
                .putString("auth_token", token)
                .apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}

