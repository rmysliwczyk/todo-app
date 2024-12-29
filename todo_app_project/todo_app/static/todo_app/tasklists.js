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
        return updatedTasklist[0];
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

        selectedTasklistId = await getSelectedTasklistMetadata();
        if(selectedTasklistId == null)
        {
            document.querySelector(".selected-tasklist-info").innerHTML = `No selected tasklist. Please select or create one.`
        }
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
        document.querySelector(".selected-tasklist-info").innerHTML = `Selected tasklist: ${selectedTasklistMetadata.name}`

        availableUrls = await getAvailableUrls();
        window.location.href = availableUrls.tasks;

    }
    catch(error) {
        console.log(error.message)
    }
}

async function editTasklist(tasklistId, oldEventListener) {
    const tasklistEditedLi = document.querySelector(`#tasklist-id-${tasklistId}`);
    const tasklistEditedLabel = tasklistEditedLi.children.item(0)
    const tasklistEditedEditButton = tasklistEditedLi.children.item(2);
    const tasklistEditedInput = document.createElement("input");
    tasklistEditedInput.value = tasklistEditedLabel.innerHTML.split(":")[0];
    tasklistEditedInput.setAttribute("id", `tasklist-edit-input-id-${tasklistId}`);
    tasklistEditedLi.replaceChild(tasklistEditedInput, tasklistEditedLabel);

    tasklistEditedEditButton.removeEventListener("click", oldEventListener);

    async function clickEventHandler() {
        const tasklistEditedLi = document.querySelector(`#tasklist-id-${tasklistId}`);
        const tasklistEditedInput = document.querySelector(`#tasklist-edit-input-id-${tasklistId}`);
        const tasklistEditedLabel = document.createElement("label");
        let tasklist = await getTasklist(tasklistId);
        tasklist.name = tasklistEditedInput.value;
        let updatedTasklist = await updateTasklist(tasklist);
        const selectedTasklistMetadata = await getSelectedTasklistMetadata();
        if(selectedTasklistMetadata.id == updatedTasklist.id)
        {
            document.querySelector(".selected-tasklist-info").innerHTML = `Selected tasklist: ${updatedTasklist.name}`
        }
        tasklistEditedLabel.innerHTML = `${updatedTasklist.name}: ${updatedTasklist.date}`;
        tasklistEditedLi.replaceChild(tasklistEditedLabel, tasklistEditedInput);
        tasklistEditedEditButton.addEventListener("click", oldEventListener);
        tasklistEditedEditButton.removeEventListener("click", clickEventHandler);
        tasklistEditedLabel.addEventListener("click", function() {
            selectTasklist(tasklistId);
        })
    }
    

    tasklistEditedEditButton.addEventListener("click", clickEventHandler);
    tasklistEditedInput.addEventListener("keypress", function eventHandler(e){
        if(e.key === "Enter")
        {
            clickEventHandler();
        }
    });
}

async function showTasklists() {
    const tasklistsUl = document.querySelector("#tasklists-ul");
    const tasklists = await getAllTasklists();
    for (var tasklist of tasklists){
        const tasklistLi = document.createElement("li");
        const tasklistLiLabel = document.createElement("label");
        const tasklistLiRemoveButton = document.createElement("button");
        const tasklistLiRemoveButtonIcon = document.createElement("i");
        const tasklistLiEditButton = document.createElement("button");
        const tasklistLiEditButtonIcon = document.createElement("i");


        tasklistLi.setAttribute("id", `tasklist-id-${tasklist.id}`);
        tasklistLiLabel.innerHTML = `${tasklist.name}: ${tasklist.date}`;
        tasklistLiRemoveButton.setAttribute("id", `tasklist-remove-button-id-${tasklist.id}`);
        tasklistLiRemoveButton.setAttribute("class", "remove-button");
        tasklistLiRemoveButtonIcon.setAttribute("class", "fa-solid fa-xmark");
        tasklistLiEditButton.setAttribute("id", `tasklist-edit-button-id-${tasklist.id}`);
        tasklistLiEditButton.setAttribute("class", "edit-button");
        tasklistLiEditButtonIcon.setAttribute("class", "fa-regular fa-pen-to-square");

        const tasklistId = tasklist.id
        tasklistLiLabel.addEventListener("click", function() {
            selectTasklist(tasklistId);
        })

        tasklistLiRemoveButton.addEventListener("click", function() {
            deleteTasklist(tasklistId);
        });

        tasklistLiEditButton.addEventListener("click", function eventHandler() {
            editTasklist(tasklistId, eventHandler);
        });

        tasklistLiRemoveButton.append(tasklistLiRemoveButtonIcon);
        tasklistLiEditButton.append(tasklistLiEditButtonIcon);

        tasklistLi.append(tasklistLiLabel);
        tasklistLi.append(tasklistLiRemoveButton);
        tasklistLi.append(tasklistLiEditButton);
        tasklistsUl.append(tasklistLi);
    }
}

showTasklists();