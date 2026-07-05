import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FundApiService } from '../../api/fund-api.service';
import type { Quote } from '../../models/fund.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private api = inject(FundApiService);

  moversUp = signal<Quote[]>([]);
  moversDown = signal<Quote[]>([]);
  volumeTop = signal<Quote[]>([]);
  etfMovers = signal<Quote[]>([]);
  loading = signal(true);
  searchQuery = '';
  searchResults = signal<Quote[]>([]);
  showSearch = signal(false);

  ngOnInit() {
    this.api.getMovers('desc', 10).subscribe(data => {
      this.moversUp.set(data);
    });
    this.api.getMovers('asc', 10).subscribe(data => {
      this.moversDown.set(data);
    });
    this.api.getVolumeTop(10).subscribe(data => {
      this.volumeTop.set(data);
    });
    this.api.getMovers('desc', 10, 'ETF').subscribe(data => {
      this.etfMovers.set(data);
      this.loading.set(false);
    });
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.showSearch.set(false);
      return;
    }
    this.showSearch.set(true);
    this.api.listFunds({ search: this.searchQuery, limit: 10 }).subscribe(funds => {
      this.searchResults.set(funds.filter(f => f.quote).map(f => f.quote!));
    });
  }

  selectFund(code: string) {
    this.searchQuery = code;
    this.showSearch.set(false);
  }

  formatChange(pct?: number | null): string {
    if (pct == null) return '--';
    return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
  }

  changeClass(pct?: number | null): string {
    if (pct == null) return '';
    return pct >= 0 ? 'up' : 'down';
  }

  formatAmount(n?: number): string {
    if (n == null) return '--';
    if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
    return n.toFixed(0);
  }

  trackByCode(_: number, item: Quote) { return item.symbol; }
}
