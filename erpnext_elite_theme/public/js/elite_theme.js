(function () {
  function applySavedEliteTokens() {
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

  function replaceSaudiCurrencySymbol(root) {
    var scope = root || document.body;
    if (!scope) return;

    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || node.nodeValue.indexOf("SAR") === -1) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].indexOf(parent.tagName) > -1) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      node.nodeValue = node.nodeValue.replace(/\bSAR\b/g, "﷼");
    });
  }

  function formatMoney(value, currency) {
    var amount = Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return amount + " " + ((currency || "").toUpperCase() === "SAR" ? "﷼" : (currency || ""));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getEliteLogo() {
    return (window.localStorage && localStorage.getItem("elite_theme_logo")) ||
      "/assets/erpnext_elite_theme/images/elite-control-logo.png";
  }

  function buildElitePrintPreview(doc) {
    var isQuotation = doc.doctype === "Quotation";
    var title = isQuotation ? "عرض سعر" : "فاتورة مبيعات";
    var party = doc.customer_name || doc.party_name || doc.customer || doc.party || "عميل";
    var items = (doc.items || []).map(function (item, index) {
      return [
        "<tr>",
        "<td>", index + 1, "</td>",
        "<td><strong>", escapeHtml(item.item_name || item.item_code || ""), "</strong><small>", escapeHtml(item.description || ""), "</small></td>",
        "<td>", escapeHtml(item.uom || ""), "</td>",
        "<td>", escapeHtml(item.qty || 0), "</td>",
        "<td>", formatMoney(item.rate, doc.currency), "</td>",
        "<td>", escapeHtml(item.discount_percentage || 0), "%</td>",
        "<td>", formatMoney(item.amount, doc.currency), "</td>",
        "</tr>"
      ].join("");
    }).join("");

    if (!items) {
      items = '<tr><td colspan="7" class="elite-empty-row">لا توجد أصناف بعد</td></tr>';
    }

    return [
      '<div class="elite-print-preview">',
      '  <header class="elite-print-header">',
      '    <div><img src="', getEliteLogo(), '" alt="Elite Control"><p>Integrated Solutions . Lasting Partnerships</p></div>',
      '    <div><h1>', title, '</h1><strong>', escapeHtml(doc.name || "مسودة جديدة"), '</strong><span>', escapeHtml(doc.transaction_date || doc.posting_date || ""), '</span></div>',
      '  </header>',
      '  <section class="elite-print-meta">',
      '    <div><span>العميل</span><strong>', escapeHtml(party), '</strong></div>',
      '    <div><span>الحالة</span><strong>', escapeHtml(doc.status || "مسودة"), '</strong></div>',
      '    <div><span>العملة</span><strong>', (doc.currency === "SAR" ? "﷼" : escapeHtml(doc.currency || "")), '</strong></div>',
      '    <div><span>صالح حتى</span><strong>', escapeHtml(doc.valid_till || doc.due_date || ""), '</strong></div>',
      '  </section>',
      '  <table class="elite-print-table">',
      '    <thead><tr><th>#</th><th>الصنف / الخدمة</th><th>الوحدة</th><th>الكمية</th><th>السعر</th><th>الخصم</th><th>المبلغ</th></tr></thead>',
      '    <tbody>', items, '</tbody>',
      '  </table>',
      '  <section class="elite-print-totals">',
      '    <div><span>الإجمالي الفرعي</span><strong>', formatMoney(doc.total, doc.currency), '</strong></div>',
      '    <div><span>الخصم</span><strong>', formatMoney(doc.discount_amount, doc.currency), '</strong></div>',
      '    <div><span>الضرائب</span><strong>', formatMoney((doc.total_taxes_and_charges || 0), doc.currency), '</strong></div>',
      '    <div class="grand"><span>الإجمالي الكلي</span><strong>', formatMoney(doc.grand_total, doc.currency), '</strong></div>',
      '  </section>',
      '  <section class="elite-print-terms"><h3>الشروط والأحكام</h3><div>', doc.terms || "الأسعار لا تشمل أي مصاريف إضافية ما لم يذكر خلاف ذلك.", '</div></section>',
      '</div>'
    ].join("");
  }

  function openElitePrintPreview(frm) {
    var html = buildElitePrintPreview(frm.doc);
    var dialog = new frappe.ui.Dialog({
      title: "معاينة الطباعة قبل الحفظ",
      size: "extra-large",
      fields: [{ fieldtype: "HTML", fieldname: "preview" }],
      primary_action_label: "طباعة",
      primary_action: function () {
        var frame = document.createElement("iframe");
        frame.style.position = "fixed";
        frame.style.left = "-9999px";
        frame.style.top = "0";
        document.body.appendChild(frame);
        frame.contentDocument.open();
        frame.contentDocument.write("<!doctype html><html dir='rtl'><head><meta charset='utf-8'><title>Elite Print Preview</title><link rel='stylesheet' href='/assets/erpnext_elite_theme/css/elite_theme.css'></head><body class='elite-ar-theme elite-print-body'>" + html + "</body></html>");
        frame.contentDocument.close();
        setTimeout(function () {
          frame.contentWindow.focus();
          frame.contentWindow.print();
          setTimeout(function () { frame.remove(); }, 600);
        }, 300);
      }
    });
    dialog.fields_dict.preview.$wrapper.html(html);
    dialog.show();
  }

  function installEliteSalesStudio() {
    if (!window.frappe || !frappe.ui || !frappe.ui.form) return;
    if (window.__eliteSalesStudioInstalled) return;
    window.__eliteSalesStudioInstalled = true;

    ["Quotation", "Sales Invoice"].forEach(function (doctype) {
      frappe.ui.form.on(doctype, {
        refresh: function (frm) {
          document.body.classList.add("elite-sales-studio");
          document.body.classList.toggle("elite-sales-invoice", doctype === "Sales Invoice");
          removeEliteSalesRail();
          frm.add_custom_button("معاينة قبل الحفظ", function () {
            openElitePrintPreview(frm);
          }).addClass("btn-primary");
        }
      });
    });
  }

  function removeEliteSalesRail() {
    document.querySelectorAll(".elite-sales-rail").forEach(function (rail) {
      rail.remove();
    });
  }

  function ensureEliteSalesRail(frm) {
    var existing = document.querySelector(".elite-sales-rail");
    if (existing) existing.remove();

    var label = frm.doc.doctype === "Sales Invoice" ? "الفاتورة" : "عرض السعر";
    var rail = document.createElement("aside");
    rail.className = "elite-sales-rail";
    rail.innerHTML = [
      '<div class="elite-sales-rail-title">', label, '</div>',
      '<a class="active">المعلومات الأساسية</a>',
      '<a>بنود ', label, '</a>',
      '<a>الضرائب والرسوم</a>',
      '<a>شروط الدفع</a>',
      '<a>المرفقات</a>',
      '<a>الملاحظات</a>',
      '<a>سجل النشاط</a>'
    ].join("");

    var main = document.querySelector(".layout-main-section-wrapper") || document.querySelector(".layout-main-section") || document.querySelector(".page-body");
    if (main && main.parentElement) {
      main.parentElement.appendChild(rail);
    }
  }

  function ensureEliteCommandPalette() {
    if (document.querySelector(".elite-command-palette")) return;

    var palette = document.createElement("div");
    palette.className = "elite-command-palette";
    palette.innerHTML = [
      '<div class="elite-command-panel">',
      '  <input class="elite-command-input" placeholder="ابحث أو أنشئ بسرعة... Ctrl + K">',
      '  <button data-route="List/Sales Invoice/List">فاتورة جديدة</button>',
      '  <button data-route="List/Customer/List">عميل جديد</button>',
      '  <button data-route="query-report/General Ledger">تقرير الأستاذ العام</button>',
      '  <button data-route="Workspaces/Accounts">لوحة الحسابات</button>',
      '</div>'
    ].join("");

    palette.addEventListener("click", function (event) {
      if (event.target === palette) palette.classList.remove("open");
      if (event.target.dataset && event.target.dataset.route && window.frappe) {
        frappe.set_route(event.target.dataset.route.split("/"));
        palette.classList.remove("open");
      }
    });

    document.body.appendChild(palette);
  }

  function ensureEliteFloatingCreate() {
    if (document.querySelector(".elite-floating-create")) return;

    var button = document.createElement("button");
    button.className = "elite-floating-create";
    button.type = "button";
    button.title = "إنشاء سريع";
    button.textContent = "+";
    button.addEventListener("click", function () {
      var palette = document.querySelector(".elite-command-palette");
      if (palette) palette.classList.toggle("open");
    });
    document.body.appendChild(button);
  }

  function bindEliteShortcuts() {
    if (window.__eliteShortcutsBound) return;
    window.__eliteShortcutsBound = true;
    document.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        ensureEliteCommandPalette();
        document.querySelector(".elite-command-palette").classList.add("open");
        var input = document.querySelector(".elite-command-input");
        if (input) input.focus();
      }
    });
  }

  function applyArabicDeskPolish() {
    var html = document.documentElement;
    var body = document.body;
    var lang = (html.getAttribute("lang") || "").toLowerCase();
    var isArabic = lang.indexOf("ar") === 0 || /[\u0600-\u06FF]/.test(body.innerText.slice(0, 300));

    if (!isArabic) {
      return;
    }

    html.setAttribute("dir", "rtl");
    body.classList.add("elite-ar-theme");
    applySavedEliteTokens();
    replaceSaudiCurrencySymbol();
    ensureEliteCommandPalette();
    ensureEliteFloatingCreate();
    bindEliteShortcuts();
    installEliteSalesStudio();
    removeEliteSalesRail();

    document.querySelectorAll(".navbar .dropdown-menu, .awesomplete > ul").forEach(function (menu) {
      menu.setAttribute("dir", "rtl");
    });

    document.querySelectorAll("input, textarea").forEach(function (field) {
      if (!field.hasAttribute("dir")) {
        field.setAttribute("dir", "auto");
      }
    });

    var savedLogo = window.localStorage && localStorage.getItem("elite_theme_logo");
    if (savedLogo) {
      document.querySelectorAll(".app-logo img, .navbar-brand img").forEach(function (img) {
        img.src = savedLogo;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", applyArabicDeskPolish);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) replaceSaudiCurrencySymbol(node);
      });
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  });

  if (window.frappe && frappe.router) {
    frappe.router.on("change", function () {
      window.setTimeout(applyArabicDeskPolish, 60);
    });
  }
})();

