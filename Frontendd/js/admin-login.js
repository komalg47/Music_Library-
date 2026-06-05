const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {

    const emailInput = document.getElementById("username");
    const passInput  = document.getElementById("password");

    // Live validation on blur
    emailInput.addEventListener("blur", () => validateEmail(emailInput));
    passInput.addEventListener("blur",  () => {
        if (!passInput.value) setFieldState(passInput, false, "Password is required.");
        else clearFieldState(passInput);
    });

    [emailInput, passInput].forEach(input => {
        input.addEventListener("focus", () => clearFieldState(input));
    });

    adminLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const emailOk = validateEmail(emailInput);
        const passOk  = !!passInput.value.trim();

        if (!passOk) setFieldState(passInput, false, "Password is required.");

        if (!emailOk || !passOk) {
            toast.warning("Please fill in all fields.");
            return;
        }

        const btn = adminLoginForm.querySelector(".btn-auth");
        btn.classList.add("loading");
        btn.disabled = true;

        fetch("http://localhost:8082/admins/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email:    emailInput.value.trim(),
                password: passInput.value
            })
        })
        .then(response => {
            if (!response.ok) throw new Error("Unauthorized");
            return response.json();
        })
        .then(data => {
            if (data.adminLoggedIn) {
                localStorage.setItem("adminLoggedIn", "true");
                localStorage.setItem("adminEmail", emailInput.value.trim());
                toast.success("Access granted. Redirecting to dashboard…");
                setTimeout(() => { window.location.href = "admin.html"; }, 1000);
            }
        })
        .catch(() => {
            setFieldState(passInput, false, "Incorrect email or password.");
            toast.error("Invalid admin credentials. Access denied.", "Unauthorized");
            btn.classList.remove("loading");
            btn.disabled = false;
        });
    });
}
