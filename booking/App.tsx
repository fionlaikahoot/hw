import React, { useEffect, useMemo, useState } from "react";

type RoomId = "A" | "B" | "C";

type Booking = {
  id: string;
  roomId: RoomId;
  slotId: string;
  date: string;
  attendeeName: string;
  department: string;
  topic: string;
  bookedAt: string;
};

type Slot = {
  id: string;
  time: string;
  booking?: Booking;
};

type RoomConfig = {
  id: RoomId;
  name: string;
  capacity: string;
  description: string;
};

const ROOM_CONFIG: RoomConfig[] = [
  { id: "A", name: "會議室 A", capacity: "6 人", description: "適合小型會議" },
  { id: "B", name: "會議室 B", capacity: "10 人", description: "適合團隊討論" },
  { id: "C", name: "會議室 C", capacity: "20 人", description: "適合大型會議" },
];

const STORAGE_KEY = "meeting-room-bookings-v1";

function getTodayDate() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

function formatDateLabel(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function buildTimeSlots() {
  const slots: Slot[] = [];
  for (let hour = 9; hour < 18; hour += 1) {
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end = `${String(hour + 1).padStart(2, "0")}:00`;
    slots.push({ id: `${start}-${end}`, time: `${start} - ${end}` });
  }
  return slots;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Booking[]) : [];
    } catch {
      return [];
    }
  });
  const [selectedSlot, setSelectedSlot] = useState<{ roomId: RoomId; slotId: string } | null>(null);
  const [form, setForm] = useState({ attendeeName: "", department: "", topic: "" });
  const [message, setMessage] = useState("點擊空白時段即可預約。");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const timeSlots = useMemo(() => buildTimeSlots(), []);

  const roomsWithSlots = useMemo(() => {
    return ROOM_CONFIG.map((room) => ({
      ...room,
      slots: timeSlots.map((slot) => ({
        ...slot,
        booking: bookings.find(
          (booking) =>
            booking.date === selectedDate &&
            booking.roomId === room.id &&
            booking.slotId === slot.id
        ),
      })),
    }));
  }, [bookings, selectedDate, timeSlots]);

  const activeBooking = selectedSlot
    ? bookings.find(
        (booking) =>
          booking.date === selectedDate &&
          booking.roomId === selectedSlot.roomId &&
          booking.slotId === selectedSlot.slotId
      )
    : undefined;

  function handleSelectDate(nextDate: string) {
    setSelectedDate(nextDate);
    setSelectedSlot(null);
    setForm({ attendeeName: "", department: "", topic: "" });
    setMessage("點擊空白時段即可預約。");
  }

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setMessage("請先選擇一個時段。");
      return;
    }
    if (!form.attendeeName.trim() || !form.department.trim() || !form.topic.trim()) {
      setMessage("請填寫姓名、部門與會議主題。");
      return;
    }

    const exists = bookings.some(
      (booking) =>
        booking.date === selectedDate &&
        booking.roomId === selectedSlot.roomId &&
        booking.slotId === selectedSlot.slotId
    );
    if (exists) {
      setMessage("此時段已被預約，請選擇其他時段。");
      return;
    }

    const newBooking: Booking = {
      id: `${selectedDate}-${selectedSlot.roomId}-${selectedSlot.slotId}-${Date.now()}`,
      roomId: selectedSlot.roomId,
      slotId: selectedSlot.slotId,
      date: selectedDate,
      attendeeName: form.attendeeName.trim(),
      department: form.department.trim(),
      topic: form.topic.trim(),
      bookedAt: new Date().toLocaleString("zh-TW"),
    };

    setBookings((prev) => [...prev, newBooking]);
    setMessage(`已成功預約 ${selectedSlot.roomId} 房 ${selectedSlot.slotId}。`);
    setSelectedSlot(null);
    setForm({ attendeeName: "", department: "", topic: "" });
  }

  function handleCancel(bookingId: string) {
    setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    setSelectedSlot(null);
    setMessage("預約已取消。你可以重新選擇時段。");
  }

  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="page-header">
          <div>
            <p className="eyebrow">線上會議室預約系統</p>
            <h1>三間會議室，快速排程</h1>
            <p className="subtitle">
              選擇日期後，點擊空白時段即可完成預約；已預約時段可直接取消。
            </p>
          </div>
          <label className="date-picker">
            <span>預約日期</span>
            <input type="date" value={selectedDate} onChange={(e) => handleSelectDate(e.target.value)} />
          </label>
        </header>

        <section className="status-bar">
          <div>
            <strong>{formatDateLabel(selectedDate)}</strong>
            <span> • {bookings.filter((booking) => booking.date === selectedDate).length} 筆預約</span>
          </div>
          <p>{message}</p>
        </section>

        <section className="content-grid">
          <div className="rooms-grid">
            {roomsWithSlots.map((room) => (
              <article key={room.id} className="room-card">
                <div className="room-card-header">
                  <div>
                    <h2>{room.name}</h2>
                    <p>{room.description}</p>
                  </div>
                  <span>{room.capacity}</span>
                </div>

                <div className="slot-list">
                  {room.slots.map((slot) => {
                    const isBooked = Boolean(slot.booking);
                    const isSelected =
                      selectedSlot?.roomId === room.id && selectedSlot?.slotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        className={`slot-pill ${isBooked ? "booked" : "open"} ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          if (isBooked) {
                            setSelectedSlot({ roomId: room.id, slotId: slot.id });
                            setMessage(`已預約：${slot.booking?.attendeeName || "某位使用者"}`);
                          } else {
                            setSelectedSlot({ roomId: room.id, slotId: slot.id });
                            setMessage(`準備預約 ${room.name} ${slot.time}`);
                          }
                        }}
                      >
                        <span>{slot.time}</span>
                        <small>{isBooked ? "已預約" : "可預約"}</small>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <aside className="booking-panel">
            <div className="booking-panel__header">
              <h3>{selectedSlot ? `已選取：${selectedSlot.roomId} 房 ${selectedSlot.slotId}` : "選擇一個時段"}</h3>
              {activeBooking && (
                <button type="button" className="link-btn" onClick={() => handleCancel(activeBooking.id)}>
                  取消預約
                </button>
              )}
            </div>

            {activeBooking ? (
              <div className="booking-detail">
                <p><strong>預約者：</strong>{activeBooking.attendeeName}</p>
                <p><strong>部門：</strong>{activeBooking.department}</p>
                <p><strong>主題：</strong>{activeBooking.topic}</p>
                <p><strong>預約時間：</strong>{activeBooking.bookedAt}</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="booking-form">
                <label>
                  姓名
                  <input
                    type="text"
                    value={form.attendeeName}
                    onChange={(e) => setForm((prev) => ({ ...prev, attendeeName: e.target.value }))}
                    placeholder="請輸入姓名"
                  />
                </label>
                <label>
                  部門
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="例如：行銷部"
                  />
                </label>
                <label>
                  會議主題
                  <textarea
                    rows={3}
                    value={form.topic}
                    onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                    placeholder="請輸入會議主題"
                  />
                </label>
                <button type="submit" className="submit-btn">確認預約</button>
              </form>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
