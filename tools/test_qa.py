import time
from playwright.sync_api import sync_playwright

console_messages = []
page_errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=[
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-webgl',
            '--no-sandbox',
            '--disable-gpu-sandbox'
        ]
    )
    context = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = context.new_page()

    page.on('console', lambda msg: print(f'CONSOLE [{msg.type}]: {msg.text}'))
    page.on('pageerror', lambda err: print(f'PAGE ERROR: {err}'))

    print('Navigating to http://127.0.0.1:8123/ ...')
    page.goto('http://127.0.0.1:8123/')

    # Poll status loader every 2 seconds for up to 60 seconds
    for sec in range(30):
        time.sleep(2)
        status_text = page.locator('#loader-status').text_content()
        progress_text = page.locator('#loader-counter').text_content()
        print(f'Second {(sec+1)*2}: status="{status_text}", progress="{progress_text}"')
        loader_visible = page.locator('#startup-loader').is_visible()
        if not loader_visible:
            print('Startup loader is hidden!')
            break

    browser.close()
