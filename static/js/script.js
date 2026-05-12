// window.terminalLog = function(message) {
//     fetch("/debug/log", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message }),
//     })
//     .catch(error => {
//         console.error("terminalLog failed:", error);
//     });
// };

// console.log("hello");

// document.addEventListener('DOMContentLoaded', () => {

//     const loginDiv = document.getElementById('Login');
//     const logoutDiv = document.getElementById('Logout');

//     fetch('/session/status')
//         .then(response => response.json())
//         .then(data => {
//             if (data.loggedIn) {
//                 loginDiv.classList.add('hidden');
//                 logoutDiv.classList.remove('hidden');
//             } else {
//                 loginDiv.classList.remove('hidden');
//                 logoutDiv.classList.add('hidden');
//             }
//         })
//         .catch(error => {
//             console.error('Error checking session:', error);
//             loginDiv.classList.remove('hidden');
//             logoutDiv.classList.add('hidden');
//         });
   
//     const navigatorDivs = document.querySelectorAll('.navigator > div');
//     navigatorDivs.forEach(div => {
//         div.addEventListener('click', () => {
//             const section = div.id;
//             console.log(section + " clicked");
//             fetch(`/section/${section}`)
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('Network response was not ok');
//                     }
//                     return response.text();
//                 })
//                 .then(html => {
//                     const pageDiv = document.querySelector('.Page');
//                     pageDiv.innerHTML = html;
//                     const existingScripts = document.querySelectorAll('.dynamic-script');
//                     existingScripts.forEach(script => script.remove());
//                     const script = document.createElement('script');
//                     script.src = `/static/js/sections/${section.toLowerCase()}.js`;
//                     script.classList.add('dynamic-script');
//                     document.body.appendChild(script);
//                 })
//                 .catch(error => {
//                     console.error('Error fetching section content:', error);
//                 });
//         });
//     });
// });





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

document.addEventListener("DOMContentLoaded", () => {
    checkSessionStatus();
    setupAuthOverlay();
    setupNavigator();

    window.addEventListener("popstate", () => {
        routeFromURL();
    });

    routeFromURL();
});

function checkSessionStatus() {
    const loginDiv = document.getElementById("Login");
    const logoutDiv = document.getElementById("Logout");
    const userGreeting = document.getElementById("user-greeting");

    fetch("/session/status")
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                loginDiv.classList.add("hidden");
                logoutDiv.classList.remove("hidden");

                userGreeting.textContent = `${data.user}`;
                userGreeting.classList.remove("hidden");
            } else {
                loginDiv.classList.remove("hidden");
                logoutDiv.classList.add("hidden");

                userGreeting.textContent = "";
                userGreeting.classList.add("hidden");
            }
        })
        .catch(error => {
            console.error("Error checking session:", error);
            loginDiv.classList.remove("hidden");
            logoutDiv.classList.add("hidden");
            userGreeting.textContent = "";
            userGreeting.classList.add("hidden");
        });
}

