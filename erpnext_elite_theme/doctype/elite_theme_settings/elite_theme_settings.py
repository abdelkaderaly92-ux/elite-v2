import frappe
from frappe.model.document import Document


class EliteThemeSettings(Document):
    pass


@frappe.whitelist()
def get_settings():
    settings = frappe.get_single("Elite Theme Settings")
    return {
        "primary": settings.primary_color or "#174fa6",
        "primary_dark": settings.primary_dark_color or "#123f86",
        "secondary": settings.secondary_color or "#2d6cdf",
        "bg": settings.background_color or "#f5f7fb",
        "font": settings.font_stack or '"Tajawal", "Inter", "Segoe UI", Tahoma, Arial, sans-serif',
        "logo": settings.logo_url or "/assets/erpnext_elite_theme/images/elite-control-logo.png",
    }


@frappe.whitelist()
def save_settings(primary, primary_dark, secondary, bg, font, logo):
    if not frappe.has_permission("Elite Theme Settings", "write"):
        frappe.throw(frappe._("Not permitted"), frappe.PermissionError)

    settings = frappe.get_single("Elite Theme Settings")
    settings.primary_color = primary
    settings.primary_dark_color = primary_dark
    settings.secondary_color = secondary
    settings.background_color = bg
    settings.font_stack = font
    settings.logo_url = logo
    settings.save()
    frappe.clear_cache()
    return get_settings()
