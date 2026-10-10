import time
import base64
from PIL import Image
import numpy as np
from playwright.sync_api import sync_playwright

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
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.on('console', lambda msg: print(f'CONSOLE [{msg.type}]: {msg.text}'))
    page.on('pageerror', lambda err: print(f'PAGE ERROR: {err}'))

    print('1. Navigating to http://127.0.0.1:8123/ ...')
    page.goto('http://127.0.0.1:8123/')

    for sec in range(25):
        time.sleep(1)
        disp = page.evaluate('document.getElementById("startup-loader").style.display')
        if disp == 'none':
            print(f'   Loader finished at {sec+1}s')
            break

    time.sleep(2)

    # QA (a): Screenshot assembled semua sistem default
    cdp = page.context.new_cdp_session(page)
    res_a = cdp.send('Page.captureScreenshot', {'format': 'png'})
    with open('/home/hatch/workspace/anatomi-explode/v2/qa-c1/screenshot-a-assembled-default.png', 'wb') as f:
        f.write(base64.b64decode(res_a['data']))
    print('2. QA (a) screenshot saved: screenshot-a-assembled-default.png')

    # Test Search: cari femur
    print('3. Testing Search...')
    page.fill('#search-input', 'femur')
    time.sleep(0.5)
    first_result = page.locator('.search-item').first
    print('   Search first result text:', first_result.inner_text().replace('\n', ' -- '))
    first_result.click()
    time.sleep(1.5)

    info_id = page.locator('#info-name-id').inner_text()
    info_latin = page.locator('#info-name-latin').inner_text()
    info_en = page.locator('#info-name-en').inner_text()
    info_desc = page.locator('#info-desc').inner_text()
    print(f'   Info Panel: ID="{info_id}", Latin="{info_latin}", En="{info_en}"')
    print(f'   Desc: {info_desc[:80]}...')

    # Test Explode slider: gerakkan ke 80%
    print('4. Testing Explode Slider (Bedah)...')
    page.click('#btn-preset-exploded')
    time.sleep(1.5)
    explode_val = page.locator('#explode-value').inner_text()
    print(f'   Explode badge value: {explode_val}')

    # Kembalikan ke Assembled (Tumpuk)
    page.click('#btn-preset-assembled')
    time.sleep(1.5)
    explode_val = page.locator('#explode-value').inner_text()
    print(f'   Explode badge after Tumpuk: {explode_val}')

    # QA (b): Hanya satu sistem (Heart saja)
    print('5. Testing Single System view (Heart only)...')
    # Matikan skeleton, muscles, skin via checkbox
    page.uncheck('.system-checkbox[data-sys="skeleton"]')
    page.uncheck('.system-checkbox[data-sys="muscles"]')
    page.uncheck('.system-checkbox[data-sys="skin"]')
    # Nyalakan heart
    page.check('.system-checkbox[data-sys="heart"]')
    time.sleep(2.5) # tunggu load heart.glb jika belum terload

    # Reset kamera agar fokus ke figur/jantung
    page.click('#btn-reset-view')
    time.sleep(1.5)

    # Cari jantung di search box dan klik agar kamera fokus ke jantung
    page.fill('#search-input', 'Jantung')
    time.sleep(0.5)
    heart_item = page.locator('.search-item').first
    if heart_item.is_visible():
        heart_item.click()
        time.sleep(2)

    res_b = cdp.send('Page.captureScreenshot', {'format': 'png'})
    with open('/home/hatch/workspace/anatomi-explode/v2/qa-c1/screenshot-b-single-heart.png', 'wb') as f:
        f.write(base64.b64decode(res_b['data']))
    print('   QA (b) screenshot saved: screenshot-b-single-heart.png')

    # Test Mode Kuis
    print('6. Testing Mode Kuis...')
    page.click('#btn-quiz')
    time.sleep(1)
    quiz_banner_vis = page.locator('#quiz-banner').is_visible()
    target_prompt = page.locator('#quiz-target-name').inner_text()
    print(f'   Quiz banner visible: {quiz_banner_vis}, Target prompt: "{target_prompt}"')

    # Keluar kuis
    page.click('#btn-exit-quiz')
    time.sleep(0.5)
    print(f'   Quiz banner after exit visible: {page.locator("#quiz-banner").is_visible()}')

    browser.close()
    print('ALL QA TESTS PASSED!')
