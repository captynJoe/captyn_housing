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
    version: "resident-shell-3",
    legacyScript: LEGACY_RESIDENT_SCRIPT,
    loadedAt: new Date().toISOString()
  };
}

function isVisible(element: HTMLElement | null) {
  return Boolean(element && !element.classList.contains("hidden"));
}

function syncResidentModeClass() {
  const authPanel = document.getElementById("resident-auth-panel");
  const residentLayout = document.getElementById("resident-layout");
  document.body.classList.toggle("resident-auth-mode", isVisible(authPanel));
  document.body.classList.toggle("resident-session-mode", isVisible(residentLayout));
}

function watchResidentMode() {
  const targets = [document.getElementById("resident-auth-panel"), document.getElementById("resident-layout")].filter(
    (element): element is HTMLElement => Boolean(element)
  );

  const observer = new MutationObserver(syncResidentModeClass);
  targets.forEach((element) => observer.observe(element, { attributes: true, attributeFilter: ["class"] }));
  syncResidentModeClass();
}

function setAuthHeroCopy() {
  if (!isVisible(document.getElementById("resident-auth-panel"))) {
    return;
  }

  const title = document.getElementById("resident-hero-title");
  if (title && title.textContent !== "CAPTYN Housing") {
    title.textContent = "CAPTYN Housing";
  }

  const heroCopy = document.querySelector<HTMLElement>(".portal-copy");
  if (heroCopy && !heroCopy.querySelector(".resident-auth-subtitle")) {
    const subtitle = document.createElement("p");
    subtitle.className = "resident-auth-subtitle";
    subtitle.textContent = "Room access, payments, support, notices, and Wi-Fi in one resident workspace.";
    heroCopy.append(subtitle);
  }

  const hero = document.querySelector<HTMLElement>(".hero.portal-header");
  if (hero && !hero.querySelector(".resident-auth-signal-grid")) {
    const signalGrid = document.createElement("section");
    signalGrid.className = "resident-auth-signal-grid";
    signalGrid.setAttribute("aria-label", "Resident workspace status");
    const items = [
      ["Secure", "Session protected"],
      ["M-PESA", "Payment ready"],
      ["Support", "Requests tracked"]
    ];
    signalGrid.innerHTML = items
      .map(([label, value]) => "<article><span>" + label + "</span><strong>" + value + "</strong></article>")
      .join("");
    hero.append(signalGrid);
  }
}

function wrapNodes(wrapper: HTMLElement, nodes: Element[]) {
  nodes.forEach((node) => wrapper.append(node));
}

function enhanceAuthForm() {
  const panel = document.getElementById("resident-auth-panel");
  const form = document.getElementById("resident-auth-form");
  if (!panel || !form || form.querySelector(".resident-login-card")) {
    return;
  }

  const children = Array.from(form.children);
  const roomDetailsIndex = children.findIndex((child) => {
    const heading = child.querySelector?.("h2");
    return heading?.textContent?.trim().toLowerCase() === "room details";
  });

  if (roomDetailsIndex <= 0) {
    return;
  }

  const loginCard = document.createElement("section");
  loginCard.className = "resident-login-card";
  wrapNodes(loginCard, children.slice(0, roomDetailsIndex));

  const accessCard = document.createElement("section");
  accessCard.className = "resident-access-card";
  accessCard.id = "resident-access-card";
  accessCard.setAttribute("aria-label", "Room access request details");
  wrapNodes(accessCard, children.slice(roomDetailsIndex));

  const accessToggle = document.createElement("button");
  accessToggle.id = "resident-access-toggle";
  accessToggle.className = "resident-access-toggle ghost-btn";
  accessToggle.type = "button";
  accessToggle.setAttribute("aria-controls", "resident-access-card");
  accessToggle.setAttribute("aria-expanded", "false");
  accessToggle.textContent = "Request room access";

  const setExpanded = (expanded: boolean) => {
    panel.classList.toggle("resident-access-expanded", expanded);
    accessToggle.setAttribute("aria-expanded", String(expanded));
    accessToggle.textContent = expanded ? "Hide access request" : "Request room access";
  };

  accessToggle.addEventListener("click", () => {
    setExpanded(!panel.classList.contains("resident-access-expanded"));
  });

  document.getElementById("resident-forgot-btn")?.addEventListener("click", () => setExpanded(true));

  form.append(loginCard, accessToggle, accessCard);
}

function watchAuthHeroCopy() {
  const title = document.getElementById("resident-hero-title");
  const authPanel = document.getElementById("resident-auth-panel");
  if (!title) {
    return;
  }

  const applySoon = () => window.requestAnimationFrame(setAuthHeroCopy);
  new MutationObserver(applySoon).observe(title, { childList: true, subtree: true, characterData: true });
  if (authPanel) {
    new MutationObserver(applySoon).observe(authPanel, { attributes: true, attributeFilter: ["class"] });
  }
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
  setAuthHeroCopy();
  enhanceAuthForm();
  watchAuthHeroCopy();
  upgradeNavigationLabels();
  watchResidentMode();
  addLoadedClass();

  try {
    await loadLegacyResidentApp();
    setAuthHeroCopy();
    syncResidentModeClass();
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
