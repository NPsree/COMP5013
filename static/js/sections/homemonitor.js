function initHome() {

    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
        const topicID = card.id;
        const viewButton = card.querySelector('.view-button');
        const claimButton = card.querySelector('.claim-button');
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                console.log("Topic " + topicID + " clicked");
                loadTopic(topicID);
            });
        }
        if (claimButton) {
            claimButton.addEventListener('click', () => {
                loadTopic(topicID);
                setTimeout(() => {
                    const claimContainer1 = document.getElementById("col1");
                    const claimContainer2 = document.getElementById("col2");
                    const createClaimContainer = document.getElementById("claim-creator");
                    claimContainer1.classList.add("hidden");
                    claimContainer2.classList.add("hidden");
                    createClaimContainer.classList.remove("hidden");
                }, 100);
            });
        }
    });

    const createTopicsButton = document.getElementById("topic-create-button");
    createTopicsButton.addEventListener("click", () => {
        fetch("/section/Home/CreateTopic")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.text();
            })
            .then((html) => {
                const pageDiv = document.querySelector(".Page");
                pageDiv.innerHTML = html;

                const existingScripts = document.querySelectorAll(".dynamic-script");
                existingScripts.forEach((script) => script.remove());
                const script = document.createElement("script");
                script.src = `/static/js/sections/createTopic.js`;
                script.classList.add("dynamic-script");
                document.body.appendChild(script);
            })
            .catch((error) => {
                console.error("Error fetching section content:", error);
            });
    });
}

function loadTopic(topicID) {
    const pageDiv = document.querySelector('.Page');
    fetch('/topic')
        .then(response => response.text())
        .then(html => {
            pageDiv.innerHTML = html; 
            viewTopic(topicID);
        })
        .catch(error => {
            console.error('Error loading topic:', error);
        });
}

function viewTopic(topicID) {
    fetch('/topic/' + topicID)
        .then(response => response.json())
        .then(data => {
            
            document.querySelector('.topic-title').textContent = data.topic.topicName;
            document.querySelector('.topic-author').textContent = `By ${data.topic.userName}`;
            document.querySelector('.topic-window').id = topicID;

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
                // const viewButton = claimElement.querySelector(".view-button");
                // viewButton.addEventListener("click", () => {
                //     window.terminalLog("view claim clicked");
                //     console.log("Claim " + claim.claimID + " clicked");
                //     loadClaim(claim.claimID);
                // });
                const column = index % 2 === 0 ? col1 : col2;
                column.appendChild(claimElement);
            });

            const script = document.createElement('script');
            script.src = '/static/js/sections/topic.js';
            script.classList.add('dynamic-script');
            document.body.appendChild(script);
            
        })
        .catch(error => {
            console.error('Error loading topic:', error);
        });
}

function loadClaim(claimID) {
    console.log("loading claim " + claimID);
    const pageDiv = document.querySelector('.Page');

    fetch('/claim')
        .then(response => response.text())
        .then(html => {
            pageDiv.innerHTML = html;
            viewClaim(claimID);
        })
        .catch(error => {
            console.error('Error loading claim page:', error);
        });
}

function viewClaim(claimID) {
    fetch('/claim/' + claimID)
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

            const existingScripts = document.querySelectorAll(".dynamic-script");
            existingScripts.forEach((script) => script.remove());

            const script = document.createElement('script');
            script.src = '/static/js/sections/claim.js';
            script.classList.add('dynamic-script');
            document.body.appendChild(script);

        })
        .catch(error => {
            console.error('Error loading claim:', error);
        });
}

function loadReply(replyID) {
    console.log("loading reply " + replyID);
    const pageDiv = document.querySelector('.Page');

    fetch('/reply')
        .then(response => response.text())
        .then(html => {
            pageDiv.innerHTML = html;
            viewReply(replyID);
        })
        .catch(error => {
            console.error('Error loading reply page:', error);
        });
}

function viewReply(replyID) {
    fetch('/reply/' + replyID)
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

            const existingScripts = document.querySelectorAll(".dynamic-script");
            existingScripts.forEach((script) => script.remove());

            const script = document.createElement('script');
            script.src = '/static/js/sections/reply.js';
            script.classList.add('dynamic-script');
            document.body.appendChild(script);

        })
        .catch(error=>{
            console.error('Error loading reply: ', error);
        })
}

initHome();