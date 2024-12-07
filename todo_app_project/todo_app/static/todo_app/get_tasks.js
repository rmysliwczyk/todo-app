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
        let url = `update_task/${task.id}`;
        const response = await fetch(url, {
            "headers": {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
            "method": "POST",
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
        let url = `get_task/${taskId}`;
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

async function getAllTasks(tasklistId) {
    try {
        let url = `get_tasks/${tasklistId}`;
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

async function showTasks() {
    const tasksUl = document.querySelector("#tasks-ul");
    const selectedTasklistMetadata = await getSelectedTasklistMetadata();
    const tasks = await getAllTasks(selectedTasklistMetadata.id);
    for (var task of tasks){
        const taskLi = document.createElement("li");
        const taskLiCheckbox = document.createElement("input");
        const taskLiLabel = document.createElement("label");
        
        taskLiCheckbox.setAttribute("type", "checkbox");
        task.done ? taskLiCheckbox.setAttribute("checked", "checked") : taskLiCheckbox.removeAttribute("checked");
        taskLiCheckbox.setAttribute("id", `task-checkbox-id-${task.id}`);
        taskLiLabel.setAttribute("for", `task-checkbox-id-${task.id}`);
        taskLiLabel.innerHTML = task.name;

        const taskId = task.id
        taskLiCheckbox.addEventListener("click", function() {
            toggleTaskDoneStatus(taskId);
        });

        taskLi.append(taskLiCheckbox);
        taskLi.append(taskLiLabel);
        tasksUl.append(taskLi);
    }
}

showTasks();