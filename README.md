# ERPNext Elite Theme

ثيم عربي احترافي لـ ERPNext / Frappe باسم `Elite`، مبني على ألوان شعار Elite Control: أزرق قوي، رمادي تقني، وخلفيات فاتحة. الهدف أن تكون الواجهة أسهل للمستخدم وأكثر وضوحا في كل أجزاء النظام: المكتب، التقارير، المخططات، الجداول، النماذج، الطباعة، ولوحات المتابعة.

## المميزات

- دعم RTL وتحسين محاذاة القوائم والنماذج والحقول العربية.
- ألوان مبنية على شعار Elite Control.
- صفحة دخول احترافية تستخدم شعار الموقع إن وجد، أو شعار Elite المرفق كخيار احتياطي.
- لوحة تحكم للثيم من داخل Desk عبر `/app/elite-theme-settings`.
- تحسين Desk وWorkspace وList View وForm View.
- تغطية أوسع للتقارير، Query Report، الفلاتر، الجداول، المخططات، الطباعة، Kanban، Calendar، وGantt.
- أزرار وإجراءات واضحة لتسهيل الاستخدام اليومي.
- بطاقات مؤشرات أداء ومخططات مناسبة للوحة مالية أو تشغيلية.
- خط عربي مناسب عبر `Tajawal` مع fallback آمن.
- شعار Elite Control داخل الحزمة في `public/images`.
- ملف معاينة HTML مستقل قبل التركيب.

## التركيب داخل bench

انسخ مجلد `erpnext-elite-theme` إلى مسار التطبيقات أو ارفعه كمستودع Git، ثم:

```bash
bench get-app /path/to/erpnext-elite-theme
bench --site your-site.local install-app erpnext_elite_theme
bench --site your-site.local clear-cache
bench build
bench restart
```

إذا كان التطبيق موجودا بالفعل على السيرفر بعد محاولة سابقة:

```bash
cd ~/frappe-bench/apps/erpnext-elite-theme
git pull
cd ~/frappe-bench
bench --site your-site.local migrate
bench --site your-site.local clear-cache
bench build
bench restart
```

إذا كان لديك custom app قائم، يمكنك بدلا من ذلك نسخ الملفات:

- `erpnext_elite_theme/public/css/elite_theme.css`
- `erpnext_elite_theme/public/js/elite_theme.js`
- `erpnext_elite_theme/public/images/elite-control-logo.png`

ثم أضف إلى `hooks.py` في تطبيقك:

```python
app_include_css = "/assets/erpnext_elite_theme/css/elite_theme.css"
app_include_js = "/assets/erpnext_elite_theme/js/elite_theme.js"
```

## تفعيل العربية

1. اختر اللغة العربية من إعدادات المستخدم.
2. تأكد أن اتجاه الواجهة RTL.
3. نفذ `bench --site your-site.local clear-cache`.
4. نفذ `bench build` ثم أعد تشغيل bench.

## لوحة تحكم الثيم

بعد تثبيت التطبيق افتح:

`/app/elite-theme-settings`

يمكنك من خلالها تعديل:

- اللون الأساسي.
- اللون الأساسي الداكن.
- اللون الثانوي.
- لون الخلفية.
- رابط اللوجو.
- نوع الخط.

الإعدادات تحفظ في DocType مركزي باسم `Elite Theme Settings` لمن لديه صلاحية System Manager، وتوجد طبقة احتياطية تحفظ في متصفح المستخدم لو لم تتوفر الصلاحيات.

## التخصيص السريع

يمكن تعديل الألوان من بداية ملف:

`erpnext_elite_theme/public/css/elite_theme.css`

أهم المتغيرات:

- `--elite-primary`
- `--elite-primary-dark`
- `--elite-secondary`
- `--elite-accent`
- `--elite-ink`
- `--elite-bg`
- `--elite-border`

## المعاينة

افتح:

`preview/index.html`

لرؤية شكل القالب قبل تركيبه على ERPNext.
