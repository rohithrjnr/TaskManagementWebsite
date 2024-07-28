import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TaskService, Task } from '../task.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-task-report',
  templateUrl: './task-report.component.html',
  styleUrls: ['./task-report.component.css']
})
export class TaskReportComponent implements OnInit, AfterViewInit {
  tasks: Task[] = [];
  columns: string[] = ['Category', 'Status']; // Default columns
  selectedColumn: string = 'Status';

  // Pie Chart Data
  pieChartData: number[] = [];
  pieChartLabels: string[] = [];
  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white' // Change legend labels color to white
        }
      }
    }
  };

  // Bar Chart Data
  barChartData: { labels: string[], datasets: { label: string, data: number[], backgroundColor: string[] }[] } = {
    labels: [],
    datasets: []
  };
  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: 'white' // Change x-axis ticks color to white
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white' // Change y-axis ticks color to white
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white' // Change legend labels color to white
        }
      }
    }
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.columns = this.columns.concat(this.getAdditionalColumns());
      this.generateReport(this.selectedColumn);
      this.generateCategoryReport();
    });
  }

  ngAfterViewInit(): void {
    this.drawBarChart();
    this.drawPieChart();
  }

  getAdditionalColumns(): string[] {
    const additionalColumns = localStorage.getItem('additionalColumns');
    return additionalColumns ? JSON.parse(additionalColumns) : [];
  }

  generateReport(column: string): void {
    const counts: { [key: string]: number } = {};

    this.tasks.forEach(task => {
      const key = task[column.toLowerCase()] || 'Undefined';
      counts[key] = (counts[key] || 0) + 1;
    });

    this.barChartData.labels = Object.keys(counts);
    this.barChartData.datasets = [{
      label: `Tasks by ${column}`,
      data: Object.values(counts),
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(54, 162, 235, 0.6)']
    }];
    this.drawBarChart();
  }

  generateCategoryReport(): void {
    const categoryCounts: { [key: string]: number } = {};

    this.tasks.forEach(task => {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });

    this.pieChartLabels = Object.keys(categoryCounts);
    this.pieChartData = Object.values(categoryCounts);
    this.drawPieChart();
  }

  drawPieChart(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.pieChartLabels,
        datasets: [{
          data: this.pieChartData,
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(54, 162, 235, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1
        }]
      },
      options: this.pieChartOptions
    });
  }

  drawBarChart(): void {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: this.barChartData,
      options: this.barChartOptions
    });
  }

  onColumnChange(): void {
    this.generateReport(this.selectedColumn);
  }
}
