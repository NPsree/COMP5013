function initTopic() {

    const claimCards = document.querySelectorAll('.claim-card');
    claimCards.forEach(card => {
        const claimID = card.id;
        const viewButton = card.querySelector('.view-button');
        const claimButton = card.querySelector('.claim-button');
        const replyButton = card.querySelector('.reply-button');

        if (viewButton) {
            viewButton.addEventListener('click', () => {
                window.terminalLog("view claim clicked");
                loadClaim(claimID);
            });
        }
        if (claimButton) {
            claimButton.addEventListener('click', () => {
                loadClaim(claimID);
                setTimeout(() => {
                    const claimContainer1 = document.getElementById("col1");
                    const claimContainer2 = document.getElementById("col2");
                    const createClaimContainer = document.getElementById("claim-creator");
                    const replyContainer = document.querySelector(".reply-container");
                    const claimButton = document.querySelector(".claim-button");
                    const backButton = document.querySelector(".back-button");
                    const replyButton = document.querySelector(".reply-button");
                    claimContainer1.classList.add("hidden");
                    claimContainer2.classList.add("hidden");
                    replyContainer.classList.add("hidden");
                    backButton.classList.add("hidden");
                    claimButton.classList.add("hidden");
                    replyButton.classList.add("hidden");
                    createClaimContainer.classList.remove("hidden");
                }, 100);
            });
        }
        if (replyButton) {
            replyButton.addEventListener('click', ()=>{
                loadClaim(claimID);
                setTimeout(() => {
                    const claimContainer1 = document.getElementById("col1");
                    const claimContainer2 = document.getElementById("col2");
                    const createReplyContainer = document.getElementById("reply-creator");
                    const replyContainer = document.querySelector(".reply-container");
                    const claimButton = document.querySelector(".claim-button");
                    const backButton = document.querySelector(".back-button");
                    const replyButton = document.querySelector(".reply-button");
                    claimContainer1.classList.add("hidden");
                    claimContainer2.classList.add("hidden");
                    replyContainer.classList.add("hidden");
                    backButton.classList.add("hidden");
                    claimButton.classList.add("hidden");
                    replyButton.classList.add("hidden");
                    createReplyContainer.classList.remove("hidden");
                }, 100);
            });
        }
    });

    const topicID = document.querySelector(".topic-window").id;
    const claimContainer1 = document.getElementById("col1");
    const claimContainer2 = document.getElementById("col2");
    const createClaimContainer = document.getElementById("claim-creator");
    const claimButton = document.querySelector(".claim-button");
    const backButton = document.querySelector(".back-button");
    const cancelButton = document.getElementById("cancel-claim-button");
    const createButton = document.getElementById("create-claim-button");
    claimButton.addEventListener("click", () => {
        claimContainer1.classList.add("hidden");
        claimContainer2.classList.add("hidden");
        backButton.classList.add("hidden");
        claimButton.classList.add("hidden");
        createClaimContainer.classList.remove("hidden");
    });
    cancelButton.addEventListener("click", () => {
        claimContainer1.classList.remove("hidden");
        claimContainer2.classList.remove("hidden");
        backButton.classList.remove("hidden");
        claimButton.classList.remove("hidden");
        createClaimContainer.classList.add("hidden");
    });

    createButton.addEventListener("click", () => {
        const ClaimDescription = document.getElementById("claim-description");
        const claimDescription = ClaimDescription.value.trim();
        if (!claimDescription) {
            alert("Please enter a topic description.");
            return;
        }
        fetch("/section/CreateClaim", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ claimDescription, topicID }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                alert(data.message);
                console.log('Post successful, redirecting to Home...');
                loadTopic(topicID);
            } else if (data.error) {
                alert(`Creation failed: ${data.error}`);
            }
        })
        .catch((error) => {
            console.error("Error during topic creation:", error);
            alert("An error occurred. Please try again later.");
        });
    });

    backButton.addEventListener("click", () => {
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
            })
            .catch(error => {
                console.error('Error fetching section content:', error);
            });
    });
}

initTopic();