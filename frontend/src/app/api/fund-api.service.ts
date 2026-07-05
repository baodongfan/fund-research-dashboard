import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type { FundDetail, FundWithQuote, Quote } from '../models/fund.models';

const API = '';

type ApiResponse<T> = { success: boolean; data: T; error?: string };

@Injectable({ providedIn: 'root' })
export class FundApiService {
  constructor(private http: HttpClient) {}

  // 涨跌榜
  getMovers(sort: 'asc' | 'desc' = 'desc', limit = 20, type?: string): Observable<Quote[]> {
    let params = new HttpParams().set('sort', sort).set('limit', limit);
    if (type) params = params.set('type', type);
    return this.http.get<ApiResponse<Quote[]>>(`${API}/funds/movers`, { params })
      .pipe(map(r => r.data));
  }

  // 成交额榜
  getVolumeTop(limit = 20, type?: string): Observable<Quote[]> {
    let params = new HttpParams().set('limit', limit);
    if (type) params = params.set('type', type);
    return this.http.get<ApiResponse<Quote[]>>(`${API}/funds/volume-top`, { params })
      .pipe(map(r => r.data));
  }

  // 基金列表
  listFunds(opts: { type?: string; search?: string; limit?: number } = {}): Observable<FundWithQuote[]> {
    let params = new HttpParams();
    if (opts.type) params = params.set('type', opts.type);
    if (opts.search) params = params.set('search', opts.search);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<ApiResponse<FundWithQuote[]>>(`${API}/funds`, { params })
      .pipe(map(r => r.data));
  }

  // 基金详情
  getFundDetail(code: string): Observable<FundDetail> {
    return this.http.get<ApiResponse<FundDetail>>(`${API}/funds/${code}`)
      .pipe(map(r => r.data));
  }

  // 多基金对比
  compareFunds(codes: string[]): Observable<{ code: string; name?: string; navSeries: any[] }[]> {
    const params = new HttpParams().set('codes', codes.join(','));
    return this.http.get<ApiResponse<any[]>>(`${API}/funds/compare`, { params })
      .pipe(map(r => r.data));
  }
}
