import { BookingState, Room } from "@/types/booking";

/**
 * 生成 HTML 表格用於匯出
 */
export function generateTableHTML(state: BookingState): string {
  const dateObj = new Date(state.date);
  const dateStr = dateObj.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  let html = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>會議室預約表 - ${dateStr}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 10px;
        }
        .date-info {
          text-align: center;
          color: #666;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .room-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .room-title {
          background-color: #2563eb;
          color: white;
          padding: 12px;
          border-radius: 4px;
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          font-size: 13px;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          color: #333;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .available {
          background-color: #dcfce7;
          color: #166534;
          font-weight: bold;
        }
        .booked {
          background-color: #fef3c7;
          color: #92400e;
        }
        .maintenance {
          background-color: #e5e7eb;
          color: #374151;
        }
        .footer {
          text-align: center;
          color: #999;
          font-size: 12px;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📅 會議室預約表</h1>
        <div class="date-info">${dateStr}</div>
  `;

  // 為每個房間生成表格
  Object.values(state.rooms).forEach((room: Room) => {
    const bookedCount = room.slots.filter((s) => s.status === "booked").length;
    const availableCount = room.slots.filter((s) => s.status === "available").length;

    html += `
      <div class="room-section">
        <div class="room-title">
          會議室 ${room.name} (容納 ${room.capacity} 人) - 可用: ${availableCount}, 已預約: ${bookedCount}
        </div>
        <table>
          <thead>
            <tr>
              <th>時間</th>
              <th>狀態</th>
              <th>預約者</th>
            </tr>
          </thead>
          <tbody>
    `;

    room.slots.forEach((slot) => {
      const statusClass = slot.status;
      const statusText =
        slot.status === "available"
          ? "可用"
          : slot.status === "booked"
            ? "已預約"
            : "維護中";

      html += `
        <tr>
          <td>${slot.startTime} - ${slot.endTime}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
          <td>${slot.bookedBy || "-"}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  });

  html += `
        <div class="footer">
          生成時間: ${new Date().toLocaleString("zh-TW")}
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * 下載為 PDF (使用瀏覽器打印功能)
 */
export function downloadAsPDF(state: BookingState): void {
  const html = generateTableHTML(state);
  const printWindow = window.open("", "", "width=1200,height=800");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}

/**
 * 下載為 CSV
 */
export function downloadAsCSV(state: BookingState): void {
  let csv = "會議室預約表\n";
  const dateObj = new Date(state.date);
  const dateStr = dateObj.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  csv += `日期,${dateStr}\n\n`;

  Object.values(state.rooms).forEach((room: Room) => {
    csv += `會議室 ${room.name} (容納 ${room.capacity} 人)\n`;
    csv += "時間,狀態,預約者\n";

    room.slots.forEach((slot) => {
      const statusText =
        slot.status === "available"
          ? "可用"
          : slot.status === "booked"
            ? "已預約"
            : "維護中";
      csv += `${slot.startTime}-${slot.endTime},${statusText},${slot.bookedBy || ""}\n`;
    });

    csv += "\n";
  });

  const link = document.createElement("a");
  const dateStr2 = state.date.replace(/-/g, "");
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  link.download = `會議室預約表_${dateStr2}.csv`;
  link.click();
}
