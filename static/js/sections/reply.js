function initReply() {
    const replyCards = document.querySelectorAll('.reply-card');
    replyCards.forEach(card => {
        const replyID = card.id;
        const viewButton = card.querySelector('.view-button');
        const replyButton = card.querySelector('.reply-button');
        
        if (viewButton) {
            if (viewButton.dataset.listenerAttached===true) {
                return;
            }
            viewButton.dataset.listenerAttached = true;
            viewButton.addEventListener('click', () => {
                console.log("Reply " + replyID + " clicked");
                loadReply(replyID);
            });
        }
        
        if (replyButton) {
            replyButton.addEventListener('click', ()=>{
                loadReply(replyID);
                setTimeout(() => {
                    const replyContainer1 = document.getElementById("col1");
                    const replyContainer2 = document.getElementById("col2");
                    const replyContainer3 = document.getElementById("col3");
                    const createReplyContainer = document.getElementById("reply-creator");
                    const backButton = document.querySelector(".back-button");
                    const replyButton = document.querySelector(".reply-button");
                    replyContainer1.classList.add("hidden");
                    replyContainer2.classList.add("hidden");
                    replyContainer3.classList.add("hidden");
                    backButton.classList.add("hidden");
                    replyButton.classList.add("hidden");
                    createReplyContainer.classList.remove("hidden");
                }, 100);
            });
        }
    });

    const ReplyID = document.querySelector(".topic-window").id;
    const replyContainer1 = document.getElementById("col1");
    const replyContainer2 = document.getElementById("col2");
    const replyContainer3 = document.getElementById("col3");
    const createReplyContainer = document.getElementById("reply-creator");
    const backButton = document.querySelector(".back-button");
    const replyButton = document.querySelector(".reply-button");
    const cancelReplyButton = document.getElementById("cancel-reply-button");
    const createReplyButton = document.getElementById("create-reply-button");
    let selectedRelType = 0;

    const relationButtons = document.querySelectorAll(".relation-button");
    relationButtons.forEach(button => {
        button.addEventListener("click", () => {
            relationButtons.forEach(btn => btn.classList.remove("selected"));

            button.classList.add("selected");
            //selectedClaimRelType = Number(button.dataset.claimRelType);
            selectedRelType = Number(button.dataset.relType);
            console.log(selectedRelType);
        });
    });

    replyButton.addEventListener("click", () => {
        replyContainer1.classList.add("hidden");
        replyContainer2.classList.add("hidden");
        replyContainer3.classList.add("hidden");
        backButton.classList.add("hidden");
        replyButton.classList.add("hidden");
        createReplyContainer.classList.remove("hidden");
    });
    cancelReplyButton.addEventListener("click", () => {
        replyContainer1.classList.remove("hidden");
        replyContainer2.classList.remove("hidden");
        replyContainer3.classList.remove("hidden");
        backButton.classList.remove("hidden");
        replyButton.classList.remove("hidden");
        createReplyContainer.classList.add("hidden");
    });

    createReplyButton.addEventListener("click", () => {
        const ReplyDescription = document.getElementById("reply-description");
        const replyDescription = ReplyDescription.value.trim();
        if (!replyDescription) {
            alert("Please enter a Reply description");
            return;
        }
        if (!selectedRelType){
            alert("Please select a reply relation type");
            console.log(selectedRelType);
            return;
        }
        fetch("/section/CreateReplytoReply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ replyDescription, ReplyID, selectedRelType }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                alert(data.message);
                console.log('Post successful, redirecting to Home...');
                loadReply(ReplyID);
            } else if (data.error) {
                alert(`Creation failed: ${data.error}`);
            }
        })
        .catch((error) => {
            console.error("Error during Reply creation:", error);
            alert("An error occurred. Please try again later.");
        });
        selectedRelType = 0;
    });

    backButton.addEventListener("click", () => {

        fetch(`/reply/back/${ReplyID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not find previous reply/claim");
                }
                return response.json();
            })
            .then(data => {
                if (data.type === "reply") {
                    loadReply(data.id);
                } else if (data.type === "claim") {
                    loadClaim(data.id);
                }
            })
            .catch(error => {
                console.error("Error going back:", error);
                alert("Could not go back.");
            });

    });

}

initReply();