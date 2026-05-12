import { Component, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-presence-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './presence-form.html',
  styleUrl: './presence-form.css'
})
export class PresenceFormComponent {
  @Output() success = new EventEmitter<string>();

  name = signal('');
  loading = signal(false);
  message = signal('');

  private readonly FORM_ID = '1FAIpQLSdJmaOF2rFS5T_O4nYXD6md7D2bN3UB_HMrC39wgVvu6eRNlg';
  private readonly FORM_URL = `https://docs.google.com/forms/d/e/${this.FORM_ID}/formResponse`;

  async handleSubmit() {
    if (!this.name().trim()) {
      this.message.set('Por favor, digite seu nome');
      return;
    }

    this.loading.set(true);
    this.message.set('');

    try {
      const formData = new FormData();
      formData.append('entry.290949965', this.name());

      await fetch(this.FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      });

      this.message.set('✅ Presença confirmada!');
      this.success.emit(this.name());
      this.name.set('');
      setTimeout(() => this.message.set(''), 3000);
    } catch (err) {
      this.message.set('❌ Erro ao enviar. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      this.loading.set(false);
    }
  }

  onNameChange(value: string) {
    this.name.set(value);
  }
}
