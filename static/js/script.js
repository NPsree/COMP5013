window.terminalLog = function(message) {
    fetch("/debug/log", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    })
    .catch(error => {
        console.error("terminalLog failed:", error);
    });
};

console.log("hello");

document.addEventListener('DOMContentLoaded', () => {

    const loginDiv = document.getElementById('Login');
    const logoutDiv = document.getElementById('Logout');
    // loginDiv.classList.remove('hidden');
    // logoutDiv.classList.add('hidden');

    fetch('/session/status')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                loginDiv.classList.add('hidden');
                logoutDiv.classList.remove('hidden');
            } else {
                loginDiv.classList.remove('hidden');
                logoutDiv.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
            loginDiv.classList.remove('hidden');
            logoutDiv.classList.add('hidden');
        });
   
    const navigatorDivs = document.querySelectorAll('.navigator > div');
    navigatorDivs.forEach(div => {
        div.addEventListener('click', () => {
            const section = div.id;
            console.log(section + " clicked");
            fetch(`/section/${section}`)
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
                    script.src = `/static/js/sections/${section.toLowerCase()}.js`;
                    script.classList.add('dynamic-script');
                    document.body.appendChild(script);
                })
                .catch(error => {
                    console.error('Error fetching section content:', error);
                });
        });
    });
});