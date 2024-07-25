import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export interface Task {
  id?: number;
  title: string;
  description: string;
  category: any; 
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  newTask: Task = { title: '', description: '', category: 'Category One' }; // Default category
  categories: string[] = ['Category One']; // Default category
  editMode: boolean = false;
  editTaskId: number | null = null;
  newCategoryName: any;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();
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

  saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  saveCategories(): void {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  addTask(): void {
    if (this.editMode && this.editTaskId !== null) {
      this.updateTask(this.editTaskId);
    } else {
      if (this.newTask.title && this.newTask.description) {
        this.newTask.category = this.categories.length > 0 ? this.categories[0] : 'Category One';
        this.newTask.id = new Date().getTime();
        this.tasks.push(this.newTask);
        this.saveTasks();
        this.newTask = { title: '', description: '', category: this.categories.length > 0 ? this.categories[0] : 'Category One' };
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
      this.newTask = { title: '', description: '', category: 'Category One' }; // Reset with default category
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
    this.loadCategories();
    this.loadTasks();
  }
  deleteCategory(categoryToDelete: string): void {

    const confirmDelete = confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`);
    if (confirmDelete) {
      this.categories = this.categories.filter(category => category !== categoryToDelete);
  
      if (this.categories.length > 0) {
        const newCategory = this.categories[0]; // Use the first category as the new category
        this.tasks.forEach(task => {
          if (task.category === categoryToDelete) {
            task.category = newCategory;
          }
        });
      } else {
        this.tasks.forEach(task => {
          if (task.category === categoryToDelete) {
            task.category = 'Category One';
          }
        });
      }
  
      this.saveCategories();
      this.saveTasks();
      this.loadCategories();
      this.loadTasks();
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
    this.loadTasks();
    this.loadCategories();
  }

  addCategory(): void {
    if (this.newCategoryName && !this.categories.includes(this.newCategoryName)) {
      this.categories.push(this.newCategoryName);
      this.saveCategories();
      this.newCategoryName = '';
    }
  }

  drop(event: CdkDragDrop<Task[]>): void {
    const previousContainerId = event.previousContainer.id;
    const newContainerId = event.container.id;
    
    const movedTask = event.item.data as Task;
  
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Handle moving the item to a new list
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      movedTask.category = newContainerId;
      
      this.saveTasks();
    }
    
    this.updateTasksCategory(previousContainerId, newContainerId);
    this.saveTasks();
    this.loadCategories();
    this.loadTasks();
  }

  getTasksByCategory(category: string): Task[] {
    return this.tasks.filter(task => task.category === category);
  }
}
