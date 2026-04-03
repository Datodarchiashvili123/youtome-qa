import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white">YOUTOME.US</h1>
          <p class="text-gray-400 mt-2">QA ტესტირების პანელი</p>
        </div>

        @if (error()) {
          <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="login()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">ელ-ფოსტა</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              placeholder="admin@youtome.us"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">პაროლი</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {{ loading() ? 'შესვლა...' : 'შესვლა' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.handleLoginSuccess(res);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'შესვლა ვერ მოხერხდა');
        this.loading.set(false);
      },
    });
  }
}
