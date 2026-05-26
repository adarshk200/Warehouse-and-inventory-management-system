import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-section">
      <h1>Settings</h1>
      <p>Configure application settings, alerts, and user preferences in this panel.</p>
    </div>
  `
})
export class SettingsComponent {}
