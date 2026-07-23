import { loadSettings, saveSettings, type CbmSettings } from "./settings.js";

export class CbmRuntimeSettings {
  private settings = loadSettings();
  private lastFooterText: string | undefined;

  get autoIndexNonGitDirectories(): boolean {
    return this.settings.autoIndexNonGitDirectories;
  }

  get showFooterStatus(): boolean {
    return this.settings.showFooterStatus;
  }

  getLastFooterText(): string | undefined {
    return this.lastFooterText;
  }

  setLastFooterText(text: string | undefined): void {
    this.lastFooterText = text;
  }

  snapshot(): Required<CbmSettings> {
    return { ...this.settings };
  }

  reload(): void {
    this.settings = loadSettings();
  }

  setAutoIndexNonGitDirectories(value: boolean): void {
    this.settings = {
      ...this.settings,
      autoIndexNonGitDirectories: value,
    };
    saveSettings(this.settings);
  }

  setShowFooterStatus(value: boolean): void {
    this.settings = {
      ...this.settings,
      showFooterStatus: value,
    };
    saveSettings(this.settings);
  }
}
