from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import time
from io import BytesIO
from datetime import datetime
import json

try:
    from PIL import Image
except Exception:
    Image = None

try:
    import pytesseract
    from pytesseract import Output as TessOutput
except Exception:
    pytesseract = None
    TessOutput = None

try:
    from googletrans import Translator
    _translator = Translator()
except Exception:
    _translator = None

app = Flask(__name__)
CORS(app)

_summarizer = None
_history = []


def simplify_text_rule_based(text: str, target_grade: int = 8) -> str:
    sentences = _split_sentences(text)
    
    # different reading levels need different amounts of text
    if target_grade <= 5:
        num_sentences = 4
        simplify_vocab = True
        max_words_per_sentence = 30
    elif target_grade <= 8:
        num_sentences = 4
        simplify_vocab = False
        max_words_per_sentence = None
    elif target_grade <= 12:
        num_sentences = 7
        simplify_vocab = False
        max_words_per_sentence = None
    else:
        num_sentences = 10
        simplify_vocab = False
        max_words_per_sentence = None
    
    key_sentences = sentences[:num_sentences]
    
    simplified_sentences = []
    for sentence in key_sentences:
        if not sentence.strip():
            continue
            
        simplified_sentence = sentence.strip()
        
        # for elementary, replace complex words with simple ones
        if simplify_vocab:
            replacements = {
                r'\butilize\b': 'use',
                r'\bcommence\b': 'start',
                r'\bterminate\b': 'end',
                r'\bpurchase\b': 'buy',
                r'\bsubsequent\b': 'next',
                r'\bprior to\b': 'before',
                r'\bin order to\b': 'to',
                r'\bnotwithstanding\b': 'despite',
                r'\bfacilitate\b': 'help',
                r'\bdemonstrate\b': 'show',
                r'\badditional\b': 'more',
                r'\brequire\b': 'need',
                r'\bobtain\b': 'get',
                r'\bprovide\b': 'give',
                r'\bassist\b': 'help',
            }
            for pattern, replacement in replacements.items():
                simplified_sentence = re.sub(pattern, replacement, simplified_sentence, flags=re.IGNORECASE)
        
        # truncate really long sentences
        if max_words_per_sentence:
            words = simplified_sentence.split()
            if len(words) > max_words_per_sentence:
                simplified_sentence = ' '.join(words[:max_words_per_sentence]) + '...'
        
        simplified_sentences.append(simplified_sentence)
    
    simplified = '. '.join(simplified_sentences)
    
    if simplified and not simplified.endswith('.') and not simplified.endswith('...'):
        simplified += '.'
    
    return simplified or text[:200]


def get_summarizer():
    return None


def extract_actions(text: str) -> list:
    if not text:
        return []
    
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    # look for action keywords
    cues = re.compile(r"\b(must|should|need to|required|please|due|by\s+\w+|submit|pay|complete|bring|provide|sign)\b", re.IGNORECASE)
    
    actions = []
    for s in sentences:
        if cues.search(s):
            s_clean = s.strip()
            
            # dont make actions too long
            if len(s_clean) > 240:
                s_clean = s_clean[:237].rstrip() + "..."
            
            actions.append(s_clean)
    
    # remove duplicates
    seen = set()
    unique_actions = []
    
    for a in actions:
        key = a.lower()
        if key not in seen:
            seen.add(key)
            unique_actions.append(a)
    
    return unique_actions


def _split_sentences(text: str) -> list:
    if not text:
        return []
    return re.split(r"(?<=[.!?])\s+", text.strip())


def _detect_pros_cons(sentences):
    pros_kw = re.compile(
        r"\b(benefit|improve|support|enable|opportunity|increase|protect|help|reduce costs?)\b", 
        re.I
    )
    cons_kw = re.compile(
        r"\b(risk|concern|cost|harm|limit|reduce|decrease|burden|challenge|problem)\b", 
        re.I
    )
    
    pros = []
    cons = []
    
    for s in sentences:
        if pros_kw.search(s) and not cons_kw.search(s):
            pros.append(s.strip())
        elif cons_kw.search(s) and not pros_kw.search(s):
            cons.append(s.strip())
    
    return pros[:8], cons[:8]


def _detect_stakeholders(text: str):
    civic_terms = [
        'Residents', 'Students', 'Teachers', 'Parents', 'Small Businesses', 'Nonprofits',
        'City Council', 'County Board', 'State Agencies', 'Vendors', 'Taxpayers'
    ]
    
    found = []
    
    for term in civic_terms:
        if re.search(rf"\b{re.escape(term)}\b", text):
            found.append({'name': term, 'role': 'Stakeholder'})
    
    # also look for capitalized names
    caps = re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b", text)
    
    for c in caps[:5]:
        if not any(s['name'] == c for s in found):
            found.append({'name': c, 'role': 'Mentioned'})
    
    return found[:8]


