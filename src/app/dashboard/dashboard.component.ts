import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';


export interface Task {
  id?: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  newTask: Task = { title: '', description: '' };
  editMode: boolean = false;
  editTaskId: number | null = null;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }
  }

  saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  addTask(): void {
    if (this.editMode && this.editTaskId !== null) {
      this.updateTask(this.editTaskId);
    } else {
      if (this.newTask.title && this.newTask.description) {
        this.newTask.id = new Date().getTime();
        this.tasks.push(this.newTask);
        this.saveTasks();
        this.newTask = { title: '', description: '' };
      }
    }
  }

  editTask(task: Task): void {
    this.newTask = { ...task };
    this.editMode = true;
    this.editTaskId = task.id!;
  }

  updateTask(taskId: number): void {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
      this.tasks[taskIndex] = { ...this.newTask, id: taskId };
      this.saveTasks();
      this.newTask = { title: '', description: '' };
      this.editMode = false;
      this.editTaskId = null;
    }
  }

  confirmDelete(taskId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTask(taskId);
        this.loadTasks();
      }
    });
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
  }
}
