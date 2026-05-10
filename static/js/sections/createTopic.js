function initTopicCreate() {
    const createButton = document.getElementById("create-topic-button");
    const cancelButton = document.getElementById("cancel-topic-button");
    const TopicDescription = document.getElementById("topic-description");
    createButton.addEventListener("click", () => {
        const topicDescription = TopicDescription.value.trim();
        if (!topicDescription) {
            alert("Please enter a topic description.");
            return;
        }
        fetch("/section/Home/CreateTopic/New", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ topicDescription }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    alert(data.message);
                    console.log('Post successful, redirecting to Home...');
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
                } else if (data.error) {
                    alert(`Creation failed: ${data.error}`);
                }
            })
            .catch((error) => {
                console.error("Error during topic creation:", error);
                alert("An error occurred. Please try again later.");
            });
    });
    cancelButton.addEventListener("click", () => {
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

initTopicCreate();