function setupAuthOverlay() {
    const loginDiv = document.getElementById("Login");
    const logoutDiv = document.getElementById("Logout");

    const authOverlay = document.getElementById("auth-overlay");
    const authClose = document.getElementById("auth-close");
    const authForm = document.getElementById("auth-form");
    const authTitle = document.getElementById("auth-title");
    const authSubmit = document.getElementById("auth-submit");
    const authSwitch = document.getElementById("auth-switch");
    const authMessage = document.getElementById("auth-message");

    const usernameInput = document.getElementById("auth-username");
    const passwordInput = document.getElementById("auth-password");
    const togglePassword = document.getElementById("toggle-password");

    let authMode = "login";

    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "HIDE";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "SHOW";
        }
    });

    function openAuthOverlay(mode = "login") {
        authMode = mode;
        authMessage.textContent = "";

        if (authMode === "login") {
            authTitle.textContent = "LOGIN";
            authSubmit.textContent = "LOGIN";
            authSwitch.textContent = "Need an account? Register";
        } else {
            authTitle.textContent = "REGISTER";
            authSubmit.textContent = "REGISTER";
            authSwitch.textContent = "Already have an account? Log in";
        }

        authOverlay.classList.remove("hidden");
        usernameInput.focus();
    }

    function closeAuthOverlay() {
        authOverlay.classList.add("hidden");
        authForm.reset();
        authMessage.textContent = "";
    }

    loginDiv.addEventListener("click", () => {
        openAuthOverlay("login");
    });

    logoutDiv.addEventListener("click", () => {
        fetch("/section/Logout", {
            method: "POST",
            credentials: "include"
        })
            .then(() => {
                checkSessionStatus();
            })
            .catch(error => {
                console.error("Logout failed:", error);
            });
    });

    authClose.addEventListener("click", closeAuthOverlay);

    authOverlay.addEventListener("click", event => {
        if (event.target === authOverlay) {
            closeAuthOverlay();
        }
    });

    authSwitch.addEventListener("click", () => {
        openAuthOverlay(authMode === "login" ? "register" : "login");
    });

    authForm.addEventListener("submit", event => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            authMessage.textContent = "Please fill in both username and password.";
            return;
        }

        const endpoint = authMode === "login"
            ? "/section/Login"
            : "/section/Register";

        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                userName: username,
                passwordHash: password
            })
        })
            .then(response => {
                return response.json().then(data => ({
                    ok: response.ok,
                    data
                }));
            })
            .then(result => {
                if (!result.ok) {
                    authMessage.textContent = result.data.error || "Something went wrong.";
                    return;
                }

                if (authMode === "register") {
                    authMessage.textContent = "Registered successfully. Logging you in...";

                    return fetch("/section/Login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            userName: username,
                            passwordHash: password
                        })
                    })
                        .then(response => response.json())
                        .then(() => {
                            checkSessionStatus();
                            closeAuthOverlay();
                        });
                }

                checkSessionStatus();
                closeAuthOverlay();
            })
            .catch(error => {
                console.error("Authentication error:", error);
                authMessage.textContent = "An error occurred. Please try again.";
            });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeAuthOverlay();
        }
    });
}

function setupNavigator() {
    const navigatorDivs = document.querySelectorAll(".navigator > div");

    navigatorDivs.forEach(div => {
        div.addEventListener("click", () => {
            const section = div.id;

            if (section === "Login" || section === "Logout") {
                return;
            }

            console.log(section + " clicked");

            loadSection(section);
        });
    });
}

function pushRoute(path) {
    if (window.location.pathname !== path) {
        history.pushState({}, "", path);
    }
}

function clearDynamicScripts() {
    const existingScripts = document.querySelectorAll(".dynamic-script");
    existingScripts.forEach(script => script.remove());
}

function addDynamicScript(scriptPath) {
    clearDynamicScripts();

    const script = document.createElement("script");
    script.src = scriptPath;
    script.classList.add("dynamic-script");
    document.body.appendChild(script);
}

function loadSection(section, updateURL = true) {
    const sectionURLs = {
        Home: "/",
        Featured: "/featured",
        Popular: "/popular",
        New: "/new",
        Hot: "/hot",
        Controversial: "/controversial",
        Login: "/login",
        Logout: "/logout",
        Register: "/register"
    };

    if (updateURL && sectionURLs[section]) {
        pushRoute(sectionURLs[section]);
    }

    fetch(`/section/${section}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(html => {
            const pageDiv = document.querySelector(".Page");
            pageDiv.innerHTML = html;

            addDynamicScript(`/static/js/sections/${section.toLowerCase()}.js`);

            if (section === "Login" || section === "Logout") {
                checkSessionStatus();
            }
        })
        .catch(error => {
            console.error("Error fetching section content:", error);
        });
}

function loadTopic(topicID, updateURL = true) {
    if (updateURL) {
        pushRoute(`/topic/${topicID}`);
    }

    const pageDiv = document.querySelector(".Page");

    fetch("/topic")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load topic template");
            }
            return response.text();
        })
        .then(html => {
            pageDiv.innerHTML = html;
            viewTopic(topicID);
        })
        .catch(error => {
            console.error("Error loading topic:", error);
        });
}

function viewTopic(topicID) {
    fetch(`/api/topic/${topicID}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.querySelector(".Page").innerHTML = `<h2>${data.error}</h2>`;
                return;
            }

            document.querySelector(".topic-title").textContent = data.topic.topicName;
            document.querySelector(".topic-author").textContent = `By ${data.topic.userName}`;
            document.querySelector(".topic-window").id = topicID;

            const col1 = document.getElementById("col1");
            const col2 = document.getElementById("col2");

            col1.innerHTML = "";
            col2.innerHTML = "";

            const template = document.getElementById("claim-template");

            data.claims.forEach((claim, index) => {
                const claimElement = template.content.cloneNode(true);

                claimElement.querySelector(".claim-title").textContent = claim.text;
                claimElement.querySelector(".claim-author").textContent = `By ${claim.userName}`;
                claimElement.querySelector(".claim-card").id = claim.claimID;

                const viewButton = claimElement.querySelector(".view-button");

                if (viewButton) {
                    viewButton.addEventListener("click", () => {
                        loadClaim(claim.claimID);
                    });
                }

                // const claimButton = claimElement.querySelector(".claim-button");

                // if (claimButton) {
                //     claimButton.addEventListener("click", () => {
                //         loadClaim(claim.claimID);
                //     });
                // }

                const column = index % 2 === 0 ? col1 : col2;
                column.appendChild(claimElement);
            });

            addDynamicScript("/static/js/sections/topic.js");
        })
        .catch(error => {
            console.error("Error loading topic data:", error);
        });
}

