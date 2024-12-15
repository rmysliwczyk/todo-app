async function getAvailableUrls() {
    try {
        let url = "get_available_urls";
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const availableUrls = await response.json()
        return availableUrls;
    }
    catch(error) {
        console.log(error.message)
    }
}

async function updateTasklist(tasklist) {
    try {
        let url = `api/tasklists/${tasklist.id}`;
        const response = await fetch(url, {
            "headers": {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
            "method": "PUT",
            "body": JSON.stringify(tasklist)
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const updatedTasklist = await response.json();
        console.log(updatedTasklist);
    }
    catch(error) {
        console.log(error.message)
    }
}

async function getTasklist(tasklistId) {
    try {
        let url = `api/tasklists/${tasklistId}`;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const tasklist = await response.json();
        return tasklist[0];
    }
    catch(error) {
        console.log(error.message)
    }
}

async function deleteTasklist(tasklistId) {
    try {
        let url = `api/tasklists/${tasklistId}`;
        const response = await fetch(url, {
            "headers": {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
            "method": "DELETE"
        });

        document.querySelector(`#tasklist-id-${tasklistId}`).remove();

    }
    catch(error) {
        console.log(error.message)
    }
}

async function getAllTasklists() {
    try {
        let url = `api/tasklists`;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const tasklists = await response.json();
        return tasklists;
    }
    catch(error) {
        console.log(error.message)
    }
}

async function getSelectedTasklistMetadata() {
    try {
        let url = "get_selected_tasklist_metadata";
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const selectedTasklistMetadata = await response.json()

        if(selectedTasklistMetadata.id === null){
            const availableUrls = await getAvailableUrls();
            window.location.href = availableUrls.tasklists;
        }

        return selectedTasklistMetadata;
    }
    catch(error) {
        console.log(error.message)
    }
}

async function selectTasklist(tasklistId) {
    try {
        let url = `select_tasklist/${tasklistId}`;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        selectedTasklistMetadata = await getSelectedTasklistMetadata()
        console.log(selectedTasklistMetadata);
        document.querySelector(".selected-tasklist-info").innerHTML = `Selected tasklist: ${selectedTasklistMetadata.name}`

        availableUrls = await getAvailableUrls();
        window.location.href = availableUrls.tasks;

    }
    catch(error) {
        console.log(error.message)
    }
}

async function showTasklists() {
    const tasklistsUl = document.querySelector("#tasklists-ul");
    const tasklists = await getAllTasklists();
    for (var tasklist of tasklists){
        const tasklistLi = document.createElement("li");
        const tasklistLiRemoveButton = document.createElement("button");
        const tasklistLiRemoveButtonIcon = document.createElement("i");


        tasklistLi.setAttribute("id", `tasklist-id-${tasklist.id}`);
        tasklistLi.innerHTML = `${tasklist.name}: ${tasklist.date}`;
        tasklistLiRemoveButton.setAttribute("id", `tasklist-remove-button-id-${tasklist.id}`);
        tasklistLiRemoveButton.setAttribute("class", "remove-button");
        tasklistLiRemoveButtonIcon.setAttribute("class", "fa-solid fa-xmark");

        const tasklistId = tasklist.id
        tasklistLi.addEventListener("click", function() {
            selectTasklist(tasklistId);
        })

        tasklistLiRemoveButton.addEventListener("click", function() {
            deleteTasklist(tasklistId);
        });

        tasklistLiRemoveButton.append(tasklistLiRemoveButtonIcon);

        tasklistLi.append(tasklistLiRemoveButton);
        tasklistsUl.append(tasklistLi);
    }
}

showTasklists();