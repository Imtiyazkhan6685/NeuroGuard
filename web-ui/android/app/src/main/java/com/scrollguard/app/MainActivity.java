package com.scrollguard.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ScrollGuardPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
