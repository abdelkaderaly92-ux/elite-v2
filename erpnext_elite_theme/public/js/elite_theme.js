(function () {
  var quickCreateItems = [
    ["عرض سعر", "Quotation"],
    ["عميل جديد", "Customer"],
    ["طلب مبيعات", "Sales Order"],
    ["طلب شراء", "Purchase Order"],
    ["فاتورة", "Sales Invoice"],
    ["دفعة", "Payment Entry"]
  ];

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

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(value, currency) {
    var amount = Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return amount + " " + ((currency || "").toUpperCase() === "SAR" ? "﷼" : (currency || ""));
  }

  function buildPreviewHtml(doc) {
    var isQuotation = doc.doctype === "Quotation";
    var title = isQuotation ? "عرض سعر" : "فاتورة مبيعات";
    var party = doc.customer_name || doc.customer || doc.party_name || doc.party || "";
    var items = (doc.items || []).map(function (item, index) {
      return [
        "<tr>",
        "<td>", index + 1, "</td>",
        "<td><strong>", escapeHtml(item.item_name || item.item_code || ""), "</strong><small>", escapeHtml(item.description || ""), "</small></td>",
        "<td>", escapeHtml(item.qty || 0), "</td>",
        "<td>", money(item.rate, doc.currency), "</td>",
        "<td>", money(item.amount, doc.currency), "</td>",
        "</tr>"
      ].join("");
    }).join("");

    if (!items) {
      items = '<tr><td colspan="5" class="elite-empty-row">لا توجد بنود بعد</td></tr>';
    }

    return [
      '<div class="elite-print-preview">',
      '<header><div><h2>', title, '</h2><p>Elite Control</p></div><strong>', escapeHtml(doc.name || "مسودة جديدة"), '</strong></header>',
      '<section class="elite-print-meta">',
      '<div><span>العميل</span><strong>', escapeHtml(party), '</strong></div>',
      '<div><span>التاريخ</span><strong>', escapeHtml(doc.transaction_date || doc.posting_date || ""), '</strong></div>',
      '<div><span>العملة</span><strong>', escapeHtml((doc.currency || "").toUpperCase() === "SAR" ? "﷼" : doc.currency || ""), '</strong></div>',
      '<div><span>الحالة</span><strong>', escapeHtml(doc.status || "مسودة"), '</strong></div>',
      '</section>',
      '<table><thead><tr><th>#</th><th>الصنف / الخدمة</th><th>الكمية</th><th>السعر</th><th>المبلغ</th></tr></thead><tbody>', items, '</tbody></table>',
      '<section class="elite-print-totals">',
      '<div><span>الإجمالي الفرعي</span><strong>', money(doc.total, doc.currency), '</strong></div>',
      '<div><span>الضرائب</span><strong>', money(doc.total_taxes_and_charges, doc.currency), '</strong></div>',
      '<div class="grand"><span>الإجمالي الكلي</span><strong>', money(doc.grand_total, doc.currency), '</strong></div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function openBeforeSavePreview(frm) {
    var html = buildPreviewHtml(frm.doc || {});
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
        frame.contentDocument.write("<!doctype html><html dir='rtl'><head><meta charset='utf-8'><title>Elite Preview</title><link rel='stylesheet' href='/assets/erpnext_elite_theme/css/elite_theme.css'></head><body class='elite-ar-theme elite-print-body'>" + html + "</body></html>");
        frame.contentDocument.close();
        window.setTimeout(function () {
          frame.contentWindow.focus();
          frame.contentWindow.print();
          window.setTimeout(function () { frame.remove(); }, 600);
        }, 250);
      }
    });
    dialog.fields_dict.preview.$wrapper.html(html);
    dialog.show();
  }

  function installPrintPreviewButtons() {
    if (!window.frappe || !frappe.ui || !frappe.ui.form || window.__elitePrintPreviewInstalled) return;
    window.__elitePrintPreviewInstalled = true;

    ["Quotation", "Sales Invoice"].forEach(function (doctype) {
      frappe.ui.form.on(doctype, {
        refresh: function (frm) {
          if (frm.__elite_preview_button_added) return;
          frm.__elite_preview_button_added = true;
          frm.add_custom_button("معاينة قبل الحفظ", function () {
            openBeforeSavePreview(frm);
          });
        }
      });
    });
  }

  function ensureQuickCreate() {
    if (!window.frappe || document.querySelector(".elite-quick-create")) return;

    var wrap = document.createElement("div");
    wrap.className = "elite-quick-create";
    wrap.innerHTML = [
      '<button class="elite-quick-main" type="button" title="إضافة سريعة">+</button>',
      '<div class="elite-quick-menu">',
      quickCreateItems.map(function (item) {
        return '<button type="button" data-doctype="' + item[1] + '">' + item[0] + '</button>';
      }).join(""),
      '</div>'
    ].join("");

    wrap.querySelector(".elite-quick-main").addEventListener("click", function () {
      wrap.classList.toggle("open");
    });

    wrap.querySelector(".elite-quick-menu").addEventListener("click", function (event) {
      var doctype = event.target && event.target.getAttribute("data-doctype");
      if (!doctype) return;
      wrap.classList.remove("open");
      frappe.new_doc(doctype);
    });

    document.body.appendChild(wrap);
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
    installPrintPreviewButtons();
    ensureQuickCreate();

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

  if (window.frappe && frappe.router) {
    frappe.router.on("change", function () {
      window.setTimeout(applyArabicDeskPolish, 60);
    });
  }
})();
