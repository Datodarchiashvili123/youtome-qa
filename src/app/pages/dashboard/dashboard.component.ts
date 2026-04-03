import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white">ტესტირების დეშბორდი</h1>
          <p class="text-gray-400 mt-1">ყოველდღიური ტესტირების მართვა</p>
        </div>
        <button (click)="showModal.set(true)" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          ახალი ტესტ რანი
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div class="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">სულ რანები</p>
          </div>
          <p class="text-4xl font-bold text-white">{{ runs().length }}</p>
        </div>
        <div class="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">საშუალო გავლის %</p>
          </div>
          <p class="text-4xl font-bold text-green-400">{{ avgPassRate() }}%</p>
        </div>
        <div class="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">სულ ჩავარდნილი</p>
          </div>
          <p class="text-4xl font-bold text-red-400">{{ totalFailed() }}</p>
        </div>
        <div class="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">მიმდინარე</p>
          </div>
          <p class="text-4xl font-bold text-yellow-400">{{ inProgress() }}</p>
        </div>
      </div>

      <!-- Runs Table -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">თარიღი</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ტესტერი</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">სულ</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">გავლილი</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">ჩავარდნილი</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">გამოტოვ.</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">%</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">სტატუსი</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            @for (run of runs(); track run.id) {
              <tr class="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td class="px-6 py-4 text-sm text-white">{{ run.date }}</td>
                <td class="px-6 py-4 text-sm text-gray-300">{{ run.testerName }}</td>
                <td class="px-6 py-4 text-sm text-center text-gray-300">{{ run.totalCases }}</td>
                <td class="px-6 py-4 text-sm text-center text-green-400">{{ run.passedCases }}</td>
                <td class="px-6 py-4 text-sm text-center text-red-400">{{ run.failedCases }}</td>
                <td class="px-6 py-4 text-sm text-center text-gray-500">{{ run.skippedCases }}</td>
                <td class="px-6 py-4 text-sm text-center text-white font-semibold">
                  {{ run.totalCases > 0 ? ((run.passedCases / run.totalCases) * 100).toFixed(0) : 0 }}%
                </td>
                <td class="px-6 py-4 text-center">
                  <span [class]="run.status === 'completed' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'"
                    class="px-3 py-1 rounded-full text-xs font-semibold border">
                    {{ run.status === 'completed' ? 'დასრულებული' : 'მიმდინარე' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <a [routerLink]="['/run', run.id]" class="px-4 py-2 text-sm text-orange-400 hover:bg-orange-500/10 rounded-lg transition">
                    {{ run.status === 'completed' ? 'ნახვა' : 'გაგრძელება' }}
                  </a>
                </td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  ჯერ არ არის ტესტ რანები. დააჭირეთ "ახალი ტესტ რანი" ღილაკს.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- New Run Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" (click)="showModal.set(false)">
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
            <h2 class="text-lg font-bold text-white mb-4">ახალი ტესტ რანი</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">ტესტერის სახელი *</label>
                <input type="text" [(ngModel)]="testerName" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500" placeholder="მაგ: გიორგი" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">შენიშვნა</label>
                <textarea [(ngModel)]="runNotes" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 resize-none" rows="2" placeholder="არასავალდებულო"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button (click)="showModal.set(false)" class="px-4 py-2 text-gray-400 hover:text-white transition">გაუქმება</button>
              <button (click)="createRun()" [disabled]="!testerName || creating()" class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition disabled:opacity-50">
                {{ creating() ? 'იქმნება...' : 'შექმნა' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  runs = signal<any[]>([]);
  showModal = signal(false);
  creating = signal(false);
  testerName = '';
  runNotes = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() { this.loadRuns(); }

  loadRuns() {
    this.api.getTestRuns(1, 50).subscribe({
      next: (res) => this.runs.set(res.data?.runs || res.runs || []),
      error: () => {},
    });
  }

  avgPassRate(): number {
    const completed = this.runs().filter(r => r.status === 'completed' && r.totalCases > 0);
    if (!completed.length) return 0;
    const avg = completed.reduce((sum, r) => sum + (r.passedCases / r.totalCases) * 100, 0) / completed.length;
    return Math.round(avg);
  }

  totalFailed(): number {
    return this.runs().reduce((sum, r) => sum + r.failedCases, 0);
  }

  inProgress(): number {
    return this.runs().filter(r => r.status === 'in_progress').length;
  }

  createRun() {
    if (!this.testerName) return;
    this.creating.set(true);
    this.api.createTestRun(this.testerName, this.runNotes || undefined).subscribe({
      next: (res) => {
        const run = res.data || res;
        this.router.navigate(['/run', run.id]);
      },
      error: () => this.creating.set(false),
    });
  }
}
