const userTab = document.getElementById("userTab");
const adminTab = document.getElementById("adminTab");
const userPanel = document.getElementById("userPanel");
const adminPanel = document.getElementById("adminPanel");

const userForm = document.getElementById("userForm");
const userCodeInput = document.getElementById("userCodeInput");
const userSubmitButton = document.getElementById("userSubmitButton");
const userStatusMessage = document.getElementById("userStatusMessage");
const userResultBox = document.getElementById("userResultBox");
const userPlaceholderBox = document.getElementById("userPlaceholderBox");
const userUsernameValue = document.getElementById("userUsernameValue");
const userPasswordValue = document.getElementById("userPasswordValue");

const adminLookupForm = document.getElementById("adminLookupForm");
const adminSaveForm = document.getElementById("adminSaveForm");
const adminTokenInput = document.getElementById("adminTokenInput");
const adminCodeInput = document.getElementById("adminCodeInput");
const adminLookupButton = document.getElementById("adminLookupButton");
const adminStatusMessage = document.getElementById("adminStatusMessage");
const adminEditorPlaceholder = document.getElementById("adminEditorPlaceholder");
const selectedCodeLabel = document.getElementById("selectedCodeLabel");
const adminUsernameInput = document.getElementById("adminUsernameInput");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminSaveButton = document.getElementById("adminSaveButton");

const copyButtons = document.querySelectorAll(".copy-btn");
let selectedAdminCode = "";

function setToneStatus(element, message, tone = "neutral") {
  element.textContent = message;
  element.className = "min-h-6 text-sm font-semibold";
  if (tone === "success") {
    element.classList.add("text-emerald-700");
  } else if (tone === "error") {
    element.classList.add("text-rose-700");
  } else {
    element.classList.add("text-slate-600");
  }
}

function isCodeValid(code) {
  return /^\d{4,10}$/.test(code);
}

function setActiveTab(tab) {
  const showUser = tab === "user";
  userPanel.classList.toggle("hidden", !showUser);
  adminPanel.classList.toggle("hidden", showUser);
  userTab.classList.toggle("active", showUser);
  adminTab.classList.toggle("active", !showUser);
}

function setUserLoading(isLoading) {
  userCodeInput.disabled = isLoading;
  userSubmitButton.disabled = isLoading;
  userSubmitButton.textContent = isLoading ? "Checking..." : "Get Credentials";
}

function setAdminLookupLoading(isLoading) {
  adminTokenInput.disabled = isLoading;
  adminCodeInput.disabled = isLoading;
  adminLookupButton.disabled = isLoading;
  adminLookupButton.textContent = isLoading ? "Checking..." : "Find or Create ID";
}

function setAdminSaveLoading(isLoading) {
  adminUsernameInput.disabled = isLoading;
  adminPasswordInput.disabled = isLoading;
  adminSaveButton.disabled = isLoading;
  adminSaveButton.textContent = isLoading ? "Saving..." : "Save Credentials";
}

function showUserCredentials(username, password) {
  userUsernameValue.textContent = username;
  userPasswordValue.textContent = password;
  userResultBox.classList.remove("hidden");
  userResultBox.classList.add("animate-fade-in");
  userPlaceholderBox.classList.add("hidden");
}

function hideUserCredentials() {
  userResultBox.classList.add("hidden");
  userPlaceholderBox.classList.remove("hidden");
}

function showAdminEditor(code, username = "", password = "") {
  selectedAdminCode = code;
  selectedCodeLabel.textContent = code;
  adminUsernameInput.value = username;
  adminPasswordInput.value = password;
  adminEditorPlaceholder.classList.add("hidden");
  adminSaveForm.classList.remove("hidden");
}

