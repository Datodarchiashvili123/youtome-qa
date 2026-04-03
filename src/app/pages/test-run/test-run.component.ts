import { Component, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

type ResultStatus = 'passed' | 'failed' | 'skipped' | 'pending';
type FilterTab = 'all' | ResultStatus;

interface TestCaseData {
  id: string;
  code: string;
  title: string;
  priority: string;
  precondition: string;
  steps: string;
  expectedResult: string;
  category: string;
}

interface TestResultData {
  id: string;
  testCaseId: string;
  testRunId: string;
  status: ResultStatus;
  comment: string | null;
  testCase: TestCaseData;
}

interface CategoryGroup {
  category: string;
  results: TestResultData[];
  collapsed: boolean;
  passedCount: number;
  failedCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-test-run',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center h-96">
        <div class="text-gray-400">იტვირთება...</div>
      </div>
    } @else if (run()) {
      <div class="p-6 lg:p-8 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <a routerLink="/dashboard" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            უკან
          </a>
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-white">ტესტ რანი - {{ run()!.date }}</h1>
              <p class="text-gray-400 mt-1">ტესტერი: <span class="text-white font-medium">{{ run()!.testerName }}</span></p>
            </div>
            <div class="flex items-center gap-3">
              @if (run()!.status === 'in_progress') {
                <button
                  (click)="completeRun()"
                  [disabled]="completing()"
                  class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  {{ completing() ? 'სრულდება...' : 'დასრულება' }}
                </button>
              } @else {
                <span class="px-4 py-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg text-sm font-semibold">
                  დასრულებული
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-400">პროგრესი</span>
            <span class="text-sm text-white font-semibold">{{ completedCount() }}/{{ totalCount() }} შესრულებული</span>
          </div>
          <div class="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
            @if (passedCount() > 0) {
              <div class="bg-green-500 h-full transition-all duration-500" [style.width.%]="passedPercent()"></div>
            }
            @if (failedCount() > 0) {
              <div class="bg-red-500 h-full transition-all duration-500" [style.width.%]="failedPercent()"></div>
            }
            @if (skippedCount() > 0) {
              <div class="bg-gray-500 h-full transition-all duration-500" [style.width.%]="skippedPercent()"></div>
            }
          </div>
          <div class="flex items-center gap-6 mt-3 text-xs">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> გავლილი: {{ passedCount() }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> ჩავარდნილი: {{ failedCount() }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-gray-500"></span> გამოტოვებული: {{ skippedCount() }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> მომლოდინე: {{ pendingCount() }}</span>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1.5 overflow-x-auto">
          @for (tab of filterTabs; track tab.key) {
            <button
              (click)="activeFilter.set(tab.key)"
              [class]="activeFilter() === tab.key
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2">
              {{ tab.label }}
              <span [class]="activeFilter() === tab.key ? 'bg-gray-600' : 'bg-gray-800'"
                class="px-2 py-0.5 rounded-full text-xs">
                {{ tab.key === 'all' ? totalCount() : statusCount(tab.key) }}
              </span>
            </button>
          }
        </div>

        <!-- Category Sections -->
        @for (group of filteredGroups(); track group.category) {
          <div class="mb-4">
            <!-- Category Header -->
            <button
              (click)="toggleCategory(group.category)"
              class="w-full flex items-center justify-between px-5 py-3.5 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800/70 transition">
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-gray-500 transition-transform"
                  [class.rotate-90]="!isCategoryCollapsed(group.category)"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-white font-semibold">{{ group.category }}</span>
                <span class="text-xs text-gray-500">({{ group.results.length }})</span>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-green-400">{{ group.passedCount }} გავლილი</span>
                <span class="text-red-400">{{ group.failedCount }} ჩავარდნილი</span>
              </div>
            </button>

            <!-- Test Case Cards -->
            @if (!isCategoryCollapsed(group.category)) {
              <div class="mt-2 space-y-2 pl-2">
                @for (result of group.results; track result.id) {
                  <div class="bg-gray-900/70 border border-gray-800 rounded-xl overflow-hidden transition hover:border-gray-700">
                    <!-- Card Main Row -->
                    <div class="flex items-center gap-4 px-5 py-4">
                      <!-- Left: Info -->
                      <div class="flex-1 min-w-0 cursor-pointer" (click)="toggleExpand(result.id)">
                        <div class="flex items-center gap-2.5 mb-1">
                          <span class="text-xs font-mono text-gray-500">{{ result.testCase.code }}</span>
                          <span [class]="priorityClass(result.testCase.priority)"
                            class="px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {{ result.testCase.priority }}
                          </span>
                          <!-- Status Badge -->
                          <span [class]="statusBadgeClass(result.status)"
                            class="px-2 py-0.5 rounded text-[10px] font-semibold">
                            {{ statusLabel(result.status) }}
                          </span>
                        </div>
                        <p class="text-sm text-white font-medium truncate">{{ result.testCase.title }}</p>
                      </div>

                      <!-- Right: Action Buttons -->
                      @if (run()!.status === 'in_progress') {
                        <div class="flex items-center gap-2 shrink-0">
                          <button
                            (click)="setStatus(result, 'passed')"
                            [disabled]="result.status === 'passed' || updatingId() === result.id"
                            [class]="result.status === 'passed' ? 'bg-green-500 text-white border-green-500' : 'border-gray-700 text-gray-400 hover:border-green-500 hover:text-green-400 hover:bg-green-500/10'"
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-70">
                            ✓ გავლილი
                          </button>
                          <button
                            (click)="setStatus(result, 'failed')"
                            [disabled]="result.status === 'failed' || updatingId() === result.id"
                            [class]="result.status === 'failed' ? 'bg-red-500 text-white border-red-500' : 'border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10'"
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-70">
                            ✗ ჩავარდნილი
                          </button>
                          <button
                            (click)="setStatus(result, 'skipped')"
                            [disabled]="result.status === 'skipped' || updatingId() === result.id"
                            [class]="result.status === 'skipped' ? 'bg-gray-500 text-white border-gray-500' : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300 hover:bg-gray-500/10'"
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-70">
                            ⏭ გამოტოვ.
                          </button>
                        </div>
                      }
                    </div>

                    <!-- Expanded Details -->
                    @if (isExpanded(result.id)) {
                      <div class="px-5 pb-4 border-t border-gray-800 pt-4 space-y-3">
                        @if (result.testCase.precondition) {
                          <div>
                            <p class="text-xs font-semibold text-gray-500 uppercase mb-1">წინაპირობა</p>
                            <p class="text-sm text-gray-300">{{ result.testCase.precondition }}</p>
                          </div>
                        }
                        <div>
                          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">ნაბიჯები</p>
                          <ol class="list-decimal list-inside space-y-1">
                            @for (step of parseSteps(result.testCase.steps); track $index) {
                              <li class="text-sm text-gray-300">{{ step }}</li>
                            }
                          </ol>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">მოსალოდნელი შედეგი</p>
                          <p class="text-sm text-gray-300">{{ result.testCase.expectedResult }}</p>
                        </div>
                      </div>
                    }

                    <!-- Failure Comment -->
                    @if (result.status === 'failed' && run()!.status === 'in_progress') {
                      <div class="px-5 pb-4" [class.border-t]="!isExpanded(result.id)" [class.border-gray-800]="!isExpanded(result.id)" [class.pt-3]="!isExpanded(result.id)">
                        <label class="text-xs font-semibold text-red-400 uppercase mb-1 block">კომენტარი (რატომ ჩავარდა?)</label>
                        <div class="flex gap-2">
                          <textarea
                            [ngModel]="result.comment || ''"
                            (ngModelChange)="onCommentChange(result, $event)"
                            class="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
                            rows="2"
                            placeholder="აღწერეთ პრობლემა..."></textarea>
                          <button
                            (click)="saveComment(result)"
                            [disabled]="savingCommentId() === result.id"
                            class="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-600/30 transition self-end disabled:opacity-50">
                            {{ savingCommentId() === result.id ? '...' : 'შენახვა' }}
                          </button>
                        </div>
                      </div>
                    }

                    <!-- Show saved comment in read mode -->
                    @if (result.status === 'failed' && result.comment && run()!.status === 'completed') {
                      <div class="px-5 pb-4 border-t border-gray-800 pt-3">
                        <p class="text-xs font-semibold text-red-400 uppercase mb-1">კომენტარი</p>
                        <p class="text-sm text-gray-300">{{ result.comment }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        } @empty {
          <div class="text-center py-16 text-gray-500">
            ფილტრის შედეგად ტესტ ქეისები ვერ მოიძებნა
          </div>
        }
      </div>
    } @else {
      <div class="flex items-center justify-center h-96">
        <div class="text-center">
          <p class="text-gray-400 mb-4">ტესტ რანი ვერ მოიძებნა</p>
          <a routerLink="/dashboard" class="text-orange-400 hover:text-orange-300 transition">დეშბორდზე დაბრუნება</a>
        </div>
      </div>
    }
  `,
})
export class TestRunComponent implements OnInit {
  // State
  run = signal<any>(null);
  results = signal<TestResultData[]>([]);
  loading = signal(true);
  completing = signal(false);
  updatingId = signal<string | null>(null);
  savingCommentId = signal<string | null>(null);
  activeFilter = signal<FilterTab>('all');
  expandedIds = signal<Set<string>>(new Set());
  collapsedCategories = signal<Set<string>>(new Set());
  private commentDrafts = new Map<string, string>();

  // Filter tabs config
  readonly filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'ყველა' },
    { key: 'pending', label: 'მომლოდინე' },
    { key: 'passed', label: 'გავლილი' },
    { key: 'failed', label: 'ჩავარდნილი' },
    { key: 'skipped', label: 'გამოტოვებული' },
  ];

  // Computed values
  totalCount = computed(() => this.results().length);
  passedCount = computed(() => this.results().filter(r => r.status === 'passed').length);
  failedCount = computed(() => this.results().filter(r => r.status === 'failed').length);
  skippedCount = computed(() => this.results().filter(r => r.status === 'skipped').length);
  pendingCount = computed(() => this.results().filter(r => r.status === 'pending').length);
  completedCount = computed(() => this.passedCount() + this.failedCount() + this.skippedCount());

  passedPercent = computed(() => this.totalCount() ? (this.passedCount() / this.totalCount()) * 100 : 0);
  failedPercent = computed(() => this.totalCount() ? (this.failedCount() / this.totalCount()) * 100 : 0);
  skippedPercent = computed(() => this.totalCount() ? (this.skippedCount() / this.totalCount()) * 100 : 0);

  filteredGroups = computed(() => {
    const filter = this.activeFilter();
    const allResults = this.results();
    const filtered = filter === 'all' ? allResults : allResults.filter(r => r.status === filter);

    const categoryMap = new Map<string, TestResultData[]>();
    for (const result of filtered) {
      const cat = result.testCase.category;
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(result);
    }

    const groups: CategoryGroup[] = [];
    for (const [category, catResults] of categoryMap) {
      const allInCategory = allResults.filter(r => r.testCase.category === category);
      groups.push({
        category,
        results: catResults,
        collapsed: this.collapsedCategories().has(category),
        passedCount: allInCategory.filter(r => r.status === 'passed').length,
        failedCount: allInCategory.filter(r => r.status === 'failed').length,
        totalCount: allInCategory.length,
      });
    }

    return groups;
  });

  private runId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.runId = this.route.snapshot.paramMap.get('id') || '';
    if (this.runId) {
      this.loadRun();
    } else {
      this.loading.set(false);
    }
  }

  loadRun(): void {
    this.loading.set(true);
    this.api.getTestRunById(this.runId).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.run.set(data);
        this.results.set(data.results || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  statusCount(status: ResultStatus): number {
    return this.results().filter(r => r.status === status).length;
  }

  toggleCategory(category: string): void {
    const current = new Set(this.collapsedCategories());
    if (current.has(category)) {
      current.delete(category);
    } else {
      current.add(category);
    }
    this.collapsedCategories.set(current);
  }

  isCategoryCollapsed(category: string): boolean {
    return this.collapsedCategories().has(category);
  }

  toggleExpand(resultId: string): void {
    const current = new Set(this.expandedIds());
    if (current.has(resultId)) {
      current.delete(resultId);
    } else {
      current.add(resultId);
    }
    this.expandedIds.set(current);
  }

  isExpanded(resultId: string): boolean {
    return this.expandedIds().has(resultId);
  }

  setStatus(result: TestResultData, status: ResultStatus): void {
    if (result.status === status || this.updatingId()) return;
    this.updatingId.set(result.id);

    this.api.updateTestResult(result.id, status, undefined).subscribe({
      next: () => {
        this.updateResultLocally(result.id, status);
        this.updatingId.set(null);
      },
      error: () => {
        this.updatingId.set(null);
      },
    });
  }

  onCommentChange(result: TestResultData, value: string): void {
    this.commentDrafts.set(result.id, value);
  }

  saveComment(result: TestResultData): void {
    const comment = this.commentDrafts.get(result.id) ?? result.comment ?? '';
    this.savingCommentId.set(result.id);
    this.api.updateTestResult(result.id, result.status, comment).subscribe({
      next: () => {
        this.updateResultCommentLocally(result.id, comment);
        this.savingCommentId.set(null);
      },
      error: () => {
        this.savingCommentId.set(null);
      },
    });
  }

  completeRun(): void {
    if (this.completing()) return;
    this.completing.set(true);
    this.api.completeTestRun(this.runId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.completing.set(false);
      },
    });
  }

  parseSteps(steps: string): string[] {
    if (!steps) return [];
    try {
      const parsed = JSON.parse(steps);
      return Array.isArray(parsed) ? parsed : [steps];
    } catch {
      return [steps];
    }
  }

  priorityClass(priority: string): string {
    switch (priority) {
      case 'კრიტიკული': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'მაღალი': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'საშუალო': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'დაბალი': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'passed': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'skipped': return 'bg-gray-500/20 text-gray-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'passed': return 'გავლილი';
      case 'failed': return 'ჩავარდნილი';
      case 'skipped': return 'გამოტოვებული';
      case 'pending': return 'მომლოდინე';
      default: return status;
    }
  }

  private updateResultLocally(resultId: string, status: ResultStatus): void {
    this.results.update(results =>
      results.map(r => r.id === resultId ? { ...r, status } : r)
    );
    this.syncRunCounts();
  }

  private updateResultCommentLocally(resultId: string, comment: string): void {
    this.results.update(results =>
      results.map(r => r.id === resultId ? { ...r, comment } : r)
    );
  }

  private syncRunCounts(): void {
    this.run.update(run => run ? {
      ...run,
      passedCases: this.passedCount(),
      failedCases: this.failedCount(),
      skippedCases: this.skippedCount(),
    } : run);
  }
}
