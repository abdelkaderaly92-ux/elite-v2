app_name = "erpnext_elite_theme"
app_title = "ERPNext Elite Arabic Theme"
app_publisher = "Elite Control"
app_description = "Professional Elite Control Arabic RTL theme for ERPNext/Frappe"
app_email = "admin@example.com"
app_license = "MIT"

app_include_css = [
    "/assets/erpnext_elite_theme/css/elite_theme.css",
]

app_include_js = [
    "/assets/erpnext_elite_theme/js/elite_theme.js",
]

web_include_css = [
    "/assets/erpnext_elite_theme/css/elite_login.css",
]

web_include_js = [
    "/assets/erpnext_elite_theme/js/elite_login.js",
]

website_context = {
    "favicon": "/assets/erpnext_elite_theme/images/elite-control-logo.png"
}

after_install = "erpnext_elite_theme.install.ensure_elite_theme_records"
after_migrate = "erpnext_elite_theme.install.ensure_elite_theme_records"


