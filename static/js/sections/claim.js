function initClaim() {

    const claimCards = document.querySelectorAll('.claim-card');
    claimCards.forEach(card => {
        const claimID = card.id;
        const viewButton = card.querySelector('.view-button');
        const claimButton = card.querySelector('.claim-button');
        const replyButton = card.querySelector('.reply-button');
        
        if (viewButton) {
            if (viewButton.dataset.listenerAttached===true) {
                return;
            }
            viewButton.dataset.listenerAttached = true;
            viewButton.addEventListener('click', () => {
                console.log("Claim " + claimID + " clicked");
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


    const ClaimID = document.querySelector(".topic-window").id;
    const claimContainer1 = document.getElementById("col1");
    const claimContainer2 = document.getElementById("col2");
    const replyContainer1 = document.getElementById("reply-col1");
    const replyContainer2 = document.getElementById("reply-col2");
    const replyContainer3 = document.getElementById("reply-col3");
    const replyContainer = document.querySelector(".reply-container");
    const createClaimContainer = document.getElementById("claim-creator");
    const createReplyContainer = document.getElementById("reply-creator");
    const claimButton = document.querySelector(".claim-button");
    const backButton = document.querySelector(".back-button");
    const replyButton = document.querySelector(".reply-button");
    const cancelButton = document.getElementById("cancel-claim-button");
    const createButton = document.getElementById("create-claim-button");
    const cancelReplyButton = document.getElementById("cancel-reply-button");
    const createReplyButton = document.getElementById("create-reply-button");
    let selectedClaimRelType = 0;
    let selectedReplyRelType = 0;
    let selectedRelType = 0;



    const relationButtons = document.querySelectorAll(".relation-button");
    relationButtons.forEach(button => {
        button.addEventListener("click", () => {
            relationButtons.forEach(btn => btn.classList.remove("selected"));

            button.classList.add("selected");
            //selectedClaimRelType = Number(button.dataset.claimRelType);
            selectedRelType = Number(button.dataset.relType);
        });
    });

    claimButton.addEventListener("click", () => {
        claimContainer1.classList.add("hidden");
        claimContainer2.classList.add("hidden");
        replyContainer.classList.add("hidden");
        backButton.classList.add("hidden");
        claimButton.classList.add("hidden");
        replyButton.classList.add("hidden");
        createClaimContainer.classList.remove("hidden");
    });
    cancelButton.addEventListener("click", () => {
        claimContainer1.classList.remove("hidden");
        claimContainer2.classList.remove("hidden");
        replyContainer.classList.remove("hidden");
        backButton.classList.remove("hidden");
        claimButton.classList.remove("hidden");
        replyButton.classList.remove("hidden");
        createClaimContainer.classList.add("hidden");
    });

    replyButton.addEventListener("click", () => {
        claimContainer1.classList.add("hidden");
        claimContainer2.classList.add("hidden");
        replyContainer.classList.add("hidden");
        backButton.classList.add("hidden");
        claimButton.classList.add("hidden");
        replyButton.classList.add("hidden");
        createReplyContainer.classList.remove("hidden");
    });
    cancelReplyButton.addEventListener("click", () => {
        claimContainer1.classList.remove("hidden");
        claimContainer2.classList.remove("hidden");
        replyContainer.classList.remove("hidden");
        backButton.classList.remove("hidden");
        claimButton.classList.remove("hidden");
        replyButton.classList.remove("hidden");
        createReplyContainer.classList.add("hidden");
    });

    createButton.addEventListener("click", () => {
        const ClaimDescription = document.getElementById("claim-description");
        const claimDescription = ClaimDescription.value.trim();
        if (!claimDescription) {
            alert("Please enter a Claim description");
            return;
        }
        // if (!selectedClaimRelType){
        //     alert("Please select a claim relation type");
        //     return;
        // }
        if (!selectedRelType){
            alert("Please select a claim relation type");
            return;
        }
        fetch("/section/CreateClaimtoClaim", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // body: JSON.stringify({ claimDescription, ClaimID, selectedClaimRelType }),
            body: JSON.stringify({ claimDescription, ClaimID, selectedRelType }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                alert(data.message);
                console.log('Post successful, redirecting to Home...');
                loadClaim(ClaimID);
            } else if (data.error) {
                alert(`Creation failed: ${data.error}`);
            }
        })
        .catch((error) => {
            console.error("Error during Claim creation:", error);
            alert("An error occurred. Please try again later.");
        });
        selectedRelType = 0;
    });

    createReplyButton.addEventListener("click", () => {
        const ReplyDescription = document.getElementById("reply-description");
        const replyDescription = ReplyDescription.value.trim();
        if (!replyDescription) {
            alert("Please enter a Reply description");
            return;
        }
        // if (!selectedReplyRelType){
        //     alert("Please select a claim relation type");
        //     return;
        // }
        if (!selectedRelType){
            alert("Please select a claim relation type");
            return;
        }
        fetch("/section/CreateReplytoClaim", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // body: JSON.stringify({ replyDescription, ClaimID, selectedReplyRelType }),
            body: JSON.stringify({ replyDescription, ClaimID, selectedRelType }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                alert(data.message);
                console.log('Post successful, redirecting to Home...');
                loadClaim(ClaimID);
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

        fetch(`/claim/back/${ClaimID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not find previous claim/topic");
                }
                return response.json();
            })
            .then(data => {
                if (data.type === "claim") {
                    loadClaim(data.id);
                } else if (data.type === "topic") {
                    loadTopic(data.id);
                }
            })
            .catch(error => {
                console.error("Error going back:", error);
                alert("Could not go back.");
            });

    });
}

initClaim();