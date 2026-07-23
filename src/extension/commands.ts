import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { CbmServices } from "../pi-tools/definitions.js";

type CommandUi = {
  select(title: string, options: string[]): Promise<string | undefined>;
  notify(message: string, type?: "info" | "warning" | "error" | "success"): void;
};

export function registerCommands(pi: ExtensionAPI, services: CbmServices) {
  pi.registerCommand("cbm", {
    description: "Open the pi-cbm settings menu. Usage: /cbm [menu|status|enable-non-git|disable-non-git|enable-footer|disable-footer]",
    handler: async (args, ctx) => {
      const action = args.trim() || "menu";

      if (action === "menu") {
        await openSettingsMenu(services, ctx.ui);
        return;
      }

      if (action === "status") {
        ctx.ui.notify(buildStatus(services), "info");
        return;
      }

      if (action === "enable-non-git") {
        services.settings.setAutoIndexNonGitDirectories(true);
        ctx.ui.notify("pi-cbm: auto-indexing safe non-git directories is enabled. Root, home, and system paths are still blocked.", "info");
        return;
      }

      if (action === "disable-non-git") {
        services.settings.setAutoIndexNonGitDirectories(false);
        ctx.ui.notify("pi-cbm: auto-indexing non-git directories is disabled. Git repositories will still be indexed.", "info");
        return;
      }

      if (action === "enable-footer") {
        services.settings.setShowFooterStatus(true);
        ctx.ui.setStatus("codebase-memory", services.settings.getLastFooterText());
        ctx.ui.notify("pi-cbm: footer status text is enabled.", "info");
        return;
      }

      if (action === "disable-footer") {
        services.settings.setShowFooterStatus(false);
        ctx.ui.setStatus("codebase-memory", undefined);
        ctx.ui.notify("pi-cbm: footer status text is disabled.", "info");
        return;
      }

      ctx.ui.notify(`Unknown /cbm action: ${action}. Use menu, status, enable-non-git, disable-non-git, enable-footer, or disable-footer.`, "warning");
    },
  });
}

async function openSettingsMenu(services: CbmServices, ui: CommandUi & { setStatus?(key: string, text: string | undefined): void }) {
  while (true) {
    const choice = await ui.select("pi-cbm settings", [
      `auto-index non-git directories: ${services.settings.autoIndexNonGitDirectories ? "enabled" : "disabled"} — toggle`,
      `footer status text: ${services.settings.showFooterStatus ? "enabled" : "disabled"} — toggle`,
      "show status",
      "done",
    ]);

    if (!choice || choice === "done") return;

    if (choice.startsWith("auto-index non-git directories:")) {
      const enabled = !services.settings.autoIndexNonGitDirectories;
      services.settings.setAutoIndexNonGitDirectories(enabled);
      ui.notify(
        enabled
          ? "pi-cbm: auto-indexing safe non-git directories is enabled. Root, home, and system paths are still blocked."
          : "pi-cbm: auto-indexing non-git directories is disabled. Git repositories will still be indexed.",
        "info",
      );
      continue;
    }

    if (choice.startsWith("footer status text:")) {
      const enabled = !services.settings.showFooterStatus;
      services.settings.setShowFooterStatus(enabled);
      ui.setStatus?.("codebase-memory", enabled ? services.settings.getLastFooterText() : undefined);
      ui.notify(enabled ? "pi-cbm: footer status text is enabled." : "pi-cbm: footer status text is disabled.", "info");
      continue;
    }

    if (choice === "show status") {
      ui.notify(buildStatus(services), "info");
    }
  }
}

function buildStatus(services: CbmServices): string {
  const envelope = services.settings.getLastFooterText();
  return [
    "pi-cbm status",
    "  auto-index:",
    "    git repositories: enabled",
    `    non-git directories: ${services.settings.autoIndexNonGitDirectories ? "enabled" : "disabled"}`,
    "    unsafe path guard: enabled",
    `  footer status text: ${services.settings.showFooterStatus ? "enabled" : "disabled"}`,
    ...(envelope ? [`  ${envelope}`] : []),
  ].join("\n");
}
