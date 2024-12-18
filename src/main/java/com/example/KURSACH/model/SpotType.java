package com.example.KURSACH.model;

public enum SpotType {
    STANDARD("Стандарт"),
    VIP("VIP"),
    ELECTRIC("Электро"),
    DISABLED("Инвалид");

    private final String displayName;

    SpotType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}