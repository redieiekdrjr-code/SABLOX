package com.sablox.game;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private WebView web;
    private TextView error;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        FrameLayout root = new FrameLayout(this);
        web = new WebView(this);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                error.setVisibility(View.GONE);
                web.setVisibility(View.VISIBLE);
            }
            @Override public void onReceivedError(WebView view, android.webkit.WebResourceRequest request,
                                                   android.webkit.WebResourceError err) {
                if (request.isForMainFrame()) {
                    web.setVisibility(View.GONE);
                    error.setVisibility(View.VISIBLE);
                }
            }
        });
        error = new TextView(this);
        error.setText("SABLOX\nНет соединения с сервером. Проверь интернет и перезапусти игру.");
        error.setTextSize(18);
        error.setTextColor(0xffffffff);
        error.setGravity(android.view.Gravity.CENTER);
        error.setBackgroundColor(0xff101827);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        root.addView(error, new FrameLayout.LayoutParams(-1, -1));
        error.setVisibility(View.GONE);
        setContentView(root);
        web.loadUrl(BuildConfig.SERVER_URL + "/arena.html");
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
