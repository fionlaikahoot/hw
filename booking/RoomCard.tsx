/**
 * 房間卡片組件
 * 
 * 設計特點：
 * - 顯示房間名稱、容納人數、描述
 * - 網格顯示所有時間槽
 * - 實時更新預約狀態
 */

import React from "react";
import { Room } from "@/types/booking";
import { TimeSlotCard } from "@/components/TimeSlotCard";

interface RoomCardProps {
  room: Room;
  date: string;
  onBookClick?: (slotId: string, date: string) => void;
}

export function RoomCard({ room, date, onBookClick }: RoomCardProps) {
  // 計算已預約槽位數
  const bookedCount = room.slots.filter((s) => s.status === "booked").length;
  const availableCount = room.slots.filter((s) => s.status === "available").length;

  return (
    <div className="room-card overflow-hidden">
      {/* 房間標題區 */}
      <div className="border-b border-border bg-gradient-to-r from-blue-50 to-blue-25 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="room-title text-primary" style={{ fontFamily: "Poppins" }}>
              {room.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{room.capacity}</div>
            <div className="text-xs text-muted-foreground">容納人數</div>
          </div>
        </div>

        {/* 狀態統計 */}
        <div className="mt-3 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success"></div>
            <span>{availableCount} 個可用</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-warning"></div>
            <span>{bookedCount} 個已預約</span>
          </div>
        </div>
      </div>

      {/* 時間槽網格 */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {room.slots.map((slot, index) => (
            <div
              key={slot.id}
              style={{
                animationDelay: `${index * 30}ms`,
              }}
              className="slot-enter"
            >
              <TimeSlotCard slot={slot} date={date} onBookClick={onBookClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
