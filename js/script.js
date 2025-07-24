const dataBase = localStorage.getItem('todoList') ? JSON.parse(localStorage.getItem('todoList')) : [];

const renderTask = (taskText, dueDate, dueTime, status, index) => {
    // cek status
    const dueDateTime = new Date(`${dueDate}T${dueTime}`);
    const currentDateTime = new Date();

    if (dueDateTime < currentDateTime && status !== 'complete') {
        dataBase[index].status = 'expired';
        localStorage.setItem('todoList', JSON.stringify(dataBase));
    }

    const task = `<div class="task ${(status == 'complete' ? 'done-task-bg' : status === 'expired' ? 'expired-task-bg' : '')}" data-index="${index}"> 
                    <div class="task-main">
                        <p class="task-text ${(status === 'complete' ? 'done-task' : '')}">${taskText}</p>
                    </div>

                    <div class="task-detail">
                        <p class="due-date">Due Date: ${dueDate}</p>
                        <p class="due-date">Due Time: ${dueTime}</p>
                        <button class="${(status == 'complete' ? 'done-task-btn' : status === 'expired' ? 'expired-task-btn' : 'mark-complete')}">
                            <span class="material-symbols-outlined icon-medium">
                                ${(status === 'expired' ? 'delete' : 'check')}
                            </span>
                            ${(status == 'complete' ? 'Complete' : status === 'expired' ? 'Delete' : 'Complete')}
                        </button>
                    </div>
                </div>`

    const todoList = document.getElementById('todo-list');
    todoList.innerHTML += task;
}

// fungsi untuk menilaht detail task
const showDetailTask = () => {
    document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('click', (event) => {
        event.currentTarget.classList.toggle('open');
    });
});
}

// fungsi untuk menandai task sebagai selesai
const markComplete = () => {
    document.querySelectorAll('.mark-complete').forEach(button => {
        button.addEventListener('click', (event) => {
        const task = button.parentElement.parentElement;
        const indexTask = task.getAttribute('data-index');

        dataBase[indexTask].status = 'complete';
        localStorage.setItem('todoList', JSON.stringify(dataBase));
        location.reload();
        });
    })
}

// fungsi untuk menghapus task yang sudah kadaluarsa
const deleteExpired = () => {
    document.querySelectorAll('.expired-task-btn').forEach(button => {
        button.addEventListener('click', (event) => {
        const task = button.parentElement.parentElement;
        const indexTask = task.getAttribute('data-index');

        const newData = dataBase.filter((item, index) => index !== parseInt(indexTask));
        localStorage.setItem('todoList', JSON.stringify(newData));
        location.reload();
        });
    })
}

document.getElementById('add-todo').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('modal-container').classList.remove('hidden');
});

document.getElementById('cancel-btn').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('modal-container').classList.add('hidden');
});

document.getElementById('submit-btn').addEventListener('click', (event) => {
    event.preventDefault();
    const taskText = document.getElementById('task').value;
    const dueDate = document.getElementById('due-date').value;
    const dueTime = document.getElementById('due-time').value;

    const newData = {taskText, dueDate, dueTime, status: 'in progress'}
    dataBase.push(newData);
    localStorage.setItem('todoList', JSON.stringify(dataBase));
    document.getElementById('modal-container').classList.add('hidden');
    location.reload();
});

dataBase.forEach((item, index) => {
    renderTask(item.taskText, item.dueDate, item.dueTime, item.status, index);
});

showDetailTask();
markComplete();
deleteExpired();