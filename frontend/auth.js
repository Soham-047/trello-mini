const API_BASE = "http://127.0.0.1:8000/api";

// LOGIN
document.getElementById("loginBtn").onclick = async () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username, password})
    });

    if(res.ok){
        const data = await res.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "boards.html";
    } else {
        alert("Login failed");
    }
}

// REGISTER
document.getElementById("registerBtn").onclick = async () => {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch(`${API_BASE}/register/`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({username,email,password})
    });

    if(res.ok){
        alert("Registered! You can now login.");
    } else {
        alert("Registration failed");
    }
}
