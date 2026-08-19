/**
 * 會議室預約系統 - 主頁面
 * 
 * 設計特點：
 * - 頁面頂部：標題 + 日期選擇器
 * - 中央：三間房的預約狀態網格
 * - 實時更新所有房間狀態
 * - 點擊預約時彈出申請表
 */

import React, { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { RoomCard } from "@/components/RoomCard";
import { RoomCardVertical } from "@/components/RoomCardVertical";
import { ApplicationDialog } from "@/components/ApplicationDialog";
import { getTodayDate, formatDate } from "@/lib/bookingLogic";
import { ChevronLeft, ChevronRight, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAsPDF, downloadAsCSV } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { state, setDate } = useBooking();
  const [displayDate, setDisplayDate] = useState(getTodayDate());
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  // 日期改變時更新全局狀態
  const handleDateChange = (newDate: string) => {
    setDisplayDate(newDate);
    setDate(newDate);
  };

  // 前一天
  const handlePreviousDay = () => {
    const date = new Date(displayDate);
    date.setDate(date.getDate() - 1);
    handleDateChange(formatDate(date));
  };

  // 後一天
  const handleNextDay = () => {
    const date = new Date(displayDate);
    date.setDate(date.getDate() + 1);
    handleDateChange(formatDate(date));
  };

  // 今天
  const handleToday = () => {
    handleDateChange(getTodayDate());
  };

  const handleSlotBookClick = (slotId: string, date: string) => {
    setSelectedSlotId(slotId);
    setSelectedDate(date);
    setShowApplicationDialog(true);
  };

  const handleExportPDF = () => {
    downloadAsPDF(state);
  };

  const handleExportCSV = () => {
    downloadAsCSV(state);
  };

  // 格式化顯示日期
  const displayDateObj = new Date(displayDate);
  const dateStr = displayDateObj.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-25">
      {/* 頁面容器 */}
      <div className="container mx-auto max-w-7xl py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Poppins" }}>
                會議室預約系統
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                輕鬆預約會議室，自動分配最合適的房間
              </p>
            </div>
          </div>
        </div>

        {/* 日期選擇器 */}
        <div className="mb-8 flex flex-col items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <div className="text-sm font-semibold text-primary">{dateStr}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              size="sm"
              onClick={handleToday}
              className="flex-1 sm:flex-none"
            >
              回到今天
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  匯出
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  📄 下載為 PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  📊 下載為 CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <input
            type="date"
            value={displayDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* 房間網格 - 垂直布局 */}
        <RoomCardVertical 
          rooms={state.rooms}
          date={displayDate}
          onBookClick={handleSlotBookClick}
        />

        {/* 使用說明 */}
        <div className="mt-12 rounded-lg border border-border bg-gradient-to-br from-blue-50 to-blue-25 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground" style={{ fontFamily: "Poppins" }}>使用說明</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="text-success text-lg flex-shrink-0">✓</div>
              <div className="text-sm text-muted-foreground">選擇日期查看該日期的預約情況</div>
            </div>
            <div className="flex gap-3">
              <div className="text-success text-lg flex-shrink-0">✓</div>
              <div className="text-sm text-muted-foreground">點擊「預約」按鈕填寫申請表</div>
            </div>
            <div className="flex gap-3">
              <div className="text-success text-lg flex-shrink-0">✓</div>
              <div className="text-sm text-muted-foreground">系統會自動分配最合適的房間（優先 A 房 → B 房 → C 房）</div>
            </div>
            <div className="flex gap-3">
              <div className="text-success text-lg flex-shrink-0">✓</div>
              <div className="text-sm text-muted-foreground">預約成功後，可在 5 秒內點擊「✕」按鈕撤銷預約</div>
            </div>
            <div className="flex gap-3 md:col-span-2">
              <div className="text-success text-lg flex-shrink-0">✓</div>
              <div className="text-sm text-muted-foreground">所有預約狀態實時更新，所有人都能看到</div>
            </div>
          </div>
        </div>

        {/* 房間信息 */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-block h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-primary font-bold mb-2">A</div>
            <div className="text-sm font-semibold text-primary" style={{ fontFamily: "Poppins" }}>會議室 A</div>
            <div className="mt-2 text-xs text-muted-foreground">容納 6 人</div>
            <div className="mt-1 text-xs text-muted-foreground">適合小型團隊會議</div>
          </div>
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-block h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-primary font-bold mb-2">B</div>
            <div className="text-sm font-semibold text-primary" style={{ fontFamily: "Poppins" }}>會議室 B</div>
            <div className="mt-2 text-xs text-muted-foreground">容納 10 人</div>
            <div className="mt-1 text-xs text-muted-foreground">適合中型團隊會議</div>
          </div>
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-block h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-primary font-bold mb-2">C</div>
            <div className="text-sm font-semibold text-primary" style={{ fontFamily: "Poppins" }}>會議室 C</div>
            <div className="mt-2 text-xs text-muted-foreground">容納 15 人</div>
            <div className="mt-1 text-xs text-muted-foreground">適合大型團隊會議</div>
          </div>
        </div>
      </div>

      {/* 申請表對話框 */}
      <ApplicationDialog 
        open={showApplicationDialog} 
        onOpenChange={setShowApplicationDialog}
        selectedSlotId={selectedSlotId}
        selectedDate={selectedDate}
      />
    </div>
  );
}
