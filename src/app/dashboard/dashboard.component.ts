import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../task.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description: string;
  category: string;
  status: string;
  assignedTo: any;
  [key: string]: any; 
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  newTask: Task = { title: '', description: '', category: 'Primary Category', status: 'Pending',assignedTo:'' }; // Default category
  categories: string[] = ['Primary Task']; // Default category
  categoryControl = new FormControl();
  filteredCategories!: Observable<string[]>;
  status: string[] = ['Pending', 'Ongoing', 'Completed']; // Default status
  statusControl = new FormControl();
  assignedControl = new FormControl();
  filteredstatus!: Observable<string[]>;
  additionalColumns: string[] = [];
  newColumnName: string = '';
  assigned: string[] = ['qa','tester','developer'];
  editMode: boolean = false;
  editTaskId: number | null = null;
  newCategoryName: any;
  newStatus: any;
  filteredAssigned!: Observable<string[]>;
  tester: any;
  constructor(private taskService: TaskService, public dialog: MatDialog, private authService : AuthService) { }

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();
    this.loadStatus();
    this.loadAssigned();
    this.taskService.getAdditionalColumns().subscribe(columns => this.additionalColumns = columns);
    this.loadAdditionalColumns();
    this.filteredCategories = this.categoryControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCategories(value))
    );
    this.filteredstatus = this.statusControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterstatus(value))
    );
    this.filteredAssigned = this.assignedControl.valueChanges.pipe(
      startWith(''),
      map(value => this.assignUser(value))
    );
    this.tester=this.authService.getCurrentUserType();
  }

  loadTasks(): void {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }
  }

  loadCategories(): void {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      this.categories = JSON.parse(storedCategories);
    }
  }

  loadStatus(): void {
    const storedStatus = localStorage.getItem('status');
    if (storedStatus) {
      this.status = JSON.parse(storedStatus);
    }
  }

  assignUser(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.assigned.filter(assigned => assigned.toLowerCase().includes(filterValue));
  }
  loadAssigned(): void {
    const storedStatus = localStorage.getItem('developers');
    if (storedStatus) {
      this.assigned = JSON.parse(storedStatus);
    }
  }


  filterstatus(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.status.filter(status => status.toLowerCase().includes(filterValue));
  }

  filterCategories(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.categories.filter(category => category.toLowerCase().includes(filterValue));
  }

  loadAdditionalColumns(): void {
    const storedColumns = localStorage.getItem('additionalColumns');
    if (storedColumns) {
      this.additionalColumns = JSON.parse(storedColumns);
    }
  }

  saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  saveCategories(): void {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }
  savestatus(): void {
    localStorage.setItem('status', JSON.stringify(this.status));
    this.filteredstatus = this.statusControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterstatus(value))
    );
  }

  saveAdditionalColumns(): void {
    localStorage.setItem('additionalColumns', JSON.stringify(this.additionalColumns));
  }

  addTask(): void {
    if (this.editMode && this.editTaskId !== null) {
      this.updateTask(this.editTaskId);
    } else {
      if (this.newTask.title && this.newTask.description) {
        this.newTask.id = new Date().getTime();
        this.tasks.push(this.newTask);

        const oldCategory = JSON.parse(localStorage.getItem('categories')|| '[]');
        let newCategory=this.newTask.category;
        if(!oldCategory.includes(newCategory)){
          oldCategory.push(newCategory);
          this.taskService.savecategory(oldCategory);
          this.filteredCategories = this.categoryControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCategories(value)) );
        }
        this.saveTasks();
        this.newTask = { title: '', description: '', category: this.categories.length > 0 ? this.categories[0] : 'Primary Task',status: this.status.length > 0 ? this.status[0] : 'Pending',assignedTo:''  };
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
      this.newTask = { title: '', description: '', category: 'Primary Category' ,status: 'Pending',assignedTo:'' }; // Reset with default category
      this.editMode = false;
      this.editTaskId = null;
    }
  }

  confirmDelete(taskId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTask(taskId);
      }
    });
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
  }

  deleteCategory(categoryToDelete: string): void {
    const confirmDelete = confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`);
    if (confirmDelete) {
      this.categories = this.categories.filter(category => category !== categoryToDelete);

      if (this.categories.length > 0) {
        const newCategory = this.categories[0]; 
        this.tasks.forEach(task => {
          if (task.category === categoryToDelete) {
            task.category = newCategory;
          }
        });
      } else {
        this.tasks.forEach(task => {
          if (task.category === categoryToDelete) {
            task.category = 'Primary Category';
          }
        });
      }

      this.saveCategories();
      this.saveTasks();
    }
  }

  renameCategory(oldCategory: string): void {
    const newName = prompt('Enter new category name:', oldCategory);
    if (newName && newName.trim()) {
      const categoryIndex = this.categories.indexOf(oldCategory);
      if (categoryIndex > -1) {
        this.categories[categoryIndex] = newName.trim();
        this.saveCategories();
        this.updateTasksCategory(oldCategory, newName.trim());
      }
    }
  }

  updateTasksCategory(oldCategory: string, newCategory: string): void {
    this.tasks.forEach(task => {
      if (task.category === oldCategory) {
        task.category = newCategory;
      }
    });
    this.saveTasks();
  }

  addCategory(): void {
    if (this.newCategoryName && !this.categories.includes(this.newCategoryName)) {
      this.categories.push(this.newCategoryName);
      this.saveCategories();
      this.newCategoryName = '';
    }
  }


  addStatus(): void {
    const newName = prompt('Enter new Status:');
    if (newName && !this.status.includes(newName)) {
      this.status.push(newName);
      this.savestatus();
    }
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.previousContainer.data[event.previousIndex];
      movedTask.category = event.container.id;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
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
      this.saveTasks();
    }
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
  getTasksByCategory(category: string): Task[] {
    return this.tasks.filter(task => task.category === category);
  }
}
