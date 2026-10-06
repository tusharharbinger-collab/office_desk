package com.harbinger.office_desk.user

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.webkit.WebSettings
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.harbinger.office_desk.user.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val PREFS_NAME = "SmartDeskUserPrefs"
    private val KEY_SERVER_URL = "server_url"
    private val DEFAULT_URL = "http://10.0.2.2:5173" // Default target URL for Android Emulator to host

    private var currentTargetUrl: String = DEFAULT_URL

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadSavedServerUrl()
        setupWebView()
        setupUI()
        loadPortal()
    }

    private fun loadSavedServerUrl() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        currentTargetUrl = prefs.getString(KEY_SERVER_URL, DEFAULT_URL) ?: DEFAULT_URL
    }

    private fun saveServerUrl(url: String) {
        var cleanUrl = url.trim()
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "http://$cleanUrl"
        }
        currentTargetUrl = cleanUrl
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_SERVER_URL, cleanUrl).apply()
        loadPortal()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webSettings: WebSettings = binding.webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.allowFileAccess = true
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        
        // Custom User-Agent tag to identify Android User App
        val defaultUserAgent = webSettings.userAgentString
        webSettings.userAgentString = "$defaultUserAgent SmartDeskAndroidUserApp/1.0 (Role: Employee)"

        // Add JavaScript Interface
        binding.webView.addJavascriptInterface(WebAppInterface(this), "AndroidUserApp")

        // Set WebViewClient
        binding.webView.webViewClient = UserWebViewClient(
            onPageStartedCallback = {
                binding.pageProgress.visibility = View.VISIBLE
                binding.layoutOffline.visibility = View.GONE
            },
            onPageFinishedCallback = {
                binding.pageProgress.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
                updateStatusIndicator(isOnline = true)
            },
            onErrorCallback = { description ->
                binding.pageProgress.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
                showOfflineView()
            }
        )

        // Set WebChromeClient
        binding.webView.webChromeClient = UserWebChromeClient { progress ->
            binding.pageProgress.progress = progress
            if (progress >= 100) {
                binding.pageProgress.visibility = View.GONE
            }
        }
    }

    private fun setupUI() {
        // Swipe Refresh
        binding.swipeRefresh.setColorSchemeResources(R.color.accent)
        binding.swipeRefresh.setOnRefreshListener {
            if (NetworkUtils.isNetworkAvailable(this)) {
                binding.webView.reload()
            } else {
                binding.swipeRefresh.isRefreshing = false
                showOfflineView()
            }
        }

        // Toolbar Action - Settings Dialog
        binding.btnSettings.setOnClickListener {
            showServerUrlDialog()
        }

        // Navigation Buttons
        binding.btnNavBack.setOnClickListener {
            if (binding.webView.canGoBack()) {
                binding.webView.goBack()
            } else {
                Toast.makeText(this, "At beginning of portal navigation", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnNavHome.setOnClickListener {
            loadPortal()
        }

        binding.btnNavRefresh.setOnClickListener {
            binding.webView.reload()
        }

        binding.btnNavForward.setOnClickListener {
            if (binding.webView.canGoForward()) {
                binding.webView.goForward()
            } else {
                Toast.makeText(this, "No forward pages in navigation", Toast.LENGTH_SHORT).show()
            }
        }

        // Offline View Buttons
        binding.btnRetryConnection.setOnClickListener {
            loadPortal()
        }

        binding.btnOfflineSettings.setOnClickListener {
            showServerUrlDialog()
        }
    }

    private fun loadPortal() {
        if (!NetworkUtils.isNetworkAvailable(this)) {
            showOfflineView()
            return
        }
        binding.layoutOffline.visibility = View.GONE
        binding.webView.visibility = View.VISIBLE
        binding.webView.loadUrl(currentTargetUrl)
    }

    private fun showOfflineView() {
        updateStatusIndicator(isOnline = false)
        binding.webView.visibility = View.GONE
        binding.layoutOffline.visibility = View.VISIBLE
    }

    private fun updateStatusIndicator(isOnline: Boolean) {
        if (isOnline) {
            binding.statusIndicator.backgroundTintList =
                getColorStateList(R.color.status_online)
        } else {
            binding.statusIndicator.backgroundTintList =
                getColorStateList(R.color.status_offline)
        }
    }

    private fun showServerUrlDialog() {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_url_config, null)
        val etUrl = dialogView.findViewById<EditText>(R.id.et_server_url)
        etUrl.setText(currentTargetUrl)

        AlertDialog.Builder(this)
            .setView(dialogView)
            .setPositiveButton(R.string.btn_save) { dialog, _ ->
                val newUrl = etUrl.text.toString()
                if (newUrl.isNotBlank()) {
                    saveServerUrl(newUrl)
                    Toast.makeText(this, "Server URL updated to $currentTargetUrl", Toast.LENGTH_SHORT).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton(R.string.btn_cancel) { dialog, _ ->
                dialog.dismiss()
            }
            .create()
            .show()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }
}
