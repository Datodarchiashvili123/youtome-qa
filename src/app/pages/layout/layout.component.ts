import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-950 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div class="p-6 border-b border-gray-800">
          <h1 class="text-xl font-bold text-white">YOUTOME.US</h1>
          <p class="text-xs text-gray-500 mt-1">QA ტესტირება</p>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-orange-600/10 text-orange-500 border-orange-500/20"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition border border-transparent">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            დეშბორდი
          </a>
        </nav>
        <div class="p-4 border-t border-gray-800">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {{ auth.currentUser()?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <p class="text-sm text-white">{{ auth.currentUser()?.username }}</p>
              <p class="text-xs text-gray-500">{{ auth.currentUser()?.email }}</p>
            </div>
          </div>
          <button (click)="auth.logout()" class="w-full px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
            გამოსვლა
          </button>
        </div>
      </aside>
      <!-- Main -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}
}
