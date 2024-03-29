import React, { Component } from 'react';
import './App.css';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShows: false,
      currentTaskName: '',
      currentTaskID: '',
      currentTaskPriority: 'Medium',
      taskList: [],
    }

    this.toggleModal = (e) => {
      if (e && e.target.className === "button-link") {
        let currentTaskID = e.currentTarget.id;
        let task = (this.state.taskList.filter(i => i.ID === currentTaskID))[0];
        let currentTaskName = task.name;
        let currentTaskPriority = task.priority;
        this.setState({
          modalShows: !(this.state.modalShows),
          currentTaskID,
          currentTaskName,
          currentTaskPriority,
        })
      } else {
        this.setState({
          modalShows: !(this.state.modalShows),
          currentTaskID: '',
          currentTaskName: '',
          currentTaskPriority: 'Medium',
        });
      }
    };

    this.syncStateFromSessionStorage = () => {
      let taskList = JSON.parse(window.sessionStorage.getItem('taskList'));
      // Check if sessionStorage matches state
      if (taskList !== this.state.taskList) {
        // If task list in SessionStorage is not set, set it to be a blank array
        if (taskList === null | taskList === undefined) {
          let newTaskList = [];
          sessionStorage.setItem('taskList', JSON.stringify(newTaskList));
          return this.setState({
            taskList: newTaskList,
          });
          // If task list exists in session storage, sync it to state
        } else if (Array.isArray(taskList)) {
          return this.setState({
            taskList,
          });
        } else {
          return console.error('Application error. Task list is not an array. taskList:', taskList);
        }
      }
    }

    this.syncStateToSessionStorage = () => {
      sessionStorage.setItem('taskList', JSON.stringify(this.state.taskList));
    }

    this.updateTaskList = () => {
      let uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // If task exists, update the task
      if (this.state.taskList.some(i => i.ID === this.state.currentTaskID)) {
        let thisTaskIndex = this.state.taskList.findIndex(({ ID }) => ID === this.state.currentTaskID);
        let newList = [...this.state.taskList];
        newList[thisTaskIndex] = {
          name: this.state.currentTaskName,
          priority: this.state.currentTaskPriority,
          ID: this.state.currentTaskID,
        };
        this.toggleModal();
        return this.setState({
          taskList: newList,
        });
      }
      // If task does not exist, create it
      else {
        this.toggleModal();
        let task = {
          name: this.state.currentTaskName,
          priority: this.state.currentTaskPriority,
          ID: uniqueId,
        }
        return this.setState((prevState) => ({
          taskList: [...prevState.taskList, task]
        }))
      }
    }

    this.deleteTask = (e) => {
      let thisID = e.target.id.slice('4');
      let thisTaskIndex = this.state.taskList.findIndex(({ ID }) => ID === thisID);
      let newList = [...this.state.taskList];
      newList.splice(thisTaskIndex, 1);
      this.setState({
        taskList: newList,
      })
    }

    this.sortList = (order) => {
      let sorted = this.state.taskList.slice(0);
      function compare(a, b) {
        let taskA = a.priority;
        let taskB = b.priority;

        switch (taskA) {
          case 'High':
            taskA = 0;
            break;
          case 'Medium':
            taskA = 1;
            break;
          default:
            taskA = 2;
            break;
        }

        switch (taskB) {
          case 'High':
            taskB = 0;
            break;
          case 'Medium':
            taskB = 1;
            break;
          default:
            taskB = 2;
            break;
        }

        let comparison = 0;
        if (taskA > taskB) {
          comparison = -1;
        } else if (taskA < taskB) {
          comparison = 1;
        }
        return comparison * order;
      }
      sorted = sorted.sort(compare);
      this.setState({
        taskList: sorted,
      });
    }

    this.setcurrentTaskName = (e) => {
      this.setState({
        currentTaskName: e.target.value,
      })
    }

    this.setcurrentTaskPriority = (e) => {
      this.setState({
        currentTaskPriority: e.target.value,
      })
    }

    this.setcurrentTaskID = (e) => {
      this.setState({
        currentTaskID: e.target.value,
      })
    }

  }
  componentDidMount() {
    this.syncStateFromSessionStorage();
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Task List</h1>
        </header>
        <main>
          <h2>Instructions</h2>
          <ol>
          <li>Add a task: Click the <strong>New Task</strong> button.</li>
          <li>Edit a task: Click the on the task name.</li>
          <li>Delete a task: Click <strong>Delete</strong> next to a task.</li>
          <li>Sort the list: Click <strong>High to Low</strong> or <strong>Low to High</strong>.</li>
          </ol>
          <div>
            Sort: <button className="button-link" onClick={() => this.sortList(-1)}>High to Low</button> <button className="button-link" onClick={() => this.sortList(1)}>Low to High</button>
          </div>
          <TaskList taskList={this.state.taskList} toggleModal={this.toggleModal} deleteTask={e => this.deleteTask(e)} />
          <button onClick={e => { this.toggleModal(e); }}>New Task</button>
          <TaskModal modalShows={this.state.modalShows} toggleModal={this.toggleModal} updateTaskList={this.updateTaskList} setcurrentTaskName={(e) => this.setcurrentTaskName(e)} setcurrentTaskPriority={(e) => this.setcurrentTaskPriority(e)} setcurrentTaskID={(e) => this.setcurrentTaskID(e)} currentTaskID={this.state.currentTaskID} currentTaskName={this.state.currentTaskName} currentTaskPriority={this.state.currentTaskPriority} />
        </main>
      </div>
    );
  };
  componentDidUpdate() {
    this.syncStateToSessionStorage();
  }
};

export default App;
