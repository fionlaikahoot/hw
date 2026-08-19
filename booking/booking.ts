/**
 * 會議室預約系統 - 類型定義
 * 
 * 設計原則：
 * - TimeSlot: 30分鐘單位的預約槽位
 * - Room: 房間容器，包含所有時間槽
 * - BookingState: 全局預約狀態管理
 */

export type RoomId = "A" | "B" | "C";
export type SlotStatus = "available" | "booked" | "maintenance";

export interface TimeSlot {
  id: string;
  startTime: string; // "09:00" format
  endTime: string;   // "09:30" format
  room: RoomId | null;
  bookedBy?: string;
  status: SlotStatus;
  bookedAt?: number; // timestamp
}

export interface Room {
  id: RoomId;
  name: string;
  capacity: number;
  description?: string;
  slots: TimeSlot[];
}

export interface BookingRequest {
  timeSlotId: string;
  bookedBy: string;
  date: string; // "2026-07-15" format
}

export interface BookingResponse {
  success: boolean;
  message: string;
  assignedRoom?: RoomId;
  timeSlot?: TimeSlot;
}

export interface BookingState {
  date: string;
  rooms: Record<RoomId, Room>;
  lastUpdated: number;
}

export interface BookingContextType {
  state: BookingState;
  bookRoom: (request: BookingRequest) => BookingResponse;
  cancelBooking: (timeSlotId: string, date: string) => boolean;
  setDate: (date: string) => void;
}
