/**
 * ui.js — shared UI utilities
 * Toast notifications + form validation helpers
 */

// ── Toast System ──────────────────────────────────────────────────────────────

(function () {
    // Inject container once
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
})();

const TOAST_ICONS = {
    success: "✅",
    error:   "❌",
    warning: "⚠️",
    info:    "ℹ️"
};

const TOAST_TITLES = {
    success: "Success",
    error:   "Error",
    warning: "Warning",
    info:    "Info"
};

/**
 * Show a toast notification.
 * @param {string} message  - The message body
 * @param {"success"|"error"|"warning"|"info"} type
 * @param {string} [title]  - Optional custom title
 */
function showToast(message, type = "info", title = "") {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <span class="toast-icon">${TOAST_ICONS[type]}</span>
        <div class="toast-body">
            <div class="toast-title">${title || TOAST_TITLES[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="dismissToast(this.parentElement)">✕</button>
        <div class="toast-bar"></div>
    `;

    container.appendChild(toast);

    // Auto-dismiss after 4 s
    const timer = setTimeout(() => dismissToast(toast), 4000);
    toast._timer = timer;
}

function dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    clearTimeout(toast._timer);
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
}

// Convenience shortcuts
const toast = {
    success: (msg, title) => showToast(msg, "success", title),
    error:   (msg, title) => showToast(msg, "error",   title),
    warning: (msg, title) => showToast(msg, "warning", title),
    info:    (msg, title) => showToast(msg, "info",    title),
};


// ── Validation Helpers ────────────────────────────────────────────────────────

/**
 * Mark an input as valid or invalid with inline feedback.
 * @param {HTMLInputElement} input
 * @param {boolean} isValid
 * @param {string}  [errorMsg]
 */
function setFieldState(input, isValid, errorMsg = "") {
    input.classList.remove("is-valid", "is-invalid");
    input.classList.add(isValid ? "is-valid" : "is-invalid");

    // Validation icon inside wrapper
    const wrapper = input.closest(".input-wrapper");
    if (wrapper) {
        let icon = wrapper.querySelector(".validation-icon");
        if (!icon) {
            icon = document.createElement("span");
            icon.className = "validation-icon";
            wrapper.appendChild(icon);
        }
        icon.className = `validation-icon ${isValid ? "valid" : "invalid"}`;
        icon.textContent = isValid ? "✓" : "✕";

        // If there's a password toggle already, shift the icon
        if (wrapper.querySelector(".toggle-password")) {
            icon.style.right = "44px";
        }
    }

    // Error message below the field
    const group = input.closest(".form-group");
    if (group) {
        let errEl = group.querySelector(".field-error");
        if (!errEl) {
            errEl = document.createElement("div");
            errEl.className = "field-error";
            // Insert after the wrapper
            const wrapperEl = group.querySelector(".input-wrapper");
            wrapperEl ? wrapperEl.insertAdjacentElement("afterend", errEl) : group.appendChild(errEl);
        }
        errEl.innerHTML = isValid ? "" : `<span>⚠</span> ${errorMsg}`;
        errEl.classList.toggle("visible", !isValid);
    }
}

function clearFieldState(input) {
    input.classList.remove("is-valid", "is-invalid");
    const wrapper = input.closest(".input-wrapper");
    if (wrapper) {
        const icon = wrapper.querySelector(".validation-icon");
        if (icon) icon.remove();
    }
    const group = input.closest(".form-group");
    if (group) {
        const errEl = group.querySelector(".field-error");
        if (errEl) { errEl.textContent = ""; errEl.classList.remove("visible"); }
    }
}

// ── Specific validators ───────────────────────────────────────────────────────

function validateName(input) {
    const v = input.value.trim();
    if (!v) {
        setFieldState(input, false, "Name is required.");
        return false;
    }
    if (v.length < 2) {
        setFieldState(input, false, "Name must be at least 2 characters.");
        return false;
    }
    setFieldState(input, true);
    return true;
}

function validateEmail(input) {
    const v = input.value.trim();
    if (!v) {
        setFieldState(input, false, "Email is required.");
        return false;
    }
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(v)) {
        setFieldState(input, false, "Enter a valid email address.");
        return false;
    }
    setFieldState(input, true);
    return true;
}

function validatePhone(input) {
    const v = input.value.trim();
    if (!v) {
        setFieldState(input, false, "Phone number is required.");
        return false;
    }
    const pattern = /^[+]?[\d\s\-()]{7,15}$/;
    if (!pattern.test(v)) {
        setFieldState(input, false, "Enter a valid phone number.");
        return false;
    }
    setFieldState(input, true);
    return true;
}

function validatePassword(input, minLength = 6) {
    const v = input.value;
    if (!v) {
        setFieldState(input, false, "Password is required.");
        return false;
    }
    if (v.length < minLength) {
        setFieldState(input, false, `Password must be at least ${minLength} characters.`);
        return false;
    }
    setFieldState(input, true);
    return true;
}

function validateConfirmPassword(input, originalInput) {
    const v = input.value;
    if (!v) {
        setFieldState(input, false, "Please confirm your password.");
        return false;
    }
    if (v !== originalInput.value) {
        setFieldState(input, false, "Passwords do not match.");
        return false;
    }
    setFieldState(input, true);
    return true;
}

// ── Password Strength ─────────────────────────────────────────────────────────

function updatePasswordStrength(input) {
    const strengthBar = input.closest(".form-group").querySelector(".strength-fill");
    const strengthLabel = input.closest(".form-group").querySelector(".strength-label");
    const strengthWrapper = input.closest(".form-group").querySelector(".password-strength");

    if (!strengthBar) return;

    const v = input.value;

    if (!v) {
        strengthWrapper.classList.remove("visible");
        return;
    }

    strengthWrapper.classList.add("visible");

    let score = 0;
    if (v.length >= 6)  score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const levels = [
        { pct: "20%",  color: "#EF4444", label: "Very weak" },
        { pct: "40%",  color: "#F59E0B", label: "Weak" },
        { pct: "60%",  color: "#FBBF24", label: "Fair" },
        { pct: "80%",  color: "#34D399", label: "Good" },
        { pct: "100%", color: "#10B981", label: "Strong" },
    ];

    const level = levels[Math.min(score - 1, 4)] || levels[0];
    strengthBar.style.width      = level.pct;
    strengthBar.style.background = level.color;
    strengthLabel.textContent    = level.label;
    strengthLabel.style.color    = level.color;
}

// ── Password Toggle ────────────────────────────────────────────────────────────

function initPasswordToggle(toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        const input = toggleBtn.closest(".input-wrapper").querySelector("input");
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggleBtn.textContent = isPassword ? "🙈" : "👁";
    });
}

// Initialise all toggles on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-password").forEach(initPasswordToggle);
});
