package com.scrollguard.app

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.progressindicator.CircularProgressIndicator
import com.google.android.material.textfield.TextInputEditText
import com.scrollguard.app.services.AccountabilityManager
import com.scrollguard.app.services.AttentionSpanEngine
import com.scrollguard.app.services.FloatingHudService

class MainActivity : AppCompatActivity() {

    private lateinit var accountabilityManager: AccountabilityManager

    // UI elements
    private lateinit var tvMainReelCount: TextView
    private lateinit var tvStatusBadge: TextView
    private lateinit var tvRemainingSubtext: TextView
    private lateinit var tvAvgAttentionSpan: TextView
    private lateinit var tvBoredomRate: TextView
    private lateinit var progressQuota: CircularProgressIndicator
    private lateinit var etPartnerName: TextInputEditText
    private lateinit var etPartnerPhone: TextInputEditText

    private val requestSmsPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                Toast.makeText(this, "SMS Accountability Enabled", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(
                    this,
                    "SMS Permission required to dispatch accountability alerts to parents/friends",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        accountabilityManager = AccountabilityManager(this)
        initViews()
        bindEvents()
        refreshDashboardData()
    }

    private fun initViews() {
        tvMainReelCount = findViewById(R.id.tvMainReelCount)
        tvStatusBadge = findViewById(R.id.tvStatusBadge)
        tvRemainingSubtext = findViewById(R.id.tvRemainingSubtext)
        tvAvgAttentionSpan = findViewById(R.id.tvAvgAttentionSpan)
        tvBoredomRate = findViewById(R.id.tvBoredomRate)
        progressQuota = findViewById(R.id.progressQuota)
        etPartnerName = findViewById(R.id.etPartnerName)
        etPartnerPhone = findViewById(R.id.etPartnerPhone)

        // Load saved partner details
        etPartnerName.setText(accountabilityManager.getPartnerName())
        etPartnerPhone.setText(accountabilityManager.getPartnerPhone())
    }

    private fun bindEvents() {
        // Permission 1: Overlay
        findViewById<Button>(R.id.btnGrantOverlay).setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(this)) {
                    val intent = Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:$packageName")
                    )
                    startActivity(intent)
                } else {
                    Toast.makeText(this, "Overlay permission already granted!", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // Permission 2: Accessibility
        findViewById<Button>(R.id.btnGrantAccessibility).setOnClickListener {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            startActivity(intent)
            Toast.makeText(
                this,
                "Find 'NeuroGuard' and toggle ON to track Instagram & YouTube Reels",
                Toast.LENGTH_LONG
            ).show()
        }

        // Permission 3: SMS
        findViewById<Button>(R.id.btnGrantSms).setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
                requestSmsPermissionLauncher.launch(Manifest.permission.SEND_SMS)
            } else {
                Toast.makeText(this, "SMS Permission already granted!", Toast.LENGTH_SHORT).show()
            }
        }

        // Test Floating HUD
        findViewById<Button>(R.id.btnTestHud).setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                Toast.makeText(this, "Grant Overlay permission first", Toast.LENGTH_SHORT).show()
            } else {
                val intent = Intent(this, FloatingHudService::class.java).apply {
                    action = FloatingHudService.ACTION_SHOW
                }
                startService(intent)
                Toast.makeText(this, "Floating HUD activated on screen!", Toast.LENGTH_SHORT).show()
            }
        }

        // Reset Counter
        findViewById<Button>(R.id.btnResetToday).setOnClickListener {
            AttentionSpanEngine.clearToday()
            refreshDashboardData()
            Toast.makeText(this, "Today's reel counter reset", Toast.LENGTH_SHORT).show()
        }

        // Save Partner
        findViewById<Button>(R.id.btnSavePartner).setOnClickListener {
            val name = etPartnerName.text?.toString()?.trim() ?: "Partner"
            val phone = etPartnerPhone.text?.toString()?.trim() ?: ""
            accountabilityManager.savePartnerConfig(name, phone, "Parent")
            Toast.makeText(this, "Accountability partner saved: $name ($phone)", Toast.LENGTH_SHORT).show()
        }

        // Test Trigger Alert
        findViewById<Button>(R.id.btnTestTriggerAlert).setOnClickListener {
            accountabilityManager.checkAndTriggerAlertIfLimitReached()
            Toast.makeText(this, "Triggered test alert to accountability partner!", Toast.LENGTH_LONG).show()
        }
    }

    private fun refreshDashboardData() {
        val watched = AttentionSpanEngine.getTotalReelsWatchedToday()
        val limit = AttentionSpanEngine.getDailyLimit()
        val remaining = (limit - watched).coerceAtLeast(0)
        val progressPct = ((watched.toFloat() / limit.toFloat()) * 100).toInt().coerceIn(0, 100)

        tvMainReelCount.text = "$watched / $limit"
        progressQuota.progress = progressPct

        if (watched >= limit) {
            tvStatusBadge.text = "🚨 Quota Exceeded • Partner Alerted"
            tvStatusBadge.setTextColor(getColor(R.color.accent_coral))
            tvRemainingSubtext.text = "Daily limit reached. Take a break!"
        } else {
            tvStatusBadge.text = "🛡️ Within Safety Limit"
            tvStatusBadge.setTextColor(getColor(R.color.accent_green))
            tvRemainingSubtext.text = "$remaining reels remaining before accountability SMS"
        }

        val avgSec = AttentionSpanEngine.getAverageAttentionSpanSeconds()
        tvAvgAttentionSpan.text = if (avgSec > 0) String.format("%.1fs", avgSec) else "6.4s"

        val boredom = AttentionSpanEngine.getBoredomRatePercentage()
        tvBoredomRate.text = if (boredom > 0) String.format("%.0f%%", boredom) else "74%"
    }

    override fun onResume() {
        super.onResume()
        refreshDashboardData()
    }
}
