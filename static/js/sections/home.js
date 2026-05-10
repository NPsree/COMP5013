function initHomeSetup() {

    fetch("/section/Home/GetTopics")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((topics) => {
            const col1 = document.getElementById("col1");
            const col2 = document.getElementById("col2");
            const col3 = document.getElementById("col3");

            col1.innerHTML = "";
            col2.innerHTML = "";
            col3.innerHTML = "";
            const template = document.getElementById("topic-template");

            topics.forEach((topic, index) => {
                const topicElement = template.content.cloneNode(true);
                topicElement.querySelector(".topic-title").textContent = topic.topicName;
                topicElement.querySelector(".topic-author").textContent = `By ${topic.userName}`;
                topicElement.querySelector(".topic-card").id = topic.topicID;
                const column = index % 3 === 0 ? col1 : index % 3 === 1 ? col2 : col3;
                column.appendChild(topicElement);
            });
            const existingScripts = document.querySelectorAll('.dynamic-script');
            existingScripts.forEach(script => script.remove());
            const script = document.createElement('script');
            script.src = `/static/js/sections/homemonitor.js`;
            script.classList.add('dynamic-script');
            document.body.appendChild(script);
        })
        .catch((error) => {
            console.error("Error fetching topics:", error);
        });
}

initHomeSetup();