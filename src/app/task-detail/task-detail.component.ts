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
  additionalColumns: string[] = [];
  newColumnName: string = '';
  showAddColumn: boolean = false;
  displayedColumns: string[] = ['title', 'description', 'category', 'actions'];

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(tasks => this.tasks = tasks);
    this.taskService.getAdditionalColumns().subscribe(columns => {
      this.additionalColumns = columns;
      this.updateDisplayedColumns();
    });
    this.loadAdditionalColumns();
  }

  loadAdditionalColumns(): void {
    const storedColumns = localStorage.getItem('additionalColumns');
    if (storedColumns) {
      this.additionalColumns = JSON.parse(storedColumns);
      this.updateDisplayedColumns();
    }
  }

  addTask(): void {
    if (this.newTask.title && this.newTask.description) {
      this.taskService.addTask(this.newTask);
      this.newTask = { title: '', description: '', category: 'Primary Category' }; // Reset with default category
      this.updateDisplayedColumns();
      this.taskService.getTasks().subscribe(tasks => this.tasks = tasks);
    }
  }

  saveAdditionalColumns(): void {
    localStorage.setItem('additionalColumns', JSON.stringify(this.additionalColumns));
    this.updateDisplayedColumns();
  }


  editTask(task: Task | null): void {
    if (task) {
      this.newTask = { ...task };
      this.editTaskId = task.id!;
    } else {
      this.newTask = { title: '', description: '', category: 'Primary Category' }; // Reset with default category
      this.editTaskId = null;
    }
  }

  saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  updateTask(taskId: number): void {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
      this.tasks[taskIndex] = { ...this.newTask, id: taskId };
      this.saveTasks();
      this.newTask = { title: '', description: '', category: 'Primary Category' }; // Reset with default category
      this.editTaskId = null;
    }
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
  }

  addNewColumn(): void {
    const newColumn = prompt('Enter new column name:');
    if (newColumn && !this.additionalColumns.includes(newColumn)) {
      this.additionalColumns.push(newColumn);
      this.saveAdditionalColumns();
    }
  }

  removeColumn(index: number): void {
    const columnToRemove = this.additionalColumns[index];
    const confirmRemove = confirm(`Are you sure you want to remove the column '${columnToRemove}'?`);
    if (confirmRemove) {
      this.taskService.removeColumn(columnToRemove);
      this.tasks.forEach(task => {
        delete task[columnToRemove];
      });
      this.additionalColumns.splice(index, 1);
      this.saveTasks();
      this.saveAdditionalColumns();
    }
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = ['title', 'description', 'category', ...this.additionalColumns, 'actions'];
  }
}
