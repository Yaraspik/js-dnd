import Kanban from "./Kanban";

const kanbanElement = document.querySelector('.kanban');
const kanban = new Kanban(kanbanElement);

kanban.init();
