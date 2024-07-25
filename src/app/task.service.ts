import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private storageKey = 'tasks';

  constructor() { }

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

  deleteTask(taskId: number): Observable<void> {
    let tasks = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    tasks = tasks.filter((task: Task) => task.id !== taskId);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    return of();
  }
}
