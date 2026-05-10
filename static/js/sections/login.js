function initLogin() {
    const Register = document.querySelector('#register');
    const Login = document.querySelector('#login');

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

    Login.addEventListener('click', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!username || !password) {
            alert('Please fill in both username and password.');
            return;
        }
        fetch('/section/Login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userName: username, passwordHash: password }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            if (data.message) {
                alert(data.message);
                console.log('Login successful, redirecting to Home...');
                fetch('/section/Home')
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
                    script.src = `/static/js/sections/home.js`;
                    script.classList.add('dynamic-script');
                    document.body.appendChild(script);
                    const loginDiv = document.getElementById('Login');
                    const logoutDiv = document.getElementById('Logout');
                    loginDiv.classList.add('hidden');
                    logoutDiv.classList.remove('hidden');
                })
                .catch(error => {
                    console.error('Error fetching section content:', error);
                });
            } else if (data.error) {
                alert(`Registration failed: ${data.error}`);
                console.log('Login failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            alert('An error occurred. Please try again later.');
        });

    });

    Register.addEventListener('click', () => {
        fetch('/section/Register')
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
                script.src = `/static/js/sections/register.js`;
                script.classList.add('dynamic-script');
                document.body.appendChild(script);
            })
            .catch(error => {
                console.error('Error fetching section content:', error);
            });
    });
}

initLogin();