def _detect_deadline(s: str):
    m = re.search(r"\bby\s+([A-Z][a-z]+\s+\d{1,2})\b", s)
    if m:
        return m.group(1)
    
    m = re.search(r"\bdue\s+(\d{1,2}/\d{1,2}(?:/\d{2,4})?)\b", s, re.I)
    if m:
        return m.group(1)
    
    return None

def _ocr_image_to_lines(img):
    if pytesseract is None or TessOutput is None:
        raise RuntimeError('Install Tesseract and pytesseract.')
    
    data = pytesseract.image_to_data(img, output_type=TessOutput.DICT)
    n = len(data.get('text', []))
    by_line = {}
    for i in range(n):
        txt = (data['text'][i] or '').strip()
        if not txt:
            continue
        if int(data.get('conf', ['-1'])[i]) < 0:
            continue

        key = (data.get('block_num', [0])[i], data.get('line_num', [0])[i])
        left = data.get('left', [0])[i]
        top = data.get('top', [0])[i]
        width = data.get('width', [0])[i]
        height = data.get('height', [0])[i]
        
        entry = by_line.get(key)
        
        if entry is None:
            entry = {'words': [], 'x1': left, 'y1': top, 'x2': left+width, 'y2': top+height}
        else:
            entry['x1'] = min(entry['x1'], left)
            entry['y1'] = min(entry['y1'], top)
            entry['x2'] = max(entry['x2'], left+width)
            entry['y2'] = max(entry['y2'], top+height)
        entry['words'].append(txt)
        by_line[key] = entry
    
    lines = []
    for _, v in by_line.items():
        text_line = ' '.join(v['words']).strip()
        lines.append({
            'text': text_line, 
            'x': int(v['x1']), 
            'y': int(v['y1']), 
            'w': int(v['x2']-v['x1']), 
            'h': int(v['y2']-v['y1'])
        })
    lines.sort(key=lambda d: (d['y'], d['x']))
    full_text = '\n'.join(l['text'] for l in lines if l['text'])
    return lines, full_text, {'w': img.width, 'h': img.height}


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json(force=True, silent=True) or {}
    text = (data.get('text') or '').strip()
    urls = data.get('urls') or []
    flags = data.get('flags') or {}

    if not text and not urls:
        return jsonify({'error': 'No text or urls provided'}), 400

    summary_text = ''
    if text:
        summarizer = get_summarizer()
        try:
            sm = summarizer(text, max_length=160, min_length=40, do_sample=False)
            summary_text = sm[0]['summary_text']
        except Exception:
            summary_text = text[:400] + ('...' if len(text) > 400 else '')

    bullets = []
    for s in _split_sentences(summary_text)[:6]:
        bullets.append({
            'text': s.strip(), 
            'sources': [{'title': 'Document', 'url': urls[0] if urls else None}]
        })

    pros = []
    cons = []
    
    if flags.get('pros_cons', True):
        sents = _split_sentences(text)
        pros, cons = _detect_pros_cons(sents)
        pros = [
            {'text': p, 'sources': [{'title': 'Document', 'url': urls[0] if urls else None}]} 
            for p in pros
        ]
        cons = [
            {'text': c, 'sources': [{'title': 'Document', 'url': urls[0] if urls else None}]} 
            for c in cons
        ]

    stakeholders = []
    if flags.get('stakeholders', True):
        stakeholders = _detect_stakeholders(text)

    actions = []
    if flags.get('actions', True):
        for a in extract_actions(text):
            actions.append({
                'text': a,
                'due': _detect_deadline(a),
                'sources': [{'title': 'Document', 'url': urls[0] if urls else None}],
            })

    contradictions = []

    sources = []
    if urls:
        for i, u in enumerate(urls):
            sources.append({'id': f'src{i+1}', 'title': u, 'url': u})
    else:
        sources.append({'id': 'doc', 'title': 'Document', 'url': None})

    return jsonify({
        'summary': summary_text,
        'bullets': bullets,
        'pros': pros,
        'cons': cons,
        'stakeholders': stakeholders,
        'actions': actions,
        'contradictions': contradictions,
        'sources': sources,
        'ts': int(time.time()),
    })


@app.route('/ocr_simplify', methods=['POST'])
@app.route('/analyze_image', methods=['POST'])
def ocr_simplify():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    
    try:
        content = file.read()
        
        if not content:
            return jsonify({'error': 'Empty image'}), 400
        if Image is None:
            return jsonify({'error': 'PIL not available on server'}), 500
        
        img = Image.open(BytesIO(content)).convert('RGB')
    
    except Exception:
        return jsonify({'error': 'Could not read image'}), 400

    try:
        lines, full_text, img_size = _ocr_image_to_lines(img)
    except Exception as e:
        return jsonify({'error': 'ocr failed: ' + str(e)}), 500

    simplified_text = simplify_text_rule_based(full_text) if full_text else "No text found"
    actions = extract_actions(full_text)
    
    # find action items in the image
    cue = re.compile(
        r"\b(must|should|need to|required|please|due|submit|pay|complete|bring|provide|sign)\b", 
        re.I
    )
    action_boxes = []
    
    for ln in lines:
        if cue.search(ln['text']):
            action_boxes.append({
                'text': ln['text'], 
                'x': ln['x'], 
                'y': ln['y'], 
                'w': ln['w'], 
                'h': ln['h']
            })

    return jsonify({
        'extracted_text': full_text,
        'simplified_text': simplified_text,
        'actions': actions,
        'full_text': full_text,
        'image_size': img_size,
        'boxes': lines,
        'action_boxes': action_boxes,
    })


