import React, { useState, useEffect } from 'react';
import {useInput} from "../util/useInput";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function TodoList() {

    const [TodoData, setTodoData] = useState([]);
    const [editTodo, setEditTodo] = useState({});
    const [modalToggle, setModalToggle] = useState(false);
    const { value:taskDescription, bind:bindTaskDescription, reset:resetTaskDescription } = useInput('');
    const { value:dueDate, bind:bindDueDate, reset:resetDueDate } = useInput('');
    const apiKey = window.$apiKey;  // Read in global variable for API key

    // Get the current tasks on first page load
    useEffect(() => {
        refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function refresh() {
        //Refresh the JSON data
        fetch('https://www.fsi.illinois.edu/demo/data.cfm', {
            method: 'POST',
            body: JSON.stringify({
                action: 'getTasks',
                apiKey: `${apiKey}`,
            })
        })
            .then(response => response.json())
            .then(data => setTodoData( data ));

    }

    function addTask() {
        //
        fetch('https://www.fsi.illinois.edu/demo/data.cfm', {
            method: 'POST',
            body: JSON.stringify({
                action: 'createTask',
                task_description: `${taskDescription}`,
                due_date: `${dueDate}`,
                completed: 0,
                apiKey: `${apiKey}`,
            })
        })
            .then(response => response.json())
            .then(data => console.log({ data }));
        refresh();
        resetTaskDescription();
        resetDueDate();
    }

    function deleteTask(id) {
        //
        let task_id = parseInt(id);
        fetch('https://www.fsi.illinois.edu/demo/data.cfm', {
            method: 'POST',
            body: JSON.stringify({
                action: 'deleteTask',
                task_id: task_id,
                apiKey: `${apiKey}`,
            })
        })
            .then(updated => {
                refresh();
            });
    }

    function updateCompleted(todo) {
        //
        let newTodo = todo;
        newTodo.completed = !newTodo.completed;
        updateTask(newTodo);
    }

    function openEditModal(todo) {
        setEditTodo(todo);
        setModalToggle(true);
    }

    function descriptionHandler(e) {
        editTodo.task_description = e.target.value;
    }

    function handleClose() {
        refresh();
        setModalToggle(false);
    }

    function handleSave() {
        updateTask(editTodo);
        setModalToggle(false);
    }

    function updateTask(todo) {
        //
        let task_id = parseInt(todo.task_id);
        let completed = todo.completed ? 1 : 0;
        fetch('https://www.fsi.illinois.edu/demo/data.cfm', {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateTask',
                task_description: `${todo.task_description}`,
                due_date: `${todo.due_date}`,
                completed: completed,
                task_id: task_id,
                apiKey: `${apiKey}`,
            })
        })
            .then(updated => {
                refresh();
            });
    }

    return (
        <div>
            <form onSubmit={addTask}>
                <h4>Enter a new task below</h4>
                <div className={"form-row"}>
                    <div className={"col"}>
                        <input type={"text"} className={"form-control"} required placeholder={"Task Description"} {...bindTaskDescription} />
                    </div>
                    <div className={"col newtodoform-duedate"}>
                        <input type={"text"} className={"react-datepicker-ignore-onclickoutside"} required pattern="\d{1,2}/\d{1,2}/\d{4}" placeholder={"Due Date (mm/dd/yyyy)"} {...bindDueDate} />
                    </div>
                    <div className={"col"}>
                        <button className={"newtodoform-addbutton"}>Add Task</button>
                    </div>
                </div>
            </form>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th scope="col" className="text-right">Task Description</th>
                    <th scope="col" className="text-right">Due Date</th>
                    <th scope="col" className="text-right">Completed</th>
                    <th scope="col" className="text-right">Edit Task</th>
                    <th scope="col" className="text-right">Delete Task</th>
                </tr>
                </thead>
                <tbody>
                {TodoData.map((todoItem) => {
                    return <tr key={todoItem.task_id}>
                        <td className="text-right">{todoItem.task_description}</td>
                        <td className="text-right">{todoItem.due_date}</td>
                        <td className="text-right"><input type={'checkbox'} checked={!!todoItem.completed} onChange={() => updateCompleted(todoItem)} /></td>
                        <td className="text-right" onClick={() => openEditModal(todoItem)}><button type={"button"} className={"btn btn-primary"}>Edit</button></td>
                        <td className="text-right" onClick={() => deleteTask(todoItem.task_id)}><button type={"button"} className={"btn btn-danger"}>Delete</button></td>
                    </tr>
                })}

                </tbody>
            </table>
            <Modal show={modalToggle} editTodo={editTodo} >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><span className="modal-label">Task Description:</span><input defaultValue={editTodo.task_description} onChange={(e) => descriptionHandler(e)} /></p>
                    <p><span className="modal-label">Due Date:</span><input defaultValue={editTodo.due_date}  /></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save
                    </Button>

                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TodoList;
