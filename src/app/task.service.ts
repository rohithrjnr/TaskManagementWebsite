import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description: string;
  category: string;
  status: string;
  assignedTo: any;
  [key: string]: any; 
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private storageKey = 'tasks';
  private tasks: Task[] = [];
  private additionalColumnsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private categoriesSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private statusOptionsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor() { 
    this.loadAdditionalColumns();
    this.loadaddcategory();
  }

  getTasks(): Observable<Task[]> {
    const tasks = localStorage.getItem(this.storageKey);
    return of(tasks ? JSON.parse(tasks) : []);
  }

  addTask(task: Task): Observable<Task> {
    const tasks = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    task.id = tasks.length ? Math.max(...tasks.map((t: Task) => t.id || 0)) + 1 : 1;
    let newCategory=task.category;
    const oldCategory = JSON.parse(localStorage.getItem('categories')|| '[]');
    if(!oldCategory.includes(newCategory)){
      oldCategory.push(newCategory);
      this.savecategory(oldCategory);
    }
    tasks.push(task);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    return of(task);
  }

  updateTask(task: Task): void {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.tasks[index] = task;
    }
  }

  deleteTask(taskId: number): Observable<void> {
    let tasks = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    tasks = tasks.filter((task: Task) => task.id !== taskId);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    return of();
  }

  getAdditionalColumns(): Observable<string[]> {
    return this.additionalColumnsSubject.asObservable();
  }

  addColumn(columnName: string): void {
    const columns = this.additionalColumnsSubject.getValue();
    if (!columns.includes(columnName)) {
      columns.push(columnName);
      this.saveAdditionalColumns(columns);
    }
  }

  removeColumn(columnName: string): void {
    const storedColumns = localStorage.getItem('additionalColumns');
    const initialColumns = storedColumns ? JSON.parse(storedColumns) : [];
    const columns = initialColumns.filter((col: string) => col !== columnName);
    console.log(columns)
    this.saveAdditionalColumns(columns);
  }

  removeStatus(columnName: string): void {
    const storedColumns = localStorage.getItem('status');
    const initialColumns = storedColumns ? JSON.parse(storedColumns) : [];
    const columns = initialColumns.filter((col: string) => col !== columnName);
    console.log(columns)
    this.savestatus(columns);
  }

  public savecategory(columns: string[]): void {
    localStorage.setItem('categories', JSON.stringify(columns));
    this.categoriesSubject.next(columns);
  }

  private saveAdditionalColumns(columns: string[]): void {
    localStorage.setItem('additionalColumns', JSON.stringify(columns));
    this.additionalColumnsSubject.next(columns);
  }

  private savestatus(columns: string[]): void {
    localStorage.setItem('status', JSON.stringify(columns));
    this.statusOptionsSubject.next(columns);
  }

  private loadAdditionalColumns(): void {
    const storedColumns = localStorage.getItem('additionalColumns');
    if (storedColumns) {
      this.additionalColumnsSubject.next(JSON.parse(storedColumns));
    }
  }

  private loadaddcategory(): void {
    const storedColumns = localStorage.getItem('categories');
    if (storedColumns) {
      this.categoriesSubject.next(JSON.parse(storedColumns));
    }
  }
}
