import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskReportComponent } from './task-report/task-report.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'task-detail', component: TaskDetailComponent },
  { path: 'task-report', component: TaskReportComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
