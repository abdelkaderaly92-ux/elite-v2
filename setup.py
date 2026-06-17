from setuptools import find_packages, setup

with open("README.md", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="erpnext_elite_theme",
    version="0.1.0",
    description="Professional Elite Control Arabic RTL theme for ERPNext/Frappe",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Elite Control",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=[],
)


