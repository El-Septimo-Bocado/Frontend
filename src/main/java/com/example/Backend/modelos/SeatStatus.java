package com.example.Backend.modelos;

public class SeatStatus {
    private String showtimeId;
    private String seatCode;// "A1"
    private String status;// FREE | HELD | SOLD
    private String holdId;// si HELD
    private long holdExpiresAt;// epoch ms

    public String getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(String showtimeId) {
        this.showtimeId = showtimeId;
    }

    public String getSeatCode() {
        return seatCode;
    }

    public void setSeatCode(String seatCode) {
        this.seatCode = seatCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHoldId() {
        return holdId;
    }

    public void setHoldId(String holdId) {
        this.holdId = holdId;
    }

    public long getHoldExpiresAt() {
        return holdExpiresAt;
    }

    public void setHoldExpiresAt(long holdExpiresAt) {
        this.holdExpiresAt = holdExpiresAt;
    }
}