async function handleUserSubmit(event) {
  event.preventDefault();
  const code = userCodeInput.value.trim();

  if (!isCodeValid(code)) {
    hideUserCredentials();
    setToneStatus(userStatusMessage, "Please enter a valid numeric ID (4-10 digits).", "error");
    return;
  }

  try {
    setUserLoading(true);
    setToneStatus(userStatusMessage, "Checking ID...", "neutral");

    const response = await fetch("/api/get-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      hideUserCredentials();
      setToneStatus(userStatusMessage, data.message || "ID not found.", "error");
      return;
    }

    showUserCredentials(data.username, data.password);
    setToneStatus(userStatusMessage, "Credentials loaded.", "success");
  } catch (error) {
    hideUserCredentials();
    setToneStatus(userStatusMessage, "Network error. Try again.", "error");
    console.error(error);
  } finally {
    setUserLoading(false);
  }
}

async function handleAdminLookup(event) {
  event.preventDefault();
  const token = adminTokenInput.value.trim();
  const code = adminCodeInput.value.trim();

  if (!token) {
    setToneStatus(adminStatusMessage, "Enter admin token.", "error");
    return;
  }
  if (!isCodeValid(code)) {
    setToneStatus(adminStatusMessage, "Please enter a valid numeric ID (4-10 digits).", "error");
    return;
  }

  try {
    setAdminLookupLoading(true);
    setToneStatus(adminStatusMessage, "Checking ID...", "neutral");

    const response = await fetch("/api/admin/get-credential", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token
      },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      setToneStatus(adminStatusMessage, data.message || "Admin lookup failed.", "error");
      return;
    }

    if (data.found) {
      showAdminEditor(code, data.username, data.password);
      setToneStatus(adminStatusMessage, "ID found. Edit and save.", "success");
    } else {
      showAdminEditor(code, "", "");
      setToneStatus(adminStatusMessage, "ID not found. New ID ready, enter credentials and save.", "success");
    }
  } catch (error) {
    setToneStatus(adminStatusMessage, "Network error. Try again.", "error");
    console.error(error);
  } finally {
    setAdminLookupLoading(false);
  }
}

async function handleAdminSave(event) {
  event.preventDefault();
  const token = adminTokenInput.value.trim();
  const username = adminUsernameInput.value.trim();
  const password = adminPasswordInput.value.trim();

  if (!selectedAdminCode) {
    setToneStatus(adminStatusMessage, "Search an ID first.", "error");
    return;
  }
  if (!token) {
    setToneStatus(adminStatusMessage, "Enter admin token.", "error");
    return;
  }
  if (!username || !password) {
    setToneStatus(adminStatusMessage, "Username and password are required.", "error");
    return;
  }

  try {
    setAdminSaveLoading(true);
    setToneStatus(adminStatusMessage, "Saving credentials...", "neutral");

    const response = await fetch("/api/admin/update-credential", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token
      },
      body: JSON.stringify({ code: selectedAdminCode, username, password })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      setToneStatus(adminStatusMessage, data.message || "Save failed.", "error");
      return;
    }

    setToneStatus(adminStatusMessage, "Credentials saved successfully.", "success");
  } catch (error) {
    setToneStatus(adminStatusMessage, "Network error. Try again.", "error");
    console.error(error);
  } finally {
    setAdminSaveLoading(false);
  }
}

async function copyValue(value, label, statusTarget) {
  if (!value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    setToneStatus(statusTarget, `${label} copied.`, "success");
  } catch {
    setToneStatus(statusTarget, "Could not copy automatically.", "error");
  }
}

userTab.addEventListener("click", () => setActiveTab("user"));
adminTab.addEventListener("click", () => setActiveTab("admin"));
userForm.addEventListener("submit", handleUserSubmit);
adminLookupForm.addEventListener("submit", handleAdminLookup);
adminSaveForm.addEventListener("submit", handleAdminSave);

copyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.copy === "user-username") {
      copyValue(userUsernameValue.textContent, "Username", userStatusMessage);
      return;
    }
    if (button.dataset.copy === "user-password") {
      copyValue(userPasswordValue.textContent, "Password", userStatusMessage);
    }
  });
});

setActiveTab("user");
