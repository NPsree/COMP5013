function initLogout() {
    fetch('/section/Logout', {
        method: 'POST',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            const pageDiv = document.querySelector('.Page');
            const loginDiv = document.getElementById('Login');
            const logoutDiv = document.getElementById('Logout');
            loginDiv.classList.remove('hidden');
            logoutDiv.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error fetching section content:', error);
        });
}

initLogout();