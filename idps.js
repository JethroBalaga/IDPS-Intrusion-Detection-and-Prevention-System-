let failedAttempts = parseInt(localStorage.getItem("failedAttempts")) || 0;
const maxAttempts = 3;
const permanentBlockThreshold = 10;
const lockoutTime = 30000; // 30 seconds

function isMalicious(input) {
    const patterns = [
        /<script>/i,
        /SELECT.*FROM/i,
        /DROP.*TABLE/i,
        /INSERT.*INTO/i,
        /--/
    ];
    return patterns.some(pattern => pattern.test(input));
}

function checkLockout() {
    let permanentBlock = localStorage.getItem("permanentBlock");
    let lockoutEndTime = localStorage.getItem("lockoutEndTime");
    let status = document.getElementById("status");
    let loginBtn = document.getElementById("loginBtn");

    if (permanentBlock) {
        status.innerHTML = "🚨 Too many failed attempts! You are permanently blocked!";
        loginBtn.disabled = true;
        return true;
    }
    
    if (lockoutEndTime && new Date().getTime() < lockoutEndTime) {
        let remainingTime = Math.ceil((lockoutEndTime - new Date().getTime()) / 1000);
        status.innerHTML = `🚨 Too many failed attempts! Try again in ${remainingTime} seconds.`;
        loginBtn.disabled = true;
        setTimeout(checkLockout, 1000);
        return true;
    }
    
    loginBtn.disabled = false;
    return false;
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let status = document.getElementById("status");

    if (checkLockout()) return;

    if (isMalicious(username) || isMalicious(password)) {
        status.innerHTML = "🚨 Suspicious input detected! Access blocked!";
        return;
    }

    if (username.trim() === "admin" && password.trim() === "PythonGUI0955") {
        alert("✅ Login successful!");
        status.innerHTML = "Welcome, Admin!";
        status.classList.remove("text-danger");
        status.classList.add("text-success");

        // ✅ RESET failed attempts on successful login
        failedAttempts = 0;
        localStorage.setItem("failedAttempts", "0");
        localStorage.removeItem("lockoutEndTime");
        localStorage.removeItem("permanentBlock");

        // Redirect to admin panel
        window.location.href = "admin.html";
    } else {
        failedAttempts++;
        localStorage.setItem("failedAttempts", failedAttempts.toString());
        status.innerHTML = `❌ Invalid login! Attempt ${failedAttempts}/${maxAttempts}`;

        if (failedAttempts >= permanentBlockThreshold) {
            localStorage.setItem("permanentBlock", "true");
            status.innerHTML = "🚨 Too many failed attempts! You are permanently blocked!";
            document.getElementById("loginBtn").disabled = true;
        } else if (failedAttempts >= maxAttempts) {
            let lockoutEnd = new Date().getTime() + lockoutTime;
            localStorage.setItem("lockoutEndTime", lockoutEnd);
            status.innerHTML = "🚨 Too many failed attempts! Locked for 30s.";
            document.getElementById("loginBtn").disabled = true;
            checkLockout();
        }
    }
});

document.getElementById("resetBlock").addEventListener("click", function() {
    localStorage.removeItem("permanentBlock");
    localStorage.setItem("failedAttempts", "0");
    alert("✅ Permanent block has been reset!");
    location.reload();
});

checkLockout();
