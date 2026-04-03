import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = `${environment.apiUrl}/test-management`;

  constructor(private http: HttpClient) {}

  // Test Cases
  getTestCases(): Observable<any> {
    return this.http.get(`${this.base}/cases`);
  }

  getTestCasesGrouped(): Observable<any> {
    return this.http.get(`${this.base}/cases/grouped`);
  }

  // Test Runs
  getTestRuns(page = 1, limit = 20): Observable<any> {
    return this.http.get(`${this.base}/runs?page=${page}&limit=${limit}`);
  }

  getTestRunById(id: string): Observable<any> {
    return this.http.get(`${this.base}/runs/${id}`);
  }

  createTestRun(testerName: string, notes?: string): Observable<any> {
    return this.http.post(`${this.base}/runs`, { testerName, notes });
  }

  completeTestRun(runId: string): Observable<any> {
    return this.http.patch(`${this.base}/runs/${runId}/complete`, {});
  }

  // Test Results
  updateTestResult(resultId: string, status: string, comment?: string): Observable<any> {
    return this.http.patch(`${this.base}/results/${resultId}`, { status, comment });
  }

  // Stats
  getStats(days = 30): Observable<any> {
    return this.http.get(`${this.base}/stats?days=${days}`);
  }
}
