/**
 * 會議室預約系統 - React Context
 * 
 * 管理全局預約狀態，提供預約/取消功能
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  BookingContextType,
  BookingState,
  BookingRequest,
  BookingResponse,
} from "@/types/booking";
import {
  bookRoom,
  cancelBooking,
  loadBookingState,
  saveBookingState,
  getTodayDate,
} from "@/lib/bookingLogic";

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(() => {
    return loadBookingState(getTodayDate());
  });

  // 當日期改變時，重新加載狀態
  useEffect(() => {
    setState(loadBookingState(state.date));
  }, [state.date]);

  // 當狀態改變時，保存到 localStorage
  useEffect(() => {
    saveBookingState(state);
  }, [state]);

  const handleBookRoom = useCallback(
    (request: BookingRequest): BookingResponse => {
      const newRooms = JSON.parse(JSON.stringify(state.rooms)); // Deep copy
      const response = bookRoom(newRooms, request);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          rooms: newRooms,
          lastUpdated: Date.now(),
        }));
      }

      return response;
    },
    [state.rooms]
  );

  const handleCancelBooking = useCallback(
    (timeSlotId: string, date: string): boolean => {
      if (date !== state.date) {
        return false;
      }

      const newRooms = JSON.parse(JSON.stringify(state.rooms)); // Deep copy
      const success = cancelBooking(newRooms, timeSlotId);

      if (success) {
        setState((prev) => ({
          ...prev,
          rooms: newRooms,
          lastUpdated: Date.now(),
        }));
      }

      return success;
    },
    [state]
  );

  const handleSetDate = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      date,
    }));
  }, []);

  const value: BookingContextType = {
    state,
    bookRoom: handleBookRoom,
    cancelBooking: handleCancelBooking,
    setDate: handleSetDate,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking(): BookingContextType {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
