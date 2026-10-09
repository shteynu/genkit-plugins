import { Component, computed, signal } from '@angular/core';
import type { Spec } from '@json-render/core';
import { streamFlow } from 'genkit/beta/client';
import { JsonRenderer } from 'ngx-json-render';
import { materialRegistry } from 'ngx-json-render-material';

const FLOW_URL = '/api/landingPage';

@Component({
  selector: 'app-root',
  imports: [JsonRenderer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly registry = materialRegistry;
  protected readonly pitch = signal('A dog-walking SaaS for busy tech workers');
  protected readonly spec = signal<Spec | null>(null);
  protected readonly streaming = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canRun = computed(() => !this.streaming() && this.pitch().trim().length >= 4);
  protected readonly status = computed(() => {
    const spec = this.spec();
    if (this.streaming()) return 'STREAMING';
    return spec ? `COMPLETE · ${Object.keys(spec.elements).length} elements` : 'IDLE';
  });

  protected async run(): Promise<void> {
    if (!this.canRun()) return;
    this.streaming.set(true);
    this.error.set(null);
    this.spec.set(null);
    try {
      const { stream, output } = streamFlow<Spec, Spec>({
        url: FLOW_URL,
        input: { pitch: this.pitch().trim() },
      });
      // Each chunk is a render-safe Spec: hand it straight to <json-render>.
      for await (const chunk of stream) this.spec.set(chunk);
      this.spec.set(await output);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      this.streaming.set(false);
    }
  }
}
