if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

let allCategories = [];

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

const userName = localStorage.getItem("userName");
if (userName) {
  document.getElementById("welcomeMessage")
    .textContent = "Welcome, " + userName;
}

window.onload = () => {
  const today = new Date().toISOString().slice(0, 7);
  document.getElementById("selectedMonth").value = today;

  document.getElementById("selectedMonth")
    .addEventListener("change", loadMonthlySummary);

  loadCategories();
  loadTransactions();
  loadMonthlySummary();
  loadRunningBalance();

  document.getElementById("type")
    .addEventListener("change", filterCategoriesByType);

  document.querySelectorAll(".card").forEach((card, index) => {
  card.classList.add("fade-in");
  card.style.animationDelay = `${index * 0.08}s`;
});
};

// ========================
// CATEGORY MANAGEMENT
// ========================

async function loadCategories() {
  try {
    allCategories = await apiRequest("/categories");
    renderCategoryList();
    filterCategoriesByType();
  } catch (error) {
    alert(error.message);
  }
}

function renderCategoryList() {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";

  if (allCategories.length === 0) {
    container.innerHTML = "<p style='color:#888;'>No categories created yet.</p>";
    return;
  }

  allCategories.forEach(cat => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.marginBottom = "8px";

    div.innerHTML = `
      <span>${cat.name} (${cat.type})</span>
      <button class="btn-danger" onclick="deleteCategory(${cat.id})">
        Delete
      </button>
    `;

    container.appendChild(div);
  });
}

async function addCategory() {
  const name = document.getElementById("newCategoryName").value;
  const type = document.getElementById("newCategoryType").value;

  if (!name) {
    alert("Category name required");
    return;
  }

  try {
    await apiRequest("/categories", "POST", { name, type });

    document.getElementById("newCategoryName").value = "";

    loadCategories();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteCategory(id) {
  try {
    await apiRequest(`/categories/${id}`, "DELETE");
    loadCategories();
  } catch (error) {
    alert(error.message);
  }
}

function filterCategoriesByType() {
  const selectedType = document.getElementById("type").value;
  const categorySelect = document.getElementById("category");

  categorySelect.innerHTML = "";

  const filtered = allCategories.filter(cat => cat.type === selectedType);

  if (filtered.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No categories available";
    option.disabled = true;
    categorySelect.appendChild(option);
    return;
  }

  filtered.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

// ========================
// TRANSACTIONS
// ========================

async function addTransaction() {
  const type = document.getElementById("type").value;
  const amount = document.getElementById("amount").value;
  const category_id = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const description = document.getElementById("description").value;

  if (!amount || !date) {
    alert("Amount and date required");
    return;
  }

  try {
    await apiRequest("/transactions", "POST", {
      type,
      amount,
      category_id,
      description,
      date
    });

    loadTransactions();
    loadMonthlySummary();
    loadRunningBalance();
  } catch (error) {
    alert(error.message);
  }
}

async function loadTransactions() {
  try {
    const transactions = await apiRequest("/transactions");

    const table = document.getElementById("transactionTable");
    table.innerHTML = "";

    transactions.forEach(tx => {
      const row = document.createElement("tr");
      row.classList.add("row-enter");

      row.innerHTML = `
        <td>${tx.date}</td>
        <td>${tx.type}</td>
        <td>${tx.category_name || ""}</td>
        <td class="${tx.type === "income" ? "positive" : "negative"}">
          R${tx.amount}
        </td>
        <td>${tx.description || ""}</td>
        <td>
          <button class="btn-danger" onclick="deleteTransaction(${tx.id})">
            Delete
          </button>
        </td>
      `;

      table.appendChild(row);
    });

  } catch (error) {
    alert(error.message);
  }
}

async function deleteTransaction(id) {
  try {
    await apiRequest(`/transactions/${id}`, "DELETE");
    loadTransactions();
    loadMonthlySummary();
    loadRunningBalance();
  } catch (error) {
    alert(error.message);
  }
}

async function loadMonthlySummary() {
  const summaryCard = document.querySelector("#selectedMonth").closest(".card");
  summaryCard.classList.add("summary-fade");

  const month = document.getElementById("selectedMonth").value;

  if (!month) return;

  try {
    const summary = await apiRequest(`/reports/monthly?month=${month}`);

    const currentIncome =
     parseInt(document.getElementById("totalIncome").textContent.replace("R","")) || 0;

    const currentExpenses =
     parseInt(document.getElementById("totalExpenses").textContent.replace("R","")) || 0;

    const currentNet =
     parseInt(document.getElementById("netBalance").textContent.replace("R","")) || 0;

     animateValue("totalIncome", currentIncome, summary.totalIncome);
     animateValue("totalExpenses", currentExpenses, summary.totalExpenses);
     animateValue("netBalance", currentNet, summary.netBalance);

    net.className =
      summary.netBalance >= 0 ? "positive" : "negative";

      setTimeout(() => {
        summaryCard.classList.remove("summary-fade");
      }, 250);

      loadCategoryBreakdown();

  } catch (error) {
    alert(error.message);
  }
}

async function loadCategoryBreakdown() {
  const month = document.getElementById("selectedMonth").value;
  if (!month) return;

  try {
    const breakdown = await apiRequest(
      `/reports/category-breakdown?month=${month}`
    );

    const container = document.getElementById("categoryBreakdown");
    container.innerHTML = "";

    if (breakdown.length === 0) {
      container.innerHTML =
        "<p style='color:#888;'>No expenses recorded this month.</p>";
      return;
    }

    breakdown.forEach(item => {
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.marginBottom = "8px";

      div.innerHTML = `
        <span>${item.category}</span>
        <span class="negative">R${item.total}</span>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    alert(error.message);
  }
}

async function loadRunningBalance() {
  try {
    const running = await apiRequest("/reports/running-balance");

    const container = document.getElementById("runningBalanceList");
    container.innerHTML = "";

    if (running.length === 0) {
      container.innerHTML =
        "<p style='color:#888;'>No transactions yet.</p>";
      return;
    }

    running.forEach(item => {
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.marginBottom = "6px";

      div.innerHTML = `
        <span>${item.date} (${item.type})</span>
        <span class="${item.balance >= 0 ? "positive" : "negative"}">
          R${item.balance}
        </span>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    alert(error.message);
  }
}

function animateValue(elementId, start, end, duration = 600) {
  const element = document.getElementById(elementId);
  const range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percentage = Math.min(progress / duration, 1);

    const value = Math.floor(start + range * percentage);
    element.textContent = "R" + value;

    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      element.textContent = "R" + end;
    }
  }

  document.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON") {
    const button = e.target;

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);
  }
});
  requestAnimationFrame(step);
}

function scrollToTransaction() {
  document.querySelector("h2").scrollIntoView({ behavior: "smooth" });
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
}