(function () {
  var attempts = 0;
  var maxAttempts = 30;

  function isLoginRoute() {
    var path = window.location.pathname || "";
    return path === "/login" || path.indexOf("/login") > -1;
  }

  function getPreferredLogo() {
    var saved = window.localStorage && localStorage.getItem("elite_theme_logo");
    if (saved) return saved;

    var siteLogo = document.querySelector(".navbar-brand img, .app-logo img, img[src*='/files/']");
    if (siteLogo && siteLogo.getAttribute("src")) {
      return siteLogo.getAttribute("src");
    }

    return "/assets/erpnext_elite_theme/images/elite-control-logo.png";
  }

  function applySavedTokens() {
    if (!window.localStorage) return;
    var root = document.documentElement;
    [
      ["elite_theme_primary", "--elite-primary"],
      ["elite_theme_primary_dark", "--elite-primary-dark"],
      ["elite_theme_secondary", "--elite-secondary"],
      ["elite_theme_bg", "--elite-bg"],
      ["elite_theme_font", "--font-stack"]
    ].forEach(function (item) {
      var value = localStorage.getItem(item[0]);
      if (value) root.style.setProperty(item[1], value);
    });
  }

  function findLoginContent() {
    var loginContent = document.querySelector(".login-content");
    if (loginContent) return loginContent;

    var loginPanel = document.querySelector(".for-login");
    if (loginPanel && loginPanel.closest(".page-card")) {
      return loginPanel.closest(".page-card");
    }

    return loginPanel || document.querySelector("form[action*='login']");
  }

  function buildLoginBrand() {
    if (!isLoginRoute() || document.querySelector(".elite-login-shell")) return true;

    var content = findLoginContent();
    if (!content || content === document.body || content === document.documentElement) {
      return false;
    }

    document.documentElement.setAttribute("dir", "rtl");
    document.body.classList.add("elite-login-page");
    applySavedTokens();

    var parent = content.parentNode;
    if (!parent) return false;

    var shell = document.createElement("div");
    shell.className = "elite-login-shell";
    shell.innerHTML = [
      '<section class="elite-login-showcase">',
      '  <div class="elite-circuit-grid"></div>',
      '  <div class="elite-login-brand">',
      '    <img src="' + getPreferredLogo() + '" alt="Elite Control">',
      '    <div class="elite-login-title">ELITE CONTROL</div>',
      '    <div class="elite-login-subtitle">Integrated Solutions . Lasting Partnerships</div>',
      '  </div>',
      '  <div class="elite-login-promise">حلول متكاملة<br>لعلاقات تدوم</div>',
      '  <div class="elite-login-features">',
      '    <span>آمن وموثوق</span>',
      '    <span>تقارير ذكية</span>',
      '    <span>إدارة متكاملة</span>',
      '  </div>',
      '</section>',
      '<section class="elite-login-form-panel"></section>'
    ].join("");

    parent.insertBefore(shell, content);
    shell.querySelector(".elite-login-form-panel").appendChild(content);
    return true;
  }

  function tryBuildLoginBrand() {
    if (buildLoginBrand()) return;
    attempts += 1;
    if (attempts < maxAttempts) {
      window.setTimeout(tryBuildLoginBrand, 150);
    }
  }

  document.addEventListener("DOMContentLoaded", tryBuildLoginBrand);

  if (document.readyState === "interactive" || document.readyState === "complete") {
    tryBuildLoginBrand();
  }
})();
