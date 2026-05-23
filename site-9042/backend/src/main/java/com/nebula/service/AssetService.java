package com.nebula.service;

import com.nebula.model.Asset;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AssetService {

    private Map<String, Asset> userAssets = new HashMap<>();

    public AssetService() {
        // Initial test balance
        userAssets.put("KRW", new Asset("KRW", 1000000, 1.0));
        userAssets.put("BTC", new Asset("BTC", 0, 0.0));
    }

    public Asset getAsset(String symbol) {
        return userAssets.getOrDefault(symbol, new Asset(symbol, 0, 0.0));
    }

    public long getBalance() {
        return userAssets.get("KRW").getBalance();
    }

    // [Index 330] Race Condition Defect
    // Intentionally missing synchronized keyword and adding a small delay to allow race conditions
    public boolean deductBalance(long amount) {
        long currentBalance = getBalance();
        
        if (currentBalance >= amount) {
            // Simulate processing delay to easily trigger race condition upon rapid clicks
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // Defect: Overwriting balance after delay without checking if it changed
            Asset krw = userAssets.get("KRW");
            krw.setBalance(krw.getBalance() - amount);
            return true;
        }
        return false;
    }

    public void addAsset(String symbol, double quantity) {
        Asset asset = getAsset(symbol);
        asset.setQuantity(asset.getQuantity() + quantity);
        userAssets.put(symbol, asset);
    }
}
