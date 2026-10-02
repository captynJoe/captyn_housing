(function () {
    const themeWindow = window;
    const KEY = "captyn_housing_theme";
    function preferred() {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    function stored() {
        try {
            return localStorage.getItem(KEY);
        }
        catch (_error) {
            return null;
        }
    }
    function apply(theme) {
        document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    }
    apply(stored() || preferred());
    const captynTheme = {
        current() {
            return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        },
        toggle() {
            const next = captynTheme.current() === "dark" ? "light" : "dark";
            apply(next);
            try {
                localStorage.setItem(KEY, next);
            }
            catch (_error) { }
            return next;
        }
    };
    themeWindow.captynTheme = captynTheme;
    function wireToggleButtons() {
        document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
            if (btn.dataset.themeWired)
                return;
            btn.dataset.themeWired = "1";
            const sync = () => {
                btn.textContent = captynTheme.current() === "dark" ? "Light" : "Dark";
            };
            sync();
            btn.addEventListener("click", () => {
                captynTheme.toggle();
                sync();
            });
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", wireToggleButtons);
    }
    else {
        wireToggleButtons();
    }
})();
