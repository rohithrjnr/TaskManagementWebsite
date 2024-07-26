import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../task.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  tasks: Task[] = [];
  newTask: any = { title: '', description: '', category: 'Primary Category' }; // Default category
  editMode: boolean = false;
  editTaskId: number | null = null;
  displayedColumns: string[] = ['title', 'description', 'category', 'actions'];
  newColumnName: string = '';
  showAddColumn: boolean = false;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => this.tasks = tasks);
  }

  addTask(): void {
    if (this.newTask.title && this.newTask.description) {
      this.taskService.addTask(this.newTask).subscribe(task => {
        this.tasks.push(task);
        this.newTask = { title: '', description: '', category: 'Primary Category' }; // Reset with default category
        this.resetNewTaskFields();
      });
    }
  }

  resetNewTaskFields(): void {
    this.displayedColumns.forEach(column => {
      if (column !== 'title' && column !== 'description' && column !== 'category' && column !== 'actions') {
        this.newTask[column] = '';
      }
    });
  }

  addColumn(): void {
    if (this.newColumnName) {
      this.displayedColumns.splice(this.displayedColumns.length - 1, 0, this.newColumnName); // Add before 'actions'
      this.tasks.forEach(task => task[this.newColumnName] = ''); // Initialize new column in tasks
      this.newTask[this.newColumnName] = ''; // Initialize new column in newTask
      this.newColumnName = '';
      this.showAddColumn = false;
    }
  }

  saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  editTask(task: Task | null): void {
    if (task) {
      this.newTask = { ...task };
      this.editTaskId = task.id!;
    } else {
      this.newTask = { title: '', description: '', category: 'Primary Category' }; // Reset with default category
      this.editTaskId = null;
      this.resetNewTaskFields();
    }
  }

  updateTask(taskId: number): void {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
      this.tasks[taskIndex] = { ...this.newTask, id: taskId };
      this.saveTasks();
      this.newTask = { title: '', description: '', category: 'Primary Category' }; // Reset with default category
      this.editTaskId = null;
      this.resetNewTaskFields();
    }
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
    this.loadTasks();
  }
}
