import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="nav-bar">
      <a routerLink="/" class="nav-brand">基金研究看板</a>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">首页</a>
        <a routerLink="/" class="nav-link">基金市场</a>
        <a routerLink="/" class="nav-link">ETF</a>
        <a routerLink="/" class="nav-link">基金经理</a>
      </div>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 52px);
    }
  `]
})
export class AppComponent {}
