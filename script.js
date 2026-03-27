let draggedCard=null;
let rightClickedCard=null;
document.addEventListener("DOMContentLoaded",loadTasksFromLocalStorage);
function addTask(columnId){
    const input=document.getElementById(`${columnId}-input`);
    const taskText=input.value.trim();
    if(taskText===""){
        return;
    }
    const taskDate=new Date().toLocaleString();

    const taskElement=createTaskElement(taskText,taskDate);
    document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
    input.value="";
    updateTaskCount(columnId);
    saveTasksToLocalStorage(columnId,taskText,taskDate);
}
function createTaskElement(taskText,taskDate){
    const taskElement=document.createElement("div");
    taskElement.innerHTML=`<span>${taskText}</span><br><small class="time">${taskDate}</small>`;
    taskElement.classList.add("card");
    taskElement.draggable=true;
    taskElement.addEventListener("dragstart",dragStart);
    taskElement.addEventListener("dragend",dragEnd);
    taskElement.addEventListener("contextmenu",function(event){
        event.preventDefault();
        rightClickedCard=this;
        showContextMenu(event.pageX, event.pageY);
    })

    return taskElement;
}
function dragStart(){
    this.classList.add("dragging");
    draggedCard=this;
}
function dragEnd(){
    this.classList.remove("dragging");
    draggedCard=null;
    ["todo","doing","done"].forEach((columnId)=>{
        updateTaskCount(columnId);
    });
    updateLocalStorage();
} 
const column= document.querySelectorAll(".column .tasks");
column.forEach((column)=>{
    column.addEventListener("dragover",dragOver);
});
function dragOver(event){
    event.preventDefault();
    const draggedCard= document.querySelector(".dragging");
    const afterElement = getDragAfterElement(this,event.pageY);
    if (afterElement==null){
        this.appendChild(draggedCard);
    }
    else{
        this.insertBefore(draggedCard,afterElement);
    }
}
function getDragAfterElement(container,y){
    const draggabbleElements=[...container.querySelectorAll(".card:not(.dragging"),];
    const result= draggabbleElements.reduce((closestElementUnderMouse,currentTask)=>{
        const box=currentTask.getBoundingClientRect();
        const offset= y-box.top-box.height/2;
        if(offset<0&&offset>closestElementUnderMouse.offset){
            return{offset: offset,element:currentTask};
        }
        else{
            return closestElementUnderMouse
        }
    },{offset:Number.NEGATIVE_INFINITY});
    return result.element;
}
const contextmenu= document.querySelector(".context-menu")
function showContextMenu(x,y){
    contextmenu.style.left=`${x}px`;
    contextmenu.style.top=`${y}px`;
    contextmenu.style.display="block";
}
document.addEventListener("click",(e)=>{
    if (!contextmenu.contains(e.target)) {
        contextmenu.style.display="none";
    }
});
function editTask(){
    if(rightClickedCard!=null){
        const newTaskText=prompt("Edit Task -",rightClickedCard.textContent)
        if(newTaskText!=""){
        rightClickedCard.querySelector("span").textContent = newTaskText;
        updateLocalStorage();
        }
    }
}
function deleteTask(){
    if (rightClickedCard!=null){
        const columnId=rightClickedCard.parentElement.id;
        rightClickedCard.remove(); 
        updateTaskCount(columnId.replace("-tasks",""))
        updateLocalStorage();
    }
}
function updateTaskCount(columnId){
    const count=document.querySelectorAll(`#${columnId}-tasks .card`).length;
    document.getElementById(`${columnId}-count`).textContent=count;
}

function saveTasksToLocalStorage(columnId,taskText,taskDate){
    const tasks= JSON.parse(localStorage.getItem(columnId)) || [];
    tasks.push({text:taskText,date:taskDate});
    localStorage.setItem(columnId, JSON.stringify(tasks));
}
function loadTasksFromLocalStorage(){
    ["todo","doing","done"].forEach((columnId)=>{
        const tasks= JSON.parse(localStorage.getItem(columnId)) || [];
        tasks.forEach((task)=>{
            const taskElement=createTaskElement(task.text,task.date);
            document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
        });
        updateTaskCount(columnId);
    })
}
function updateLocalStorage(){
    ["todo","doing","done"].forEach((columnId)=>{
        const tasks =[];
        document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card)=>{
            const taskText=card.querySelector("span").textContent;
            const taskDate = card.querySelector("small").textContent;
            tasks.push({text:taskText,date: taskDate});
        });
        localStorage.setItem(columnId,JSON.stringify(tasks));
    })
}