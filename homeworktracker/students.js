const STORAGE_KEY = "homework-tracker-student-list";
const studentList = document.getElementById("studentList");
const clearBtn = document.getElementById("clearBtn");
const statusMessage = document.getElementById("statusMessage");

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return Array.from({ length: 35 }, (_, index) => ({
        number: index + 1,
        name: "",
      }));
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("載入學生名單失敗", error);
    return Array.from({ length: 35 }, (_, index) => ({ number: index + 1, name: "" }));
  }
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function renderStudents() {
  const students = loadStudents();
  studentList.innerHTML = "";

  students.forEach((student) => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <label>
        <span>第 ${student.number} 號</span>
        <input type="text" value="${escapeHtml(student.name)}" data-number="${student.number}" placeholder="輸入名字" />
      </label>
    `;
    studentList.appendChild(card);
  });

  studentList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", handleInput);
  });
}

function handleInput(event) {
  const number = Number(event.target.dataset.number);
  const name = event.target.value.trim();
  const students = loadStudents();
  const index = students.findIndex((item) => item.number === number);

  if (index >= 0) {
    students[index].name = name;
    saveStudents(students);
    statusMessage.textContent = `已更新第 ${number} 號：${name || "空白"}`;
  }
}

function clearAll() {
  const students = Array.from({ length: 35 }, (_, index) => ({ number: index + 1, name: "" }));
  saveStudents(students);
  renderStudents();
  statusMessage.textContent = "已清空全部學號姓名。";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

clearBtn.addEventListener("click", clearAll);
renderStudents();
