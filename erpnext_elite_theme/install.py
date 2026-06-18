import frappe


MODULE_NAME = "ERPNext Elite Theme"
PAGE_NAME = "elite-theme-settings"


def ensure_elite_theme_records():
    ensure_module_def()
    ensure_settings_page()
    frappe.db.commit()


def ensure_module_def():
    if frappe.db.exists("Module Def", MODULE_NAME):
        return

    frappe.get_doc({
        "doctype": "Module Def",
        "module_name": MODULE_NAME,
        "app_name": "erpnext_elite_theme",
        "custom": 0,
    }).insert(ignore_permissions=True)


def ensure_settings_page():
    if frappe.db.exists("Page", PAGE_NAME):
        return

    frappe.get_doc({
        "doctype": "Page",
        "page_name": PAGE_NAME,
        "title": "Elite Theme Settings",
        "module": MODULE_NAME,
        "standard": "Yes",
    }).insert(ignore_permissions=True)
