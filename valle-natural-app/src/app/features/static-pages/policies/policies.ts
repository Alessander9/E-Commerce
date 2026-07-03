import { Component, signal } from '@angular/core';

type TabType = 'terms' | 'privacy' | 'refund';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [],
  templateUrl: './policies.html',
  styleUrl: './policies.css'
})
export class PoliciesComponent {
  readonly activeTab = signal<TabType>('terms');

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }
}
