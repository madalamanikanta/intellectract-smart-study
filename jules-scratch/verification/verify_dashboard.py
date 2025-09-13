from playwright.sync_api import sync_playwright, Page, expect

def verify_login_error(page: Page):
    """
    This test verifies the login error message.
    """
    # 1. Go to the login page.
    page.goto("http://127.0.0.1:8080/")
    sign_in_button = page.get_by_role("link", name="Sign In")
    sign_in_button.click()
    page.wait_for_url("http://127.0.0.1:8080/auth")

    # 2. Fill in the credentials and click sign in.
    page.get_by_label("Email").fill("test@test.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Sign In").click()

    page.wait_for_timeout(2000) # wait for error message to appear

    # 3. Take a screenshot to see the error message.
    page.screenshot(path="jules-scratch/verification/03_login_error.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_login_error(page)
    browser.close()
