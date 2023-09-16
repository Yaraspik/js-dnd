export default class Task {
  static createTaskElement(text, columnName, kanban) {
    const task = document.createElement('div');
    const content = document.createElement('span');
    const removeEl = document.createElement('span');

    task.classList.add('task');
    content.classList.add('task-content');
    removeEl.classList.add('task-remove', 'hide');
    content.textContent = text;
    task.append(content, removeEl);

    task.addEventListener('mouseover', () => {
      removeEl.classList.remove('hide');
    });

    task.addEventListener('mouseout', () => {
      removeEl.classList.add('hide');
    });

    removeEl.addEventListener('click', () => {
      task.remove();
      kanban.data[columnName].find((el, index) => {
        if (el === content) {
          kanban.data[columnName].splice(index, 1);
        }
        return true;
      });
      kanban.saveData();
    });

    return task;
  }
}
