import Task from "./Task";

export default class Kanban {
  constructor(container) {
    this.container = container;
    this.columns = this.container.querySelectorAll('.column');
    this.data = {
      todo: [],
      progress: [],
      done: [],
    };

    this.actualTask = null;
    this.activeColumn = null;
    this.btnOpenControlsCreateTask = this.container.querySelectorAll('.btn-add-task');

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.openControlsCreateTask = this.openControlsCreateTask.bind(this);
    this.cancelTaskCreate = this.cancelTaskCreate.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
  }

  init() {
    this.btnOpenControlsCreateTask.forEach((el) => el.addEventListener('click', this.openControlsCreateTask));
    this.loadData();
    this.drawTaskList();
    this.moveInit();
  }

  createTask(text, columnName) {
    return Task.createTaskElement(text, columnName, this);
  }

  drawTaskList() {
    for (const key in this.data) {
      if (Object.hasOwnProperty.call(this.data, key)) {
        const elements = this.data[key];
        const curColumn = Array.from(this.columns).find((el) => el.dataset.name === key);
        const taskList = curColumn.querySelector('.task-list');
        Array.from(taskList.children).forEach((el) => el.remove());
        elements.forEach((el) => {
          taskList.append(this.createTask(el, key));
        });
      }
    }
  }

  drawNewTask(columnName, task) {
    const curColumn = Array.from(this.columns).find((el) => el.dataset.name === columnName);
    const taskList = curColumn.querySelector('.task-list');
    taskList.append(task);
    this.saveData();
  }

  moveInit() {
    this.container.addEventListener('mousedown', this.onMouseDown);
  }

  moveAt(pageX, pageY) {
    this.actualTask.style.left = pageX - this.actualTask.shiftX + 'px';
    this.actualTask.style.top = pageY - this.actualTask.shiftY + 'px';
  }

  onMouseUp() {
    document.body.style.cursor = 'auto';

    const clone = this.taskClone;
    const initialColumnName = this.actualTask.initialColumnName;

    this.taskClone.classList.remove('clone');
    this.actualTask.remove();
    this.actualTask = this.taskClone;
    this.taskClone = null;

    const columnName = this.activeColumn.dataset.name;

    const textActualTask = this.actualTask.querySelector('.task-content').textContent;

    let indexUpMouse = this.data[columnName].length;

    if (clone.nextSibling) {
      const nextElText = clone.nextSibling.querySelector('.task-content').textContent;
      indexUpMouse = this.data[columnName].findIndex(el => el === nextElText);
    }

    const indexActiveTask = this.data[initialColumnName].findIndex(el => el === textActualTask);

    this.data[initialColumnName].splice(indexActiveTask, 1);
    this.data[columnName].splice(indexUpMouse, 0, this.actualTask.querySelector('.task-content').textContent);

    this.saveData();
    this.drawTaskList();

    this.actualTask.classList.remove('dragged');

    this.actualTask = null;

    document.documentElement.removeEventListener('mouseup', this.onMouseUp);
    document.documentElement.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(e) {
    this.moveAt(e.clientX, e.clientY);

    const _activeColumn = e.target.closest('.column');

    if (!_activeColumn) return;
    this.activeColumn = _activeColumn;

    const taskList = _activeColumn.querySelector('.task-list');
    const mouseTask = e.target.closest('.task');
    const tasks = taskList.querySelectorAll('.task');
    
    if (!tasks) {
      return taskList.append(this.taskClone);
    }

    if(!mouseTask) {
      return;
    }
    
    const verticalTaskCenter = mouseTask.getBoundingClientRect().top + mouseTask.getBoundingClientRect().height / 2;
    
    if (e.clientY > verticalTaskCenter) {
      taskList.insertBefore(this.taskClone, mouseTask.nextSibling);
    } else {
      taskList.insertBefore(this.taskClone, mouseTask);
    }
  }

  onMouseDown(e) {
    e.preventDefault();

    if (e.target.closest('.task-remove')) return;

    this.activeColumn = e.target.closest('.column');
    this.actualTask = e.target.closest('.task');

    if (!this.actualTask) return;

    this.taskClone = this.actualTask.cloneNode(true);
    this.taskClone.classList.remove('dragged');
    this.taskClone.classList.add('task', 'clone');

    document.body.style.cursor = 'grabbing';

    this.actualTask.shiftX = e.clientX - this.actualTask.getBoundingClientRect().left;
    this.actualTask.shiftY = e.clientY - this.actualTask.getBoundingClientRect().top;
    this.actualTask.initialColumn = this.activeColumn;
    this.actualTask.initialColumnName = this.activeColumn.dataset.name;

    this.actualTask.classList.add('dragged');

    this.moveAt(e.pageX, e.pageY);

    document.documentElement.addEventListener('mouseup', this.onMouseUp);
    document.documentElement.addEventListener('mousemove', this.onMouseMove);
  }

  openControlsCreateTask(e) {
    const { activeColumn } = this;

    activeColumn.btnOpenControls = e.target;
    activeColumn.column = activeColumn.btnOpenControls.closest('.column');
    activeColumn.controls = activeColumn.column.querySelector('.btns-create-new-task');
    activeColumn.textarea = activeColumn.controls.querySelector('.task-create-textarea');
    activeColumn.btnAdd = activeColumn.controls.querySelector('.btn-create-card-done');
    activeColumn.btnCancel = activeColumn.controls.querySelector('.btn-create-card-cancel');

    activeColumn.btnOpenControls.classList.add('hide');
    activeColumn.controls.classList.remove('hide');

    activeColumn.textarea.focus();

    activeColumn.btnAdd.addEventListener('click', this.addNewTask);
    activeColumn.btnCancel.addEventListener('click', this.cancelTaskCreate);
  }

  cancelTaskCreate() {
    const { activeColumn } = this;

    activeColumn.btnOpenControls.classList.remove('hide');
    activeColumn.controls.classList.add('hide');

    activeColumn.btnAdd.removeEventListener('click', this.addNewTask);
    activeColumn.btnCancel.removeEventListener('click', this.cancelTaskCreate);
  }

  addNewTask() {
    const { activeColumn } = this;
    const columnName = activeColumn.column.dataset.name;
    const task = this.createTask(this.activeColumn.textarea.value, columnName);

    activeColumn.btnOpenControls.classList.remove('hide');
    activeColumn.controls.classList.add('hide');

    this.data[columnName].push(this.activeColumn.textarea.value);
    this.drawNewTask(columnName, task);
    this.activeColumn.textarea.value = '';

    activeColumn.btnAdd.removeEventListener('click', this.addNewTask);
    activeColumn.btnCancel.removeEventListener('click', this.cancelTaskCreate);
  }

  saveData() {
    localStorage.setItem('data', JSON.stringify(this.data));
  }

  loadData() {
    const savedData = JSON.parse(localStorage.getItem('data'));

    if (savedData) {
      this.data = savedData;
    }
  }
};