function loadClaim(claimID, updateURL = true) {
    if (updateURL) {
        pushRoute(`/claim/${claimID}`);
    }

    console.log("Load claim:", claimID);

    fetch("/claim")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load claim template");
            }
            return response.text();
        })
        .then(html => {
            document.querySelector(".Page").innerHTML = html;
            viewClaim(claimID);
        })
        .catch(error => {
            console.error("Error loading claim:", error);
        });

    // You will fill this in once claim.html / claim.js are ready.
    //
    // fetch("/claim")
    //     .then(response => response.text())
    //     .then(html => {
    //         document.querySelector(".Page").innerHTML = html;
    //         viewClaim(claimID);
    //     });
}

function viewClaim(claimID) {
    fetch('/api/claim/' + claimID)
        .then(response => response.json())
        .then(data => {

            // const existingScripts = document.querySelectorAll(".dynamic-script");
            // existingScripts.forEach((script) => script.remove());

            // const script = document.createElement('script');
            // script.src = '/static/js/sections/claim.js';
            // script.classList.add('dynamic-script');
            // document.body.appendChild(script);

            document.querySelector('.topic-title').textContent = data.claim.text;
            document.querySelector('.topic-author').textContent = `By ${data.claim.userName}`;
            document.querySelector('.topic-window').id = data.claim.claimID;

            const col1 = document.getElementById("col1");
            const col2 = document.getElementById("col2");
            const replycol1 = document.getElementById("reply-col1");
            const replycol2 = document.getElementById("reply-col2");
            const replycol3 = document.getElementById("reply-col3");
            col1.innerHTML = "";
            col2.innerHTML = "";
            replycol1.innerHTML = "";
            replycol2.innerHTML = "";
            replycol3.innerHTML = "";
            const template = document.getElementById("topic-template");
            const replyTemplate = document.getElementById("reply-template");
            data.relatedClaims.forEach((claim, index) => {
                const claimElement = template.content.cloneNode(true);
                const claimCard = claimElement.querySelector(".topic-card");
                claimElement.querySelector(".topic-title").textContent = claim.text;
                claimElement.querySelector(".topic-author").textContent = `By ${claim.userName}`;
                claimCard.id = claim.claimID;
                switch (Number(claim.relationType)) {
                    case 1:
                        claimCard.classList.add("opposed");
                        break;

                    case 2:
                        claimCard.classList.add("equivalent");
                        break;
                }
                const column = index % 2 === 0 ? col1 : col2;
                column.appendChild(claimElement);
            });

            data.replies.forEach((reply, index) => {
                const replyElement = replyTemplate.content.cloneNode(true);
                const replyCard = replyElement.querySelector(".topic-card");
                replyElement.querySelector(".topic-title").textContent = reply.text;
                replyElement.querySelector(".topic-author").textContent = `By ${reply.userName}`;
                replyCard.id = reply.replyID;
                switch (Number(reply.relationType)) {
                    case 1:
                        replyCard.classList.add("clarification");
                        break;

                    case 2:
                        replyCard.classList.add("supporting-argument");
                        break;

                    case 3:
                        replyCard.classList.add("counterargument");
                        break;
                }
                const column = index % 3 === 0 ? replycol1 : index % 3 === 1 ? replycol2 : replycol3;
                column.appendChild(replyElement);
            });

            // const existingScripts = document.querySelectorAll(".dynamic-script");
            // existingScripts.forEach((script) => script.remove());

            // const script = document.createElement('script');
            // script.src = '/static/js/sections/claim.js';
            // script.classList.add('dynamic-script');
            // document.body.appendChild(script);

            addDynamicScript("/static/js/sections/claim.js");

        })
        .catch(error => {
            console.error('Error loading claim:', error);
        });
}

