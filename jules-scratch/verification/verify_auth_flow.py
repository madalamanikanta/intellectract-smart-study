import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 1. Go to landing page and take a screenshot
        await page.goto("http://127.0.0.1:8080/")
        await page.screenshot(path="jules-scratch/verification/01_landing_page.png")

        # 2. Navigate to auth page and take a screenshot
        await page.get_by_role("link", name="Sign In").click()
        await expect(page).to_have_url("http://127.0.0.1:8080/auth")
        await page.screenshot(path="jules-scratch/verification/02_auth_page.png")

        await browser.close()

asyncio.run(main())
