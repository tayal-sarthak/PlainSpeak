from kivy.uix.screenmanager import ScreenManager, Screen, NoTransition
from kivymd.app import MDApp
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.textfield import MDTextField
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.label import MDLabel
from kivymd.uix.toolbar import MDTopAppBar
from kivymd.uix.scrollview import MDScrollView
from kivymd.uix.list import MDList, OneLineListItem
from kivymd.uix.menu import MDDropdownMenu
from kivymd.uix.card import MDCard
from kivymd.uix.snackbar import Snackbar
from kivymd.uix.label import MDIcon
from kivymd.uix.dialog import MDDialog
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.image import Image as KivyImage
from kivy.properties import ListProperty, DictProperty, StringProperty
from kivy.uix.textinput import TextInput

from kivy.network.urlrequest import UrlRequest
from kivy.metrics import dp
from kivy.clock import mainthread
from kivy.core.clipboard import Clipboard
from kivy.core.window import Window
from kivy.uix.behaviors import ButtonBehavior
from kivy.uix.gridlayout import GridLayout
from kivy.graphics import Color, Line, RoundedRectangle
from kivy.lang import Builder
from kivy.uix.anchorlayout import AnchorLayout

import os
import json
import time

# wrapped to avoid import errors 
import importlib
try:
    _tts = importlib.import_module('plyer.tts')
except Exception:
    _tts = None
try:
    pyttsx3 = importlib.import_module('pyttsx3')
except Exception:
    pyttsx3 = None


def _user_file(path_tail: str) -> str:
    app = MDApp.get_running_app()
    base = getattr(app, 'user_data_dir', os.getcwd())
    return os.path.join(base, path_tail)


def load_json(path: str, default):
    try:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return default


def save_json(path: str, data) -> None:
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


class ClickableCard(MDCard, ButtonBehavior):
    pass


class HomeScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class SimplifyScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.target_lang = None
        self.dyslexia_mode = False

        page = MDBoxLayout(orientation='vertical', padding=dp(16), spacing=dp(16))

        card_in = MDCard(orientation='vertical', padding=dp(10), spacing=dp(8), md_bg_color=(0.12,0.12,0.12,1))
        card_in.add_widget(MDLabel(text='Simplify', font_style='H6'))
        self.input_text = TextInput(
            hint_text='Paste your text here',
            multiline=True,
            size_hint_y=None,
            height=dp(160),
            font_size='16sp',
            background_color=(0,0,0,0),
            foreground_color=(1,1,1,1),
            cursor_color=(0.2,0.8,0.4,1),
            padding=(dp(8), dp(8))
        )
        self._card_in = card_in
        def _focus_cb(inst, val):
            try:
                card_in.md_bg_color = (0.16,0.16,0.16,1) if val else (0.12,0.12,0.12,1)
            except Exception:
                pass
        self.input_text.bind(focus=_focus_cb)
        card_in.add_widget(self.input_text)
        row = MDBoxLayout(orientation='horizontal', spacing=dp(8), size_hint_y=None, height=dp(48))
        self.lang_button = MDRaisedButton(text='Language: Auto')
        items = [
            {"text": "Spanish (es)", "on_release": lambda x=None: self._set_lang('es', 'Spanish')},
            {"text": "French (fr)", "on_release": lambda x=None: self._set_lang('fr', 'French')},
            {"text": "Hindi (hi)", "on_release": lambda x=None: self._set_lang('hi', 'Hindi')},
        ]
        self.lang_menu = MDDropdownMenu(caller=self.lang_button, items=[{"text": i["text"], "on_release": i["on_release"]} for i in items], width_mult=4)
        self.lang_button.bind(on_release=self.lang_menu.open)
        run_btn = MDRaisedButton(text='SIMPLIFY', on_press=self.simplify_text)
        row.add_widget(self.lang_button)
        row.add_widget(run_btn)
        card_in.add_widget(row)

        card_out = MDCard(orientation='vertical', padding=dp(12), spacing=dp(8))
        card_out.add_widget(MDLabel(text='Result', font_style='H6'))
        self.result_label = MDLabel(text='Your simplified text will appear here.', halign='center', theme_text_color='Secondary')
        card_out.add_widget(self.result_label)
        self.actions_label = MDLabel(text='', halign='left', padding=(0, dp(8)))
        card_out.add_widget(self.actions_label)
        actions_row = MDBoxLayout(orientation='horizontal', spacing=dp(8), size_hint_y=None, height=dp(48))
        actions_row.add_widget(MDRaisedButton(text='Speak', on_press=self.speak_result))
        actions_row.add_widget(MDRaisedButton(text='Copy', on_press=self.copy_result))
        actions_row.add_widget(MDRaisedButton(text='Dyslexia Mode: Off', on_press=self.toggle_dyslexia))
        card_out.add_widget(actions_row)

        page.add_widget(card_in)
        page.add_widget(card_out)
        sc = MDScrollView()
        sc.add_widget(page)
        self.add_widget(sc)

    def _set_lang(self, code, label):
        self.target_lang = code
        self.lang_button.text = "Language: " + (label if code else 'Auto')
        self.lang_menu.dismiss()

    def simplify_text(self, *_):
        app = MDApp.get_running_app()
        text_to_simplify = self.input_text.text or ''
        if not text_to_simplify.strip():
            self.result_label.text = 'Please enter some text first.'
            return
        app._last_input_text = text_to_simplify
        api_url = app.api_base + "/simplify"
        body = {"text": text_to_simplify}
        if self.target_lang:
            body["target_lang"] = self.target_lang
        headers = {'Content-type': 'application/json'}
        UrlRequest(api_url, req_body=json.dumps(body), req_headers=headers, on_success=self._on_ok, on_failure=self._on_err, on_error=self._on_err)
        self.result_label.text = 'Processing...'
        self.actions_label.text = ''

    @mainthread
    def _on_ok(self, _, result):
        simplified_text = result.get('simplified_text', 'Could not parse result.')
        translated_text = result.get('translated_text')
        actions = result.get('actions', []) or []
        display_text = translated_text or simplified_text
        self.result_label.text = display_text
        if actions:
            self.actions_label.text = 'Actions & deadlines:\n' + '\n'.join([f'• {a}' for a in actions])
        else:
            self.actions_label.text = ''
        app = MDApp.get_running_app()
        app.add_history_entry({
            'ts': int(time.time()),
            'input': app._last_input_text if hasattr(app, '_last_input_text') else '',
            'output': display_text,
            'actions': actions,
            'lang': self.target_lang or None,
        })

    @mainthread
    def _on_err(self, *args):
        self.result_label.text = 'Error: Could not connect to the server. Is app.py running?'
        self.actions_label.text = ''

    def speak_result(self, *_args):
        speak_text = '\n'.join([t for t in [self.result_label.text, self.actions_label.text] if t])
        if not speak_text:
            return
        if _tts is not None:
            try:
                _tts.speak(text=speak_text)
                return
            except Exception:
                pass
        if pyttsx3 is not None:
            try:
                engine = pyttsx3.init()
                engine.say(speak_text)
                engine.runAndWait()
                return
            except Exception:
                pass

    def toggle_dyslexia(self, button):
        self.dyslexia_mode = not self.dyslexia_mode
        if self.dyslexia_mode:
            self.result_label.font_style = 'H5'
            self.actions_label.font_style = 'Body1'
            button.text = 'Dyslexia Mode: On'
        else:
            self.result_label.font_style = 'Body1'
            self.actions_label.font_style = 'Body2'
            button.text = 'Dyslexia Mode: Off'

    def copy_result(self, *_):
        text = (self.result_label.text or '').strip()
        if not text:
            return
        Clipboard.copy(text)
        MDApp.get_running_app().toast('Copied!')


class HistoryScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        box = MDBoxLayout(orientation='vertical', padding=dp(12), spacing=dp(12))
        card = MDCard(orientation='vertical', padding=dp(10), spacing=dp(6))
        card.add_widget(MDLabel(text='History', font_style='H6'))
        self.scroll = MDScrollView()
        self.list = MDList()
        self.scroll.add_widget(self.list)
        card.add_widget(self.scroll)
        actions = MDBoxLayout(orientation='horizontal', spacing=dp(8), size_hint_y=None, height=dp(48))
        actions.add_widget(MDRaisedButton(text='Refresh', on_press=lambda *_: self.refresh()))
        actions.add_widget(MDRaisedButton(text='Clear', on_press=lambda *_: self.clear_history()))
        card.add_widget(actions)
        box.add_widget(card)
        self.add_widget(box)

    def on_pre_enter(self, *args):
        self.refresh()

    def refresh(self):
        app = MDApp.get_running_app()
        self.list.clear_widgets()
        for it in (app.history or []):
            ts = time.strftime('%m/%d %H:%M', time.localtime(it.get('ts', 0)))
            title = (it.get('output') or '').strip().replace('\n', ' ')
            if len(title) > 80:
                title = title[:77] + '...'
            row = OneLineListItem(text=ts + " — " + title)
            row.bind(on_release=lambda _x, entry=it: self._show_item(entry))
            self.list.add_widget(row)

    def _show_item(self, it):
        out = it.get('output') or ''
        Clipboard.copy(out)
        MDApp.get_running_app().toast('Copied simplified text to clipboard')

    def clear_history(self):
        app = MDApp.get_running_app()
        app.history = []
        app._persist_history()
        self.refresh()


class SourcesScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        box = MDBoxLayout(orientation='vertical', padding=dp(16), spacing=dp(12))
        card = MDCard(orientation='vertical', padding=dp(10), spacing=dp(8))
        card.add_widget(MDLabel(text='Topic sources', font_style='H6'))
        self.topic_field = MDTextField(hint_text='Topic (e.g., climate, immigration)')
        card.add_widget(self.topic_field)
        run = MDRaisedButton(text='Show Sources', on_press=lambda *_: self.load_sources())
        card.add_widget(run)
        self.results_box = MDBoxLayout(orientation='vertical', spacing=dp(8))
        card.add_widget(self.results_box)
        box.add_widget(card)
        self.add_widget(box)

    def load_sources(self):
        app = MDApp.get_running_app()
        topic = (self.topic_field.text or '').strip() or 'general'
        headers = {'Content-type': 'application/json'}
        self.results_box.clear_widgets()
        self.results_box.add_widget(MDLabel(text='Loading...', theme_text_color='Secondary'))
        UrlRequest(app.api_base + "/sources", req_body=json.dumps({'topic': topic}), req_headers=headers,
                   on_success=lambda _r, res: self._ok(res),
                   on_failure=lambda *_: self._err(),
                   on_error=lambda *_: self._err())

    @mainthread
    def _ok(self, res):
        self.results_box.clear_widgets()
        sources = res.get('sources') or []
        if not sources:
            self.results_box.add_widget(MDLabel(text='No sources found.', theme_text_color='Secondary'))
            return
        for s in sources:
            title = s.get('title') or 'Source'
            desc = s.get('summary') or ''
            url = s.get('url') or ''
            item = MDBoxLayout(orientation='vertical', spacing=dp(2))
            item.add_widget(MDLabel(text=title, font_style='Subtitle1'))
            if desc:
                item.add_widget(MDLabel(text=desc, theme_text_color='Secondary'))
            if url:
                item.add_widget(MDLabel(text=url, theme_text_color='Hint'))
            self.results_box.add_widget(item)

    @mainthread
    def _err(self):
        self.results_box.clear_widgets()
        self.results_box.add_widget(MDLabel(text='Could not load sources.', theme_text_color='Error'))


class SettingsScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.api_field = None
        box = MDBoxLayout(orientation='vertical', padding=dp(16), spacing=dp(12))
        box.add_widget(MDLabel(text='Settings', font_style='H5'))
        self.api_field = MDTextField(hint_text='API Base URL', helper_text='e.g., http://127.0.0.1:8010', mode='fill')
        box.add_widget(self.api_field)
        box.add_widget(MDRaisedButton(text='Save', on_press=lambda *_: self.save()))
        self.add_widget(box)

    def on_pre_enter(self, *args):
        app = MDApp.get_running_app()
        self.api_field.text = app.api_base

    def save(self):
        app = MDApp.get_running_app()
        app.api_base = (self.api_field.text or '').strip() or app.api_base
        app._persist_settings()
        app.toast('Settings saved')


class AboutScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        box = MDBoxLayout(orientation='vertical', padding=dp(16), spacing=dp(12))
        box.add_widget(MDLabel(text='About PlainSpeak', font_style='H5'))
        box.add_widget(MDLabel(text='Simplify complex text, find actions, and read with ease.'))
        self.add_widget(box)


class AnalyticsScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.container = MDBoxLayout(orientation='vertical', padding=dp(12), spacing=dp(12))
        self.container.add_widget(MDLabel(text='Analytics', font_style='H5'))
        self.refresh_btn = MDRaisedButton(text='Refresh', pos_hint={'center_x': 0.5}, on_press=lambda *_: self.refresh())
        self.container.add_widget(self.refresh_btn)
        self.add_widget(self.container)

    def on_pre_enter(self, *args):
        self.refresh()

    def refresh(self):
        pass


class CivicBriefScreen(Screen):
    pass


class ImageOverlay(FloatLayout):
    source = StringProperty('')
    image_size = DictProperty({'w': 1, 'h': 1})
    boxes = ListProperty([])


class ScanScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.image_path = None
        self.result = None
        page = MDBoxLayout(orientation='vertical', padding=dp(12), spacing=dp(12))
        card = MDCard(orientation='vertical', padding=dp(10), spacing=dp(8))
        card.add_widget(MDLabel(text='Scan document', font_style='H6'))
        btns = MDBoxLayout(orientation='horizontal', spacing=dp(8), size_hint_y=None, height=dp(48))
        btns.add_widget(MDRaisedButton(text='Pick Image'))
        btns.add_widget(MDRaisedButton(text='Analyze'))
        card.add_widget(btns)
        page.add_widget(card)
        sc = MDScrollView()
        sc.add_widget(page)
        self.add_widget(sc)


class OnePageScreen(Screen):
    pass


class PlainSpeakApp(MDApp):
    def build(self):
        self.theme_cls.theme_style = 'Light'
        self.theme_cls.primary_palette = 'Green'
        self.theme_cls.primary_hue = '600'
        self.settings_path = _user_file('plainspeak_settings.json')
        self.history_path = _user_file('plainspeak_history.json')
        settings = load_json(self.settings_path, {})
        self.api_base = os.environ.get('API_BASE', settings.get('api_base') or 'http://127.0.0.1:8010')
        self.history = load_json(self.history_path, [])

        kv_path = os.path.join(os.path.dirname(__file__), 'app_ui.kv')
        root = Builder.load_file(kv_path)
        self.toolbar = root.ids.toolbar
        self.sm = root.ids.sm
        self._nav_stack = []
        self.sm.current = 'home'
        self.toolbar.title = 'Home'
        try:
            Window.bind(on_key_down=self._on_key)
        except Exception:
            pass
        self._update_toolbar()
        return root

    def go_to(self, name: str):
        current = getattr(self, 'sm', None).current if hasattr(self, 'sm') else None
        if current and current != name:
            self._nav_stack.append(current)
        self.sm.current = name
        self.toolbar.title = name.capitalize()
        self._update_toolbar()

    def back(self, *_):
        if self._nav_stack:
            prev = self._nav_stack.pop()
            self.sm.current = prev
            self.toolbar.title = prev.capitalize()
        else:
            if self.sm.current != 'home':
                self.sm.current = 'home'
                self.toolbar.title = 'Home'
        self._update_toolbar()

    def _update_toolbar(self):
        if getattr(self, 'sm', None) and self.sm.current != 'home':
            self.toolbar.left_action_items = [["arrow-left", lambda x: self.back()]]
        else:
            self.toolbar.left_action_items = []

    def _on_key(self, window, key, scancode, codepoint, modifier):
        if key in (27, 1001):
            self.back()
            return True
        return False

    def _persist_settings(self):
        data = {'api_base': self.api_base}
        save_json(self.settings_path, data)

    def _persist_history(self):
        save_json(self.history_path, self.history)

    def add_history_entry(self, entry: dict):
        self.history.insert(0, entry)
        self.history = self.history[:100]
        self._persist_history()

    def toast(self, message: str):
        try:
            Snackbar(text=message, duration=1).open()
        except Exception:
            print("[toast] " + message)


if __name__ == '__main__':
    PlainSpeakApp().run()
