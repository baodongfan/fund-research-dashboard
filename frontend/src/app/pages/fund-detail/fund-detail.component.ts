import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FundApiService } from '../../api/fund-api.service';
import type { FundDetail, Manager } from '../../models/fund.models';

type Tab = 'overview' | 'holdings' | 'allocation' | 'managers' | 'performance';

@Component({
  selector: 'app-fund-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './fund-detail.component.html',
  styleUrl: './fund-detail.component.scss'
})
export class FundDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(FundApiService);

  code = signal('');
  detail = signal<FundDetail | null>(null);
  loading = signal(true);
  activeTab = signal<Tab>('overview');
  tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: '概览' },
    { key: 'holdings', label: '持仓' },
    { key: 'allocation', label: '资产配置' },
    { key: 'managers', label: '基金经理' },
    { key: 'performance', label: '业绩表现' },
  ];

  navChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  navChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { maxTicksLimit: 5 } }
    }
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      const code = params['code'];
      this.code.set(code);
      this.loadDetail(code);
    });
  }

  setTab(tab: Tab) { this.activeTab.set(tab); }

  formatChange(pct?: number | null): string {
    if (pct == null) return '--';
    return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
  }

  changeClass(pct?: number | null): string {
    if (pct == null) return '';
    return pct >= 0 ? 'up' : 'down';
  }

  formatRatio(n?: number): string {
    if (n == null) return '--';
    return n.toFixed(2) + '%';
  }

  formatMoney(n?: number): string {
    if (n == null) return '--';
    if (n >= 1e8) return (n / 1e8).toFixed(2) + ' 亿';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + ' 万';
    return n.toFixed(2);
  }

  getManagerScore(manager: Manager, index: number): number | null {
    return manager.power?.scores[index] ?? null;
  }

  managerRadarLabels(manager?: Manager): string[] {
    return manager?.power?.categories ?? ['选证', '收益', '抗风险', '稳定性', '择时'];
  }

  managerRadarData(manager?: Manager): ChartData<'radar'> {
    const labels = this.managerRadarLabels(manager);
    const scores = (manager?.power?.scores ?? []).map(s => s ?? 0);
    return {
      labels,
      datasets: [{
        data: scores,
        borderColor: '#1a1a1a',
        backgroundColor: 'rgba(26,26,26,0.08)',
        pointBackgroundColor: '#1a1a1a',
        pointRadius: 3,
      }]
    };
  }

  managerRadarOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: 'rgba(0,0,0,0.08)' },
        pointLabels: { font: { size: 11 }, color: '#595959' }
      }
    },
    plugins: { legend: { display: false } }
  };

  private loadDetail(code: string) {
    this.loading.set(true);
    this.api.getFundDetail(code).subscribe({
      next: data => {
        this.detail.set(data);
        this.buildNavChart(data.navSeries ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private buildNavChart(series: any[]) {
    const labels = series.map(p => p.date?.substring(5) ?? '').slice(-90);
    const values = series.map(p => p.nav).slice(-90);
    if (values.length === 0) return;

    const first = values[0];
    const colors = values.map(v => {
      if (v >= first) return '#c8302a';
      return '#00875a';
    });

    this.navChartData = {
      labels,
      datasets: [{
        data: values,
        borderColor: '#1a1a1a',
        backgroundColor: 'rgba(26,26,26,0.04)',
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.2
      }]
    };
  }
}
