/**
 * 會議室預約系統 - 業務邏輯
 * 
 * 核心功能：
 * 1. 初始化房間與時間槽
 * 2. 自動分配房間（A -> B -> C）
 * 3. 預約與取消邏輯
 * 4. 狀態持久化
 */

import { Room, RoomId, TimeSlot, BookingRequest, BookingResponse, BookingState } from "@/types/booking";

const WORK_HOURS_START = 9; // 09:00
const WORK_HOURS_END = 18;  // 18:00
const SLOT_DURATION = 30;   // minutes

/**
 * 生成時間槽列表（30分鐘一節）
 */
export function generateTimeSlots(date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = WORK_HOURS_START; hour < WORK_HOURS_END; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
      const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const endMinute = minute + SLOT_DURATION;
      const endHour = hour + Math.floor(endMinute / 60);
      const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute % 60).padStart(2, "0")}`;
      
      slots.push({
        id: `${date}-${startTime}`,
        startTime,
        endTime,
        room: null,
        status: "available",
      });
    }
  }
  
  return slots;
}

/**
 * 初始化房間數據
 */
export function initializeRooms(date: string): Record<RoomId, Room> {
  const slots = generateTimeSlots(date);
  
  return {
    A: {
      id: "A",
      name: "會議室 A",
      capacity: 6,
      description: "適合小型團隊會議",
      slots: [...slots],
    },
    B: {
      id: "B",
      name: "會議室 B",
      capacity: 10,
      description: "適合中型團隊會議",
      slots: [...slots],
    },
    C: {
      id: "C",
      name: "會議室 C",
      capacity: 15,
      description: "適合大型團隊會議",
      slots: [...slots],
    },
  };
}

/**
 * 自動分配房間邏輯：A -> B -> C
 */
export function findAvailableRoom(
  rooms: Record<RoomId, Room>,
  timeSlotId: string
): RoomId | null {
  const roomOrder: RoomId[] = ["A", "B", "C"];
  
  for (const roomId of roomOrder) {
    const room = rooms[roomId];
    const slot = room.slots.find((s) => s.id === timeSlotId);
    
    if (slot && slot.status === "available") {
      return roomId;
    }
  }
  
  return null; // 無可用房間
}

/**
 * 預約房間
 */
export function bookRoom(
  rooms: Record<RoomId, Room>,
  request: BookingRequest
): BookingResponse {
  const availableRoom = findAvailableRoom(rooms, request.timeSlotId);
  
  if (!availableRoom) {
    return {
      success: false,
      message: "抱歉，所有房間在此時間已被預約。",
    };
  }
  
  const room = rooms[availableRoom];
  const slot = room.slots.find((s) => s.id === request.timeSlotId);
  
  if (!slot) {
    return {
      success: false,
      message: "時間槽不存在。",
    };
  }
  
  if (slot.status !== "available") {
    return {
      success: false,
      message: "此時間槽已被預約或維護中。",
    };
  }
  
  // 更新槽位狀態
  slot.status = "booked";
  slot.room = availableRoom;
  slot.bookedBy = request.bookedBy;
  slot.bookedAt = Date.now();
  
  return {
    success: true,
    message: `預約成功！已分配 ${availableRoom} 房。`,
    assignedRoom: availableRoom,
    timeSlot: slot,
  };
}

/**
 * 取消預約
 */
export function cancelBooking(
  rooms: Record<RoomId, Room>,
  timeSlotId: string
): boolean {
  for (const roomId of Object.keys(rooms) as RoomId[]) {
    const room = rooms[roomId];
    const slot = room.slots.find((s) => s.id === timeSlotId);
    
    if (slot && slot.status === "booked") {
      slot.status = "available";
      slot.room = null;
      slot.bookedBy = undefined;
      slot.bookedAt = undefined;
      return true;
    }
  }
  
  return false;
}

/**
 * 本地存儲鍵
 */
const STORAGE_KEY = "meeting_room_bookings";

/**
 * 保存預約狀態到 localStorage
 */
export function saveBookingState(state: BookingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save booking state:", error);
  }
}

/**
 * 從 localStorage 加載預約狀態
 */
export function loadBookingState(date: string): BookingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as BookingState;
      // 如果日期不同，重新初始化
      if (state.date !== date) {
        return {
          date,
          rooms: initializeRooms(date),
          lastUpdated: Date.now(),
        };
      }
      return state;
    }
  } catch (error) {
    console.error("Failed to load booking state:", error);
  }
  
  return {
    date,
    rooms: initializeRooms(date),
    lastUpdated: Date.now(),
  };
}

/**
 * 格式化日期為 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * 獲取今天的日期
 */
export function getTodayDate(): string {
  return formatDate(new Date());
}
