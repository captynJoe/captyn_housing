import "./resident-shell.css";

declare global {
  interface Window {
    __CAPTYN_RESIDENT_TS_RUNTIME__?: {
      version: string;
      legacyScript: string;
      loadedAt: string;
    };
  }
}

const LEGACY_RESIDENT_SCRIPT = "/users.js?v=20260717c";

function markTypeScriptRuntime() {
  document.documentElement.dataset.captynUiRuntime = "typescript";
  document.body.classList.add("resident-ts-shell");
  window.__CAPTYN_RESIDENT_TS_RUNTIME__ = {
    version: "resident-shell-1",
    legacyScript: LEGACY_RESIDENT_SCRIPT,
    loadedAt: new Date().toISOString()
  };
}

function upgradeNavigationLabels() {
  const nav = document.querySelector<HTMLElement>(".hero-workspace-nav");
  if (!nav) {
    return;
  }

  const labels: Record<string, string> = {
    overview: "Home",
    support: "Support",
    payments: "Pay",
    notices: "Notices"
  };

  nav.querySelectorAll<HTMLButtonElement>("[data-resident-view]").forEach((button) => {
    const key = button.dataset.residentView || "";
    button.dataset.navLabel = labels[key] || button.textContent?.trim() || "View";
  });
}

function addLoadedClass() {
  window.requestAnimationFrame(() => {
    document.body.classList.add("resident-ts-ready");
  });
}

function loadLegacyResidentApp() {
  return new Promise<void>((resolve, reject) => {
    const legacyPath = LEGACY_RESIDENT_SCRIPT.split("?")[0];
    const existingScript = document.querySelector<HTMLScriptElement>('script[src^="' + legacyPath + '"]');
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = LEGACY_RESIDENT_SCRIPT;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Resident app failed to load")), { once: true });
    document.body.append(script);
  });
}

async function bootResidentShell() {
  markTypeScriptRuntime();
  upgradeNavigationLabels();
  addLoadedClass();

  try {
    await loadLegacyResidentApp();
  } catch (error) {
    console.error(error);
    const feedback = document.getElementById("feedback-box");
    if (feedback) {
      feedback.classList.remove("hidden");
      feedback.textContent = "Resident controls could not load. Refresh the page and try again.";
    }
  }
}

void bootResidentShell();
