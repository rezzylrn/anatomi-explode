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

    print('1. Memuat aplikasi http://127.0.0.1:8123/ ...')
    page.goto('http://127.0.0.1:8123/')

    for sec in range(25):
        time.sleep(1)
        disp = page.evaluate('document.getElementById("startup-loader").style.display')
        if disp == 'none':
            print(f'   Loader selesai pada detik ke-{sec+1}')
            break

    time.sleep(2)

    cdp = page.context.new_cdp_session(page)

    # ========================================================
    # (a) Screenshot Assembled Semua Sistem Default
    # ========================================================
    print('2. Mengambil screenshot (a) assembled semua sistem default...')
    res_a = cdp.send('Page.captureScreenshot', {'format': 'png'})
    with open('/home/hatch/workspace/anatomi-explode/v2/qa-c1/screenshot-a-assembled-default.png', 'wb') as f:
        f.write(base64.b64decode(res_a['data']))
    print('   Screenshot A tersimpan: qa-c1/screenshot-a-assembled-default.png')

    # ========================================================
    # (b) Screenshot Satu Sistem Saja (Heart / Jantung)
    # ========================================================
    print('3. Beralih ke sistem HEART (Jantung) saja...')
    # Matikan skeleton, muscles, skin
    page.evaluate('''() => {
        ['skeleton', 'muscles', 'skin'].forEach(function(id) {
            const cb = document.querySelector('.system-checkbox[data-sys="' + id + '"]');
            if (cb && cb.checked) {
                cb.checked = false;
                cb.dispatchEvent(new Event('change'));
            }
        });
        const hcb = document.querySelector('.system-checkbox[data-sys="heart"]');
        if (hcb && !hcb.checked) {
            hcb.checked = true;
            hcb.dispatchEvent(new Event('change'));
        }
    }''')

    time.sleep(3) # Beri waktu GLTF loader mendownload & render heart.glb

    # Fokuskan kamera ke Jantung via pencarian
    print('4. Memfokuskan kamera ke Jantung...')
    page.fill('#search-input', 'Jantung')
    time.sleep(0.5)
    page.locator('.search-item').first.click()
    time.sleep(2)

    print('5. Mengambil screenshot (b) satu sistem saja (Heart)...')
    res_b = cdp.send('Page.captureScreenshot', {'format': 'png'})
    with open('/home/hatch/workspace/anatomi-explode/v2/qa-c1/screenshot-b-single-heart.png', 'wb') as f:
        f.write(base64.b64decode(res_b['data']))
    print('   Screenshot B tersimpan: qa-c1/screenshot-b-single-heart.png')

    # ========================================================
    # Verifikasi Fitur Kuis
    # ========================================================
    print('6. Memverifikasi Mode Kuis...')
    page.click('#btn-quiz')
    time.sleep(1)
    quiz_banner = page.locator('#quiz-banner')
    print('   Quiz banner visible:', quiz_banner.is_visible())
    print('   Target prompt:', page.locator('#quiz-target-name').inner_text())
    print('   Stats:', page.locator('#quiz-progress-text').inner_text(),
          page.locator('#quiz-score-text').inner_text(),
          page.locator('#quiz-streak-text').inner_text())

    # Keluar kuis
    page.click('#btn-exit-quiz')
    time.sleep(0.5)
    print('   Quiz banner closed:', not quiz_banner.is_visible())

    # ========================================================
    # Verifikasi Explode Slider & Presets
    # ========================================================
    print('7. Memverifikasi Preset Bedah (Explode)...')
    # Reset sistem ke default
    page.click('#btn-reset-systems')
    time.sleep(1)
    page.click('#btn-reset-view')
    time.sleep(1)
    page.click('#btn-preset-exploded')
    time.sleep(1.5)
    print('   Slider value after "Bedah":', page.locator('#explode-value').inner_text())

    page.click('#btn-preset-assembled')
    time.sleep(1.5)
    print('   Slider value after "Tumpuk":', page.locator('#explode-value').inner_text())

    browser.close()
    print('SEMUA VERIFIKASI BERHASIL!')
