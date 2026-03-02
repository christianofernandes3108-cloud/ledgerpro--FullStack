const API_URL = "https://ledgerpro-fullstack.onrender.com/api";

function setLoading(button, isLoading, text) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = "Loading<span class='dots'></span>";
  } else {
    button.disabled = false;
    button.innerHTML = text;
  }
}

async function register() {
  const btn = document.getElementById("registerBtn");
  setLoading(btn, true, "Register");

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);

    window.location.href = "index.html";

  } catch (error) {
    alert(error.message);
    setLoading(btn, false, "Register");
  }
}

async function login() {
  const btn = document.getElementById("loginBtn");
  setLoading(btn, true, "Login");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);

    window.location.href = "index.html";

  } catch (error) {
    alert(error.message);
    setLoading(btn, false, "Login");
  }
}