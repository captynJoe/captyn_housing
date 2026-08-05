(function () {
  var KEY = "captyn_housing_theme";
  function preferred() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function stored() {
    try { return localStorage.getItem(KEY); } catch (_error) { return null; }
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }
  apply(stored() || preferred());

  window.captynTheme = {
    current: function () {
      return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    },
    toggle: function () {
      var next = window.captynTheme.current() === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (_error) {}
      return next;
    }
  };

  function wireToggleButtons() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      if (btn.dataset.themeWired) return;
      btn.dataset.themeWired = "1";
      var sync = function () {
        btn.textContent = window.captynTheme.current() === "dark" ? "Light" : "Dark";
      };
      sync();
      btn.addEventListener("click", function () {
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
