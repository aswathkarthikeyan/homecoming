export interface DelayedJob<T = unknown> {
  id: string;
  data: T;
  delayMs: number;
  scheduledFor: number;
  retries: number;
  maxRetries: number;
}

export class InMemoryDistributedQueue<T = unknown> {
  private jobs: Map<string, DelayedJob<T>> = new Map();

  schedule(id: string, data: T, delayMs: number, maxRetries = 3): DelayedJob<T> {
    const job: DelayedJob<T> = {
      id,
      data,
      delayMs,
      scheduledFor: Date.now() + delayMs,
      retries: 0,
      maxRetries,
    };
    this.jobs.set(id, job);
    return job;
  }

  pollReady(now = Date.now()): DelayedJob<T>[] {
    const ready: DelayedJob<T>[] = [];
    for (const [id, job] of this.jobs) {
      if (job.scheduledFor <= now) {
        ready.push(job);
        this.jobs.delete(id);
      }
    }
    return ready;
  }

  cancel(id: string): boolean {
    return this.jobs.delete(id);
  }

  size(): number {
    return this.jobs.size;
  }
}
