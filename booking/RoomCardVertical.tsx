/**
 * 房間卡片組件 - 垂直布局
 * 
 * 設計特點：
 * - 時間豎排顯示（左側）
 * - 左中右三列分別顯示 A/B/C 三間房間
 * - 實時更新預約狀態
 */

import React from "react";
import { Room } from "@/types/booking";
import { TimeSlotCard } from "@/components/TimeSlotCard";

interface RoomCardVerticalProps {
  rooms: Record<string, Room>;
  date: string;
  onBookClick?: (slotId: string, date: string) => void;
}

export function RoomCardVertical({ rooms, date, onBookClick }: RoomCardVerticalProps) {
  // 獲取所有時間槽（假設所有房間的時間槽相同）
  const roomA = rooms["A"];
  const allSlots = roomA?.slots || [];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
      {/* 標題行 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-blue-25 border-b border-border">
        <div className="flex">
          {/* 時間列標題 */}
          <div className="w-20 flex-shrink-0 border-r border-border px-3 py-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase">時間</div>
          </div>

          {/* 三個房間標題 */}
          {["A", "B", "C"].map((roomId) => {
            const room = rooms[roomId];
            const bookedCount = room?.slots.filter((s) => s.status === "booked").length || 0;
            const availableCount = room?.slots.filter((s) => s.status === "available").length || 0;

            return (
              <div key={roomId} className="flex-1 border-r border-border px-4 py-4 last:border-r-0">
                <h3 className="text-lg font-bold text-primary mb-1">會議室 {roomId}</h3>
                <p className="text-xs text-muted-foreground mb-2">{room?.description}</p>
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>{availableCount} 可用</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span>{bookedCount} 已預約</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 時間槽行 */}
      <div className="divide-y divide-border">
        {allSlots.map((slot) => (
          <div key={slot.id} className="flex">
            {/* 時間列 */}
            <div className="w-20 flex-shrink-0 border-r border-border px-3 py-3 bg-gray-50 flex items-center justify-center">
              <div className="text-xs font-semibold text-foreground">
                <div>{slot.startTime}</div>
                <div className="text-muted-foreground">-</div>
                <div>{slot.endTime}</div>
              </div>
            </div>

            {/* 三個房間的時間槽 */}
            {["A", "B", "C"].map((roomId) => {
              const room = rooms[roomId];
              const roomSlot = room?.slots.find((s) => s.id === slot.id);

              return (
                <div key={`${roomId}-${slot.id}`} className="flex-1 border-r border-border p-2 last:border-r-0">
                  {roomSlot ? (
                    <TimeSlotCard 
                      slot={roomSlot} 
                      date={date} 
                      onBookClick={onBookClick}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
