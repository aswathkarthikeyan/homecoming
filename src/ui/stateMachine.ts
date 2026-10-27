import type { ModalState, ModalViewModel } from "./types.js";
import type { InFlightResolution } from "../healing/types.js";

export class InFlightModalStateMachine {
  private vm: ModalViewModel;
  private listeners: ((vm: ModalViewModel) => void)[] = [];

  constructor() {
    this.vm = {
      state: "idle",
      title: "",
      description: "",
    };
  }

  getSnapshot(): ModalViewModel {
    return { ...this.vm };
  }

  subscribe(listener: (vm: ModalViewModel) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    for (const l of this.listeners) l(snap);
  }

  intercept(title: string, description: string, resolution?: InFlightResolution): void {
    this.vm = {
      state: "intercepted",
      title,
      description,
      resolution,
      autoExecuteRemainingSeconds: resolution?.autoExecutable ? 5 : undefined,
    };
    this.notify();
  }

  startAction(): void {
    if (this.vm.state === "intercepted") {
      this.vm.state = "action_pending";
      this.notify();
    }
  }

  markResolved(): void {
    this.vm.state = "resolved";
    this.notify();
  }

  dismiss(): void {
    this.vm.state = "dismissed";
    this.notify();
  }

  reset(): void {
    this.vm = { state: "idle", title: "", description: "" };
    this.notify();
  }
}
