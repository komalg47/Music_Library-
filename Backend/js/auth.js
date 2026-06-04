// ── Register ──────────────────────────────────────────────────────────────────

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const nameInput     = document.getElementById("name");
    const emailInput    = document.getElementById("email");
    const phoneInput    = document.getElementById("phone");
    const passInput     = document.getElementById("password");
    const confirmInput  = document.getElementById("confirmPassword");

    // Live validation on blur
    nameInput.addEventListener("blur",    () => validateName(nameInput));
    emailInput.addEventListener("blur",   () => validateEmail(emailInput));
    phoneInput.addEventListener("blur",   () => validatePhone(phoneInput));
    passInput.addEventListener("blur",    () => validatePassword(passInput, 6));
    confirmInput.addEventListener("blur", () => validateConfirmPassword(confirmInput, passInput));

    // Clear error on focus
    [nameInput, emailInput, phoneInput, passInput, confirmInput].forEach(input => {
        input.addEventListener("focus", () => clearFieldState(input));
    });

    // Password strength live update
    passInput.addEventListener("input", () => {
        updatePasswordStrength(passInput);
        // Re-validate confirm if user already typed in it
        if (confirmInput.value) validateConfirmPassword(confirmInput, passInput);
    });

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Validate all fields
        const valid = [
            validateName(nameInput),
            validateEmail(emailInput),
            validatePhone(phoneInput),
            validatePassword(passInput, 6),
            validateConfirmPassword(confirmInput, passInput)
        ].every(Boolean);

        if (!valid) {
            toast.warning("Please fix the errors above before continuing.");
            return;
        }

        const btn = registerForm.querySelector(".btn-auth");
        btn.classList.add("loading");
        btn.disabled = true;

        const userData = {
            name:     nameInput.value.trim(),
            email:    emailInput.value.trim(),
            phone:    phoneInput.value.trim(),
            password: passInput.value
        };

        fetch("http://localhost:8081/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(msg => { throw new Error(msg || "Registration failed"); });
            }
            return response.json();
        })
        .then(() => {
            toast.success("Account created! Redirecting to login…");
            setTimeout(() => { window.location.href = "login.html"; }, 1500);
        })
        .catch(error => {
            console.error(error);
            const msg = error.message.toLowerCase().includes("duplicate") || error.message.includes("unique")
                ? "That email is already registered."
                : "Registration failed. Please try again.";
            toast.error(msg);
            btn.classList.remove("loading");
            btn.disabled = false;
        });
    });
}


// ── Login ──────────────────────────────────────────────────────────────────────

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const emailInput = document.getElementById("loginEmail");
    const passInput  = document.getElementById("loginPassword");

    // Live validation on blur
    emailInput.addEventListener("blur", () => validateEmail(emailInput));
    passInput.addEventListener("blur",  () => validatePassword(passInput, 1));  // just "required" on login

    [emailInput, passInput].forEach(input => {
        input.addEventListener("focus", () => clearFieldState(input));
    });

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const valid = [
            validateEmail(emailInput),
            validatePassword(passInput, 1)
        ].every(Boolean);

        if (!valid) return;

        const btn = loginForm.querySelector(".btn-auth");
        btn.classList.add("loading");
        btn.disabled = true;

        fetch("http://localhost:8081/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email:    emailInput.value.trim(),
                password: passInput.value
            })
        })
        .then(response => {
            if (!response.ok) throw new Error("Invalid credentials");
            return response.json();
        })
        .then(data => {
            localStorage.setItem("token",     data.token);
            localStorage.setItem("userId",    data.userId);
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("userName",  data.name);

            toast.success("Login successful! Redirecting…");
            setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
        })
        .catch(() => {
            setFieldState(passInput, false, "Invalid email or password.");
            toast.error("Invalid email or password. Please try again.");
            btn.classList.remove("loading");
            btn.disabled = false;
        });
    });
}
