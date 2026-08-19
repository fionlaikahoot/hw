const STORAGE_KEY = "homework-tracker-state";
const STUDENT_LIST_KEY = "homework-tracker-student-list";

const defaultState = {
  items: [
    {
      id: crypto.randomUUID(),
      studentId: "A001",
      studentName: "小美",
      homeworkTitle: "數學第 5 頁",
      subject: "數學",
      dueDate: "",
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ],
  filterText: "",
};

let state = loadState();

const form = document.getElementById("homeworkForm");
const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const studentSummary = document.getElementById("studentSummary");
const searchInput = document.getElementById("searchInput");
const markAllDoneBtn = document.getElementById("markAllDoneBtn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const subjectSelect = document.getElementById("subjectSelect");
const subjectInput = document.getElementById("subject");

form.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", handleSearch);
markAllDoneBtn.addEventListener("click", markAllCompleted);
clearCompletedBtn.addEventListener("click", clearCompleted);
subjectSelect.addEventListener("change", handleSubjectSelect);
subjectInput.addEventListener("input", handleSubjectInput);

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultState;
    }

    const parsed = JSON.parse(saved);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      filterText: typeof parsed.filterText === "string" ? parsed.filterText : "",
    };
  } catch (error) {
    console.error("讀取資料失敗", error);
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function handleSubmit(event) {
  event.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  const studentIdsRaw = document.getElementById("studentIds").value.trim();
  const homeworkTitle = document.getElementById("homeworkTitle").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const parsedStudentIds = parseStudentIds(studentIdsRaw);

  if (!homeworkTitle) {
    alert("請填入功課內容");
    return;
  }

  if (!studentName && parsedStudentIds.length === 0) {
    alert("請填入學生學號或學生姓名");
    return;
  }

  const newItems = (parsedStudentIds.length > 0 ? parsedStudentIds : [""]).map((studentId) => {
    const resolvedDisplayName = getStudentDisplayLabel(studentId, studentName);
    return {
      id: crypto.randomUUID(),
      studentId: studentId || "",
      studentName: resolvedDisplayName,
      homeworkTitle,
      subject,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
  });

  state.items = [...newItems, ...state.items];

  saveState();
  form.reset();
  document.getElementById("studentIds").focus();
  render();
}

function markCompleted(id) {
  state.items = state.items.map((item) =>
    item.id === id ? { ...item, completed: true, completedAt: new Date().toISOString() } : item
  );
  saveState();
  render();
}

function markAllCompleted() {
  state.items = state.items.map((item) =>
    item.completed ? item : { ...item, completed: true, completedAt: new Date().toISOString() }
  );
  saveState();
  render();
}

function clearCompleted() {
  state.items = state.items.filter((item) => !item.completed);
  saveState();
  render();
}

function removeItem(id) {
  state.items = state.items.filter((item) => item.id !== id);
  saveState();
  render();
}

function parseStudentIds(rawValue) {
  return rawValue
    .split(/[\s,，;；\n]+/)
    .map((value) => value.trim())
    .filter(Boolean);
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

function getStudentDisplayLabel(studentId, fallbackName) {
  const rawId = String(studentId || "").trim();
  if (!rawId) {
    return fallbackName || "未知學生";
  }

  const students = loadStudentNameMap();
  const numericId = Number(rawId.replace(/\D/g, ""));
  const matchedStudent = students.find((student) => {
    const numberText = String(student.number);
    return (
      String(student.number) === rawId ||
      numberText === String(numericId) ||
      `A${student.number}` === rawId.toUpperCase() ||
      `A${student.number}` === `A${numericId}`
    );
  });

  if (matchedStudent && matchedStudent.name) {
    return `${matchedStudent.number} ${matchedStudent.name}`;
  }

  if (fallbackName) {
    return `${rawId} ${fallbackName}`;
  }

  return rawId;
}

function handleSubjectSelect(event) {
  subjectInput.value = event.target.value;
}

function handleSubjectInput() {
  if (subjectSelect.value && subjectInput.value !== subjectSelect.value) {
    subjectSelect.value = "";
  }
}

function render() {
  const searchTerm = (state.filterText || "").trim().toLowerCase();
  const pendingItems = state.items.filter((item) => !item.completed && matchesSearch(item, searchTerm));
  const completedItems = state.items.filter((item) => item.completed && matchesSearch(item, searchTerm));

  pendingCount.textContent = pendingItems.length;
  completedCount.textContent = completedItems.length;
  searchInput.value = state.filterText || "";

  const summaryItems = state.items.filter((item) => !item.completed);
  const summaryCounts = summaryItems.reduce((acc, item) => {
    const key = (item.studentName || item.studentId || "未填姓名").trim() || "未填姓名";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  studentSummary.innerHTML = Object.entries(summaryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `<span class="student-pill">${escapeHtml(name)} <strong>${count}</strong></span>`)
    .join("") || '<div class="empty-tip">目前沒有待交功課。</div>';

  pendingList.innerHTML = pendingItems.length
    ? pendingItems
        .map(
          (item) => `
          <div class="item-card">
            <div>
              <strong>${escapeHtml(item.studentName || item.studentId || "未知學生")}</strong>
              <p>${escapeHtml(item.homeworkTitle)}</p>
              <div class="meta">${escapeHtml(item.studentId ? `學號 ${item.studentId}` : "未填學號")} · ${escapeHtml(item.subject || "未填科目")} · ${formatDate(item.dueDate)}</div>
            </div>
            <div class="item-actions">
              <button class="collect-btn" data-action="collect" data-id="${item.id}">已收</button>
              <button data-action="remove" data-id="${item.id}">刪除</button>
            </div>
          </div>
        `
        )
        .join("")
    : '<div class="empty-tip">目前沒有符合搜尋條件的待追收功課。</div>';

  completedList.innerHTML = completedItems.length
    ? completedItems
        .map(
          (item) => `
          <div class="item-card">
            <div>
              <strong>${escapeHtml(item.studentName || item.studentId || "未知學生")}</strong>
              <p>${escapeHtml(item.homeworkTitle)}</p>
              <div class="meta">${escapeHtml(item.studentId ? `學號 ${item.studentId}` : "未填學號")} · 已收 · ${formatDate(item.dueDate)}</div>
            </div>
            <div class="item-actions">
              <button data-action="remove" data-id="${item.id}">刪除</button>
            </div>
          </div>
        `
        )
        .join("")
    : '<div class="empty-tip">沒有符合搜尋條件的已收功課。</div>';
}

function matchesSearch(item, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const haystack = [item.studentName, item.homeworkTitle, item.subject]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
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

function handleSearch(event) {
  state.filterText = event.target.value;
  saveState();
  render();
}

pendingList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  if (button.dataset.action === "collect") {
    markCompleted(id);
  } else if (button.dataset.action === "remove") {
    removeItem(id);
  }
});

completedList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  if (button.dataset.action === "remove") {
    removeItem(id);
  }
});

render();
