import os
import threading
import time
import sys

BASE_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
MOBILE_DIR = os.path.join(BASE_DIR, 'mobile')


def _run_backend():
    sys.path.insert(0, BACKEND_DIR)
    from app import app
    app.run(host='0.0.0.0', port=8010)


def start_backend():
    t = threading.Thread(target=_run_backend, daemon=True)
    t.start()
    return t


def start_mobile():
    os.environ.setdefault('API_BASE', 'http://127.0.0.1:8010')
    sys.path.insert(0, MOBILE_DIR)
    from main import PlainSpeakApp
    PlainSpeakApp().run()


if __name__ == '__main__':
    start_backend()
    time.sleep(0.8)
    start_mobile()
