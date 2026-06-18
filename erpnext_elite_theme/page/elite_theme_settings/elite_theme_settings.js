frappe.pages["elite-theme-settings"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __("Elite Theme Settings"),
    single_column: true
  });

  const defaults = {
    primary: "#174fa6",
    primary_dark: "#123f86",
    secondary: "#2d6cdf",
    bg: "#f5f7fb",
    font: '"Tajawal", "Inter", "Segoe UI", Tahoma, Arial, sans-serif',
    logo: "/assets/erpnext_elite_theme/images/elite-control-logo.png"
  };

  let settings = { ...defaults };

  const storageKey = (key) => "elite_theme_" + key;
  const getFallback = (key) => localStorage.getItem(storageKey(key)) || defaults[key];
  const persistLocal = () => {
    Object.keys(settings).forEach((key) => localStorage.setItem(storageKey(key), settings[key] || defaults[key]));
  };

  const applyTheme = () => {
    document.documentElement.style.setProperty("--elite-primary", settings.primary || defaults.primary);
    document.documentElement.style.setProperty("--elite-primary-dark", settings.primary_dark || defaults.primary_dark);
    document.documentElement.style.setProperty("--elite-secondary", settings.secondary || defaults.secondary);
    document.documentElement.style.setProperty("--elite-bg", settings.bg || defaults.bg);
    document.documentElement.style.setProperty("--font-stack", settings.font || defaults.font);
    document.querySelectorAll(".elite-settings-logo-preview, .elite-login-brand img").forEach((img) => {
      img.src = settings.logo || defaults.logo;
    });
    persistLocal();
  };

  const render = () => {
    page.main.html(`
      <div class="elite-settings">
        <div class="elite-settings-hero">
          <div>
            <div class="elite-settings-eyebrow">Elite Control</div>
            <h2>${__("Theme Control Center")}</h2>
            <p>${__("Control brand colors, login identity, font, dashboards, and the general ERPNext interface feeling.")}</p>
          </div>
          <img class="elite-settings-logo-preview" src="${settings.logo}" alt="Elite Control">
        </div>

        <div class="elite-settings-grid">
          <section class="elite-settings-card">
            <h3>${__("Brand Colors")}</h3>
            <label>${__("Primary Color")}<input data-key="primary" type="color" value="${settings.primary}"></label>
            <label>${__("Dark Primary")}<input data-key="primary_dark" type="color" value="${settings.primary_dark}"></label>
            <label>${__("Secondary Color")}<input data-key="secondary" type="color" value="${settings.secondary}"></label>
            <label>${__("Background")}<input data-key="bg" type="color" value="${settings.bg}"></label>
          </section>

          <section class="elite-settings-card">
            <h3>${__("Logo and Font")}</h3>
            <label>${__("Logo URL")}<input data-key="logo" type="text" value="${settings.logo}"></label>
            <label>${__("Font Stack")}<input data-key="font" type="text" value='${settings.font}'></label>
            <div class="elite-settings-actions">
              <button class="btn btn-primary elite-save">${__("Save Site Settings")}</button>
              <button class="btn btn-default elite-reset">${__("Reset")}</button>
            </div>
          </section>

          <section class="elite-settings-card elite-settings-preview">
            <h3>${__("Live Preview")}</h3>
            <div class="elite-preview-toolbar">
              <button class="btn btn-primary">${__("New Invoice")}</button>
              <button class="btn btn-default">${__("Export Report")}</button>
            </div>
            <div class="elite-preview-metric">
              <span>${__("Monthly Revenue")}</span>
              <strong>128,450 ر.س</strong>
            </div>
            <div class="elite-preview-bars">
              <i style="height: 42%"></i><i style="height: 76%"></i><i style="height: 58%"></i><i style="height: 92%"></i><i style="height: 64%"></i>
            </div>
          </section>
        </div>
      </div>
    `);

    page.main.find("[data-key]").on("change input", function () {
      settings[this.dataset.key] = this.value;
      applyTheme();
    });

    page.main.find(".elite-save").on("click", saveSiteSettings);
    page.main.find(".elite-reset").on("click", resetSettings);
    applyTheme();
  };

  const loadSettings = () => {
    return frappe.call({
      method: "erpnext_elite_theme.doctype.elite_theme_settings.elite_theme_settings.get_settings"
    }).then((r) => {
      settings = { ...defaults, ...(r.message || {}) };
    }).catch(() => {
      settings = {
        primary: getFallback("primary"),
        primary_dark: getFallback("primary_dark"),
        secondary: getFallback("secondary"),
        bg: getFallback("bg"),
        font: getFallback("font"),
        logo: getFallback("logo")
      };
    });
  };

  const saveSiteSettings = () => {
    frappe.call({
      method: "erpnext_elite_theme.doctype.elite_theme_settings.elite_theme_settings.save_settings",
      args: settings,
      freeze: true,
      freeze_message: __("Saving Elite theme settings")
    }).then((r) => {
      settings = { ...defaults, ...(r.message || settings) };
      applyTheme();
      frappe.show_alert({ message: __("Elite theme settings saved for the site"), indicator: "green" });
    }).catch(() => {
      persistLocal();
      frappe.show_alert({ message: __("Saved locally. System Manager permission is required for site-wide settings."), indicator: "orange" });
    });
  };

  const resetSettings = () => {
    settings = { ...defaults };
    Object.keys(defaults).forEach((key) => localStorage.removeItem(storageKey(key)));
    render();
    frappe.show_alert({ message: __("Elite theme reset to defaults"), indicator: "blue" });
  };

  loadSettings().then(render);
};