@app.route('/simplify', methods=['POST'])
def simplify_endpoint():
    try:
        data = request.get_json(force=True, silent=True) or {}
        text_to_simplify = data.get('text', '')
        target_lang = data.get('target_lang')
        target_grade = data.get('target_grade', 8)

        if not text_to_simplify:
            return jsonify({'error': 'No text provided'}), 400

        simplified_text = simplify_text_rule_based(text_to_simplify, target_grade)
        actions = extract_actions(text_to_simplify)

        translated = None
        
        # translate if language is selected
        if target_lang and _translator is not None:
            try:
                translated = _translator.translate(simplified_text, dest=target_lang).text
            except Exception:
                translated = None

        response = {
            'original_text': text_to_simplify,
            'simplified_text': simplified_text,
            'simplification_type': 'extraction',
            'actions': actions,
            'translated_text': translated,
            'target_lang': target_lang,
            'target_grade': target_grade,
            'readability': {
                'before': len(text_to_simplify.split()),
                'after': len(simplified_text.split())
            }
        }

        _history.append({
            'id': len(_history) + 1,
            'timestamp': datetime.now().isoformat(),
            'original_text': text_to_simplify[:200] + ('...' if len(text_to_simplify) > 200 else ''),
            'simplified_text': simplified_text,
            'actions': actions,
            'type': 'text'
        })

        return jsonify(response)
    
    except Exception as e:
        print("error in /simplify: " + str(e))
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'server error: ' + str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


@app.route('/history', methods=['GET'])
def get_history():
    return jsonify({'items': list(reversed(_history))})


@app.route('/sources', methods=['POST'])
def sources():
    data = request.get_json(force=True, silent=True) or {}
    topic = (data.get('topic') or '').strip().lower()

    common = [
        {
            'title': 'USA.gov — Topic Overview',
            'url': 'https://www.usa.gov/',
            'summary': 'Official U.S. government portal with links to services and plain-language explainers.'
        },
        {
            'title': 'Wikipedia — Overview',
            'url': 'https://en.wikipedia.org/',
            'summary': 'A broad, community-maintained overview. Use as a primer and follow references for depth.'
        },
        {
            'title': 'CRS Reports (Congressional Research Service)',
            'url': 'https://crsreports.congress.gov/',
            'summary': 'Nonpartisan backgrounders on legislation and policy. Often dense, but highly credible.'
        }
    ]

    curated = {
        'climate': [
            {
                'title': 'EPA — Climate Change Basics',
                'url': 'https://www.epa.gov/climatechange',
                'summary': 'Plain-language explanations of causes, impacts, and actions from the U.S. EPA.'
            },
            {
                'title': 'NOAA Climate.gov',
                'url': 'https://www.climate.gov/',
                'summary': 'Data-driven stories, maps, and explainers from NOAA.'
            },
        ],
        'immigration': [
            {
                'title': 'USCIS — Immigration Resources',
                'url': 'https://www.uscis.gov/',
                'summary': 'Official forms, timelines, and guides; best for process details.'
            },
            {
                'title': 'American Immigration Council — Policy Explainers',
                'url': 'https://www.americanimmigrationcouncil.org/topics',
                'summary': 'Readable explainers on key immigration topics.'
            },
        ],
        'student loans': [
            {
                'title': 'Federal Student Aid — Loan Guide',
                'url': 'https://studentaid.gov/loans',
                'summary': 'Official info on loan types, repayment, and forgiveness.'
            },
            {
                'title': 'Consumer Finance (CFPB) — Student Loans',
                'url': 'https://www.consumerfinance.gov/paying-for-college/',
                'summary': 'Plain-language guides on managing loans and avoiding pitfalls.'
            },
        ],
        'elections': [
            {
                'title': 'U.S. Election Assistance Commission',
                'url': 'https://www.eac.gov/',
                'summary': 'How voting works, election administration, and best practices.'
            },
            {
                'title': 'Ballotpedia — Election Info',
                'url': 'https://ballotpedia.org/',
                'summary': 'Neutral summaries of candidates, ballots, and measures.'
            },
        ],
    }

    results = curated.get(topic) or []
    results = results + common
    return jsonify({'topic': topic, 'sources': results})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", "5003"))
    print("\nbackend starting -> localhost:" + str(port) + "\n")
    app.run(host='0.0.0.0', port=port, debug=True)
