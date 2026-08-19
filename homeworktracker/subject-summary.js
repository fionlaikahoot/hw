const STORAGE_KEY = "homework-tracker-state";
const STUDENT_LIST_KEY = "homework-tracker-student-list";
const container = document.getElementById("subjectHomeworkList");

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { items: [] };
    }

    const parsed = JSON.parse(saved);
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch (error) {
    console.error("讀取功課資料失敗", error);
    return { items: [] };
  }
}

function loadStudentNameMap() {
  try {
    const saved = localStorage.getItem(STUDENT_LIST_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("讀取學生名單失敗", error);
    return [];
  }
}

function getStudentLabel(item) {
  const students = loadStudentNameMap();
  const rawId = String(item.studentId || "").trim();

  if (rawId) {
    const numericId = Number(rawId.replace(/\D/g, ""));
    const matched = students.find((student) => {
      return (
        String(student.number) === rawId ||
        String(student.number) === String(numericId) ||
        `A${student.number}` === rawId.toUpperCase() ||
        `A${student.number}` === `A${numericId}`
      );
    });

    if (matched && matched.name) {
      return `${matched.number} ${matched.name}`;
    }
  }

  return item.studentName || item.studentId || "未知學生";
}

function render() {
  const state = loadState();
  const pendingItems = state.items.filter((item) => !item.completed);

  const grouped = pendingItems.reduce((acc, item) => {
    const key = (item.subject || "其他").trim() || "其他";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  if (!pendingItems.length) {
    container.innerHTML = '<div class="empty-tip">目前沒有未交功課。</div>';
    return;
  }

  container.innerHTML = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b, "zh-Hant"))
    .map(([subject, items]) => `
      <div class="student-summary-card">
        <h3>${escapeHtml(subject)}</h3>
        <ul>
          ${items
            .map(
              (item) => `
                <li>
                  <strong>${escapeHtml(getStudentLabel(item))}</strong>
                  <div class="meta">${escapeHtml(item.homeworkTitle || "未填功課內容")} · ${formatDate(item.dueDate)}</div>
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
    `)
    .join("");
}

function formatDate(dateString) {
  if (!dateString) {
    return "未設定日期";
  }

  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("zh-Hant", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

render();
