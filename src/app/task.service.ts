import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description: string;
  category: string;
  [key: string]: any; 
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private storageKey = 'tasks';
  private tasks: Task[] = [];
  private additionalColumnsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private statusOptionsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['Pending', 'Ongoing', 'Completed']);

  constructor() { 
    this.loadAdditionalColumns();
  }

  getTasks(): Observable<Task[]> {
    const tasks = localStorage.getItem(this.storageKey);
    return of(tasks ? JSON.parse(tasks) : []);
  }

  addTask(task: Task): Observable<Task> {
    const tasks = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    task.id = tasks.length ? Math.max(...tasks.map((t: Task) => t.id || 0)) + 1 : 1;
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

  private saveAdditionalColumns(columns: string[]): void {
    localStorage.setItem('additionalColumns', JSON.stringify(columns));
    this.additionalColumnsSubject.next(columns);
  }

  private loadAdditionalColumns(): void {
    const storedColumns = localStorage.getItem('additionalColumns');
    if (storedColumns) {
      this.additionalColumnsSubject.next(JSON.parse(storedColumns));
    }
  }
}
