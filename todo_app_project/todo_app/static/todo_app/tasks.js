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

async function updateTask(task) {
    try {
        let url = `api/tasks/${task.id}`;
        const response = await fetch(url, {
            "headers": {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
            "method": "PUT",
            "body": JSON.stringify(task)
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }


        const updatedTask = await response.json();
        const taskCheckbox = document.querySelector(`#task-checkbox-id-${task.id}`)
        // This is probably unnecesarry, but just to make sure that checkbox and task are in sync, I'll do it.
        if(updatedTask.done === true) {
            taskCheckbox.setAttribute("checked", "checked");
        } else {
            taskCheckbox.removeAttribute("checked");
        }

        return updatedTask[0];
    }
    catch(error) {
        console.log(error.message)
    }
}

async function toggleTaskDoneStatus(taskId) {

    const task = await getTask(taskId);

    if(task.done === true)
    {
        task.done = false;
    }
    else {
        task.done = true;
    }

    updateTask(task);
}

async function getTask(taskId) {
    try {
        let url = `api/tasks/${taskId}`;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const task = await response.json();
        return task[0];
    }
    catch(error) {
        console.log(error.message)
    }
}

async function deleteTask(taskId) {
    try {
        let url = `api/tasks/${taskId}`;
        const response = await fetch(url, {
            "headers": {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
            "method": "DELETE"
        });

        document.querySelector(`#task-id-${taskId}`).remove();

    }
    catch(error) {
        console.log(error.message)
    }
}

async function getAllTasks(tasklistId) {
    try {
        let url = `api/tasks`;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const tasks = await response.json();
        return tasks;
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

async function editTask(taskId, oldEventListener) {
    const taskEditedLi = document.querySelector(`#task-id-${taskId}`);
    const taskEditedLabel = taskEditedLi.children.item(1)
    const taskEditedEditButton = taskEditedLi.children.item(3);
    const taskEditedInput = document.createElement("input");
    taskEditedInput.value = taskEditedLabel.innerHTML;
    taskEditedInput.setAttribute("id", `task-edit-input-id-${taskId}`);
    taskEditedLi.replaceChild(taskEditedInput, taskEditedLabel);

    taskEditedEditButton.removeEventListener("click", oldEventListener);

    async function clickEventHandler()
    {
        const taskEditedLi = document.querySelector(`#task-id-${taskId}`);
        const taskEditedInput = document.querySelector(`#task-edit-input-id-${taskId}`);
        const taskEditedLabel = document.createElement("label");
        let task = await getTask(taskId);
        task.name = taskEditedInput.value;
        let updatedtask = await updateTask(task);
        taskEditedLabel.innerHTML = `${updatedtask.name}`;
        taskEditedLi.replaceChild(taskEditedLabel, taskEditedInput);
        taskEditedEditButton.addEventListener("click", oldEventListener);
        taskEditedEditButton.removeEventListener("click", clickEventHandler);
    }
    
    taskEditedEditButton.addEventListener("click", clickEventHandler);

    taskEditedInput.addEventListener("keypress", function eventHandler(e){
        if(e.key === "Enter")
        {
            clickEventHandler();
        }
    });
}

async function showTasks() {
    const tasksUl = document.querySelector("#tasks-ul");
    const selectedTasklistMetadata = await getSelectedTasklistMetadata();
    const tasks = await getAllTasks(selectedTasklistMetadata.id);
    for (var task of tasks){
        const taskLi = document.createElement("li");
        const taskLiCheckbox = document.createElement("input");
        const taskLiLabel = document.createElement("label");
        const taskLiRemoveButton = document.createElement("button");
        const taskLiRemoveButtonIcon = document.createElement("i");
        const taskLiEditButton = document.createElement("button");
        const taskLiEditButtonIcon = document.createElement("i");


        taskLi.setAttribute("id", `task-id-${task.id}`);
        taskLiCheckbox.setAttribute("type", "checkbox");
        task.done ? taskLiCheckbox.setAttribute("checked", "checked") : taskLiCheckbox.removeAttribute("checked");
        taskLiCheckbox.setAttribute("id", `task-checkbox-id-${task.id}`);
        taskLiLabel.setAttribute("for", `task-checkbox-id-${task.id}`);
        taskLiLabel.innerHTML = task.name;
        taskLiRemoveButton.setAttribute("id", `task-remove-button-id-${task.id}`);
        taskLiRemoveButton.setAttribute("class", "remove-button");
        taskLiRemoveButtonIcon.setAttribute("class", "fa-solid fa-xmark");
        taskLiEditButton.setAttribute("id", `task-edit-button-id-${task.id}`);
        taskLiEditButton.setAttribute("class", "edit-button");
        taskLiEditButtonIcon.setAttribute("class", "fa-regular fa-pen-to-square");
        

        const taskId = task.id
        taskLiCheckbox.addEventListener("click", function() {
            toggleTaskDoneStatus(taskId);
        });

        taskLiRemoveButton.addEventListener("click", function() {
            deleteTask(taskId);
        });

        taskLiEditButton.addEventListener("click", function eventHandler() {
            editTask(taskId, eventHandler);
        })

        taskLiRemoveButton.append(taskLiRemoveButtonIcon);
        taskLiEditButton.append(taskLiEditButtonIcon);

        taskLi.append(taskLiCheckbox);
        taskLi.append(taskLiLabel);
        taskLi.append(taskLiRemoveButton);
        taskLi.append(taskLiEditButton);
        tasksUl.append(taskLi);
    }
}

showTasks();