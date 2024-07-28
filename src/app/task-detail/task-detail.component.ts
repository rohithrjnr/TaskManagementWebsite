import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../task.service';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  tasks: Task[] = [];
  newTask: any = { title: '', description: '', category: 'Primary Category', status: 'Pending' }; // Default category and status
  editMode: boolean = false;
  editTaskId: number | null = null;
  additionalColumns: string[] = [];
  newColumnName: string = '';
  showAddColumn: boolean = false;
  displayedColumns: string[] = ['title', 'description', 'category', 'status', 'actions'];
  categories: string[] = [];
  categoryControl = new FormControl();
  filteredCategories!: Observable<string[]>;
  status: string[] = ['Pending', 'Ongoing', 'Completed'];
  statusControl = new FormControl();
  filteredStatus!: Observable<string[]>;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(tasks => this.tasks = tasks);
    this.taskService.getAdditionalColumns().subscribe(columns => {
      this.additionalColumns = columns;
      this.updateDisplayedColumns();
    });
    this.loadAdditionalColumns();
    this.loadCategories();
    this.loadStatus();
    this.filteredCategories = this.categoryControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCategories(value))
    );

    this.filteredStatus = this.statusControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterStatus(value))
    );
  }

  loadAdditionalColumns(): void {
    const storedColumns = localStorage.getItem('additionalColumns');
    if (storedColumns) {
      this.additionalColumns = JSON.parse(storedColumns);
      this.updateDisplayedColumns();
    }
  }

  loadCategories(): void {
    const storedCategories = localStorage.getItem('categories');
    this.categories = storedCategories ? JSON.parse(storedCategories) : ['Primary Category']; // Default category
  }

  filterCategories(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.categories.filter(category => category.toLowerCase().includes(filterValue));
  }

  loadStatus(): void {
    const storedStatus = localStorage.getItem('status');
    if (storedStatus) {
      this.status = JSON.parse(storedStatus);
    }
  }

  filterStatus(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.status.filter(status => status.toLowerCase().includes(filterValue));
  }

  addTask(): void {
    if (this.newTask.title && this.newTask.description && this.newTask.status) {
      this.taskService.addTask(this.newTask).subscribe(() => {
        this.newTask = { title: '', description: '', category: 'Primary Category', status: 'Pending' }; // Reset with default category and status
        this.taskService.getTasks().subscribe(tasks => this.tasks = tasks);
      });
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
      this.newTask = { title: '', description: '', category: 'Primary Category', status: 'Pending' }; // Reset with default category and status
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
      this.newTask = { title: '', description: '', category: 'Primary Category', status: 'Pending' }; // Reset with default category and status
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
      this.additionalColumns.splice(index, 1);
      this.tasks.forEach(task => {
        delete task[columnToRemove];
      });
      this.saveAdditionalColumns();
      this.saveTasks();
    }
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = ['title', 'description', 'category', 'status', ...this.additionalColumns, 'actions'];
  }

  isDefaultStatus(status: string): boolean {
    return ['Pending', 'Ongoing', 'Completed'].includes(status);
  }

  removeStatus(index: number): void {
    const statusToRemove = this.status[index];
    const confirmRemove = confirm(`Are you sure you want to remove the status '${statusToRemove}'?`);
    if (confirmRemove) {
      this.status.splice(index, 1);
      this.savestatus();
      this.loadStatus();
    }
  }

  savestatus(): void {
    localStorage.setItem('status', JSON.stringify(this.status));
    this.filteredStatus = this.statusControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterStatus(value))
    );
  }

  addStatus(): void {
    if (this.newTask.status && !this.status.includes(this.newTask.status)) {
      this.status.push(this.newTask.status);
      this.savestatus();
    }
  }

  clearLocalStorage(): void {
    localStorage.clear();
  }
}
