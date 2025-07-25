const addTaskButton = document.getElementById('add-todo');
const editTaskButton = document.getElementById('edit-todo');
const deleteTaskButton = document.getElementById('delete-todo');
const taskDetails = document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('click', () => {
        task.classList.toggle('open');
    });
});

addTaskButton.addEventListener('click', (event) => {
    event.preventDefault();
    const modalView = document.getElementById('modal-container');
    modalView.classList.remove('hidden');

    cancelModalButton = document.getElementById('cancel-btn').addEventListener('click', () => {
        modalView.classList.add('hidden');
    });
})
