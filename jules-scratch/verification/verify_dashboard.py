from playwright.sync_api import sync_playwright, Page, expect

def verify_dashboard_login(page: Page):
    """
    This test verifies the dashboard after login.
    """
    # 1. Go to the login page.
    page.goto("http://127.0.0.1:8080/")
    sign_in_button = page.get_by_role("link", name="Sign In")
    sign_in_button.click()
    page.wait_for_url("http://127.0.0.1:8080/auth")

    # 2. Fill in the credentials and click sign in.
    page.get_by_label("Email").fill("madalamanikanta7075@gmail.com")
    page.get_by_label("Password").fill("madalamani@7075")
    page.get_by_role("button", name="Sign In").click()

    # 3. Wait for the dashboard to load and take a screenshot.
    page.wait_for_url("http://127.0.0.1:8080/dashboard", timeout=30000)
    page.screenshot(path="jules-scratch/verification/04_dashboard_after_login.png")

    # 4. Click the "Generate Study Path" button in the AI Coach component.
    generate_button = page.get_by_role("button", name="Generate Study Path")
    generate_button.click()

    page.wait_for_timeout(1000)

    # 5. Take another screenshot to show the new suggestion.
    page.screenshot(path="jules-scratch/verification/05_dashboard_new_suggestion.png")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_dashboard_login(page)
    browser.close()
