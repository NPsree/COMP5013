function initRegister() {
    const registerButton = document.getElementById('register');

    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("toggle-password");

    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "HIDE";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "SHOW";
        }
    });

    registerButton.addEventListener('click', (event) => {

        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alert('Please fill in both username and password.');
            return;
        }

        fetch('/section/Register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName: username, passwordHash: password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                fetch('/section/Login')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(html => {
                    const pageDiv = document.querySelector('.Page');
                    pageDiv.innerHTML = html;
                    const existingScripts = document.querySelectorAll('.dynamic-script');
                    existingScripts.forEach(script => script.remove());
                    const script = document.createElement('script');
                    script.src = `/static/js/sections/login.js`;
                    script.classList.add('dynamic-script');
                    document.body.appendChild(script);
                })
                .catch(error => {
                    console.error('Error fetching section content:', error);
                });
            } else if (data.error) {
                alert(`Registration failed: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            alert('An error occurred. Please try again later.');
        });

    });
};

initRegister();