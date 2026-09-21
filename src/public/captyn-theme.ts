interface Window {
  captynTheme: {
    current: () => string;
    toggle: () => string;
  };
}

(function () {
  const KEY = "captyn_housing_theme";

  function preferred() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (_error) {
      return null;
    }
  }

  function apply(theme: string) {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }

  apply(stored() || preferred());

  window.captynTheme = {
    current() {
      return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    },
    toggle() {
      const next = window.captynTheme.current() === "dark" ? "light" : "dark";
      apply(next);
      try {
        localStorage.setItem(KEY, next);
      } catch (_error) {}
      return next;
    }
  };

  function wireToggleButtons() {
    document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
      if (btn.dataset.themeWired) return;
      btn.dataset.themeWired = "1";
      const sync = () => {
        btn.textContent = window.captynTheme.current() === "dark" ? "Light" : "Dark";
      };
      sync();
      btn.addEventListener("click", () => {
        window.captynTheme.toggle();
        sync();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireToggleButtons);
  } else {
    wireToggleButtons();
  }
})();
