/**
 * 時間槽卡片組件
 * 
 * 設計特點：
 * - 顯示時間段、預約者、房間分配
 * - 根據狀態改變顏色（可用/已預約/維護中）
 * - 點擊可預約，懸停有視覺反饋
 * - 預約後顯示撤銷按鈕
 */

import React, { useState, useEffect } from "react";
import { TimeSlot } from "@/types/booking";
import { useBooking } from "@/contexts/BookingContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface TimeSlotCardProps {
  slot: TimeSlot;
  date: string;
  onBookClick?: (slotId: string, date: string) => void;
}

export function TimeSlotCard({ slot, date, onBookClick }: TimeSlotCardProps) {
  const { bookRoom, cancelBooking } = useBooking();
  const [bookerName, setBookerName] = useState("");
  const [showCancelCountdown, setShowCancelCountdown] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(5);
  const [isBooking, setIsBooking] = useState(false);

  // 預約後顯示取消倒計時
  useEffect(() => {
    if (slot.status === "booked" && slot.bookedAt) {
      const timeSinceBooked = Date.now() - slot.bookedAt;
      if (timeSinceBooked < 5000) {
        setShowCancelCountdown(true);
        const remaining = Math.ceil((5000 - timeSinceBooked) / 1000);
        setCancelCountdown(remaining);

        const timer = setInterval(() => {
          setCancelCountdown((prev) => {
            if (prev <= 1) {
              setShowCancelCountdown(false);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [slot.status, slot.bookedAt]);

  const handleBook = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (slot.status !== "available") return;

    // 先觸發申請表對話框，並傳遞時間槽 ID 和日期
    if (onBookClick) {
      onBookClick(slot.id, date);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = cancelBooking(slot.id, date);
    if (success) {
      toast.success("✓ 已取消預約");
    }
  };

  const statusStyles = {
    available: "border-success/30 bg-success/5 hover:bg-success/10 hover:border-success/50",
    booked: "border-warning/30 bg-warning/5 cursor-not-allowed",
    maintenance: "border-muted/50 bg-muted/20 cursor-not-allowed",
  };

  const isClickable = slot.status === "available";

  return (
    <div
      className={`relative rounded-lg border p-3 transition-all duration-100 ease-out ${statusStyles[slot.status]} ${
        isClickable ? "cursor-pointer hover:shadow-md" : ""
      }`}
      onClick={isClickable ? handleBook : undefined}
    >
      {/* 時間 */}
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {slot.startTime}
      </div>

      {/* 預約者信息 */}
      {slot.status === "booked" && slot.bookedBy && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{slot.bookedBy}</div>
            {slot.room && (
              <div className="text-xs text-muted-foreground">房間 {slot.room}</div>
            )}
          </div>
          {showCancelCountdown && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6 p-0 flex-shrink-0"
              title={`點擊撤銷（${cancelCountdown}秒內）`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* 可用時顯示預約按鈕 */}
      {slot.status === "available" && (
        <div className="mt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={handleBook}
          >
            預約
          </Button>
        </div>
      )}

      {/* 維護中標籤 */}
      {slot.status === "maintenance" && (
        <div className="mt-2 text-xs font-medium text-muted-foreground">維護中</div>
      )}
    </div>
  );
}