function loadReply(replyID, updateURL = true) {
    if (updateURL) {
        pushRoute(`/reply/${replyID}`);
    }

    console.log("Load reply:", replyID);

    fetch("/reply")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load reply template");
            }
            return response.text();
        })
        .then(html => {
            document.querySelector(".Page").innerHTML = html;
            viewReply(replyID);
        })
        .catch(error => {
            console.error("Error loading reply:", error);
        });

    // You will fill this in once reply.html / reply.js are ready.
    //
    // fetch("/reply")
    //     .then(response => response.text())
    //     .then(html => {
    //         document.querySelector(".Page").innerHTML = html;
    //         viewReply(replyID);
    //     });
}

function viewReply(replyID) {
    fetch('/api/reply/' + replyID)
        .then(response => response.json())
        .then(data =>{
            document.querySelector('.topic-title').textContent = data.reply.text;
            document.querySelector('.topic-author').textContent = 'By ' + data.reply.userName;
            document.querySelector('.topic-window').id = replyID;

            const col1 = document.getElementById("col1");
            const col2 = document.getElementById("col2");
            const col3 = document.getElementById("col3");
            col1.innerHTML = "";
            col2.innerHTML = "";
            col3.innerHTML = "";
            const replyTemplate = document.getElementById("reply-template");
            data.relatedReplies.forEach((reply, index) => {
                const replyElement = replyTemplate.content.cloneNode(true);
                const replyCard = replyElement.querySelector(".topic-card");
                replyElement.querySelector(".topic-title").textContent = reply.text;
                replyElement.querySelector(".topic-author").textContent = `By ${reply.userName}`;
                replyCard.id = reply.replyID;
                switch (Number(reply.relationType)) {
                    case 1:
                        replyCard.classList.add("evidence");
                        break;

                    case 2:
                        replyCard.classList.add("support");
                        break;

                    case 3:
                        replyCard.classList.add("rebuttal");
                        break;
                }
                const column = index % 3 === 0 ? col1 : index % 3 === 1 ? col2 : col3;
                column.appendChild(replyElement);
            });

            // const existingScripts = document.querySelectorAll(".dynamic-script");
            // existingScripts.forEach((script) => script.remove());

            // const script = document.createElement('script');
            // script.src = '/static/js/sections/reply.js';
            // script.classList.add('dynamic-script');
            // document.body.appendChild(script);

            addDynamicScript("/static/js/sections/reply.js");

        })
        .catch(error=>{
            console.error('Error loading reply: ', error);
        })
}


function routeFromURL() {
    const parts = window.location.pathname.split("/").filter(Boolean);

    if (parts.length === 0) {
        loadSection("Home", false);
        return;
    }

    const first = parts[0].toLowerCase();
    const id = parts[1];

    if (first === "topic" && id) {
        loadTopic(id, false);
        return;
    }

    if (first === "claim" && id) {
        loadClaim(id, false);
        return;
    }

    if (first === "reply" && id) {
        loadReply(id, false);
        return;
    }

    const sectionMap = {
        featured: "Featured",
        popular: "Popular",
        new: "New",
        hot: "Hot",
        controversial: "Controversial",
        login: "Login",
        logout: "Logout",
        register: "Register"
    };

    if (sectionMap[first]) {
        loadSection(sectionMap[first], false);
        return;
    }

    loadSection("Home", false);
}