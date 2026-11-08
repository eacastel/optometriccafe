"""Read-only local contact consolidation. Outputs must remain in private-exports/."""
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from zipfile import ZipFile

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / 'private-exports/runtime'))
EMAIL = re.compile(r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}")
ROOT = Path('/home/eacastel/NAS/AI/AI - CLIENTS inactive/Optometric Cafe')
OUTPUT = PROJECT / 'private-exports'
FIELDS = ['email', 'first_name', 'last_name', 'name_variants', 'phone', 'mailing_status', 'do_not_email', 'consent_status', 'observed_statuses', 'opt_in_times', 'unsubscribe_times', 'cleaned_times', 'source_count', 'source_references']


def safe_cell(value):
    value = str(value or '')
    return "'" + value if value.lstrip().startswith(('=', '+', '-', '@')) else value


def status_for(label):
    label = label.lower()
    if 'error-optometric' in label:
        return 'requires_review_error_list'
    if 'unsub' in label:
        return 'unsubscribed'
    if 'cleaned' in label:
        return 'cleaned'
    if 'ocr' in label:
        return 'requires_review_ocr'
    if any(word in label for word in ['subscribed', 'subscriber']):
        return 'historical_subscriber'
    return 'unknown'


def disposition(statuses):
    for status in ['unsubscribed', 'cleaned', 'requires_review_error_list', 'requires_review_ocr']:
        if status in statuses:
            return status
    return 'historical_subscriber' if 'historical_subscriber' in statuses else 'unknown'


def normalize_email(value):
    value = str(value or '').strip()
    if not EMAIL.fullmatch(value):
        return None
    local, domain = value.rsplit('@', 1)
    if local.startswith('.') or local.endswith('.') or '..' in local or any(not label or label.startswith('-') or label.endswith('-') for label in domain.split('.')):
        return None
    return value.lower()


def write_csv(path, fields, rows):
    with path.open('w', encoding='utf-8-sig', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: safe_cell(row.get(field, '')) for field in fields})
    path.chmod(0o600)


def consolidate(records):
    groups = {}
    rejected = []
    for record in records:
        email = normalize_email(record['email'])
        if not email:
            rejected.append(record)
            continue
        groups.setdefault(email, []).append(record)
    rows = []
    for email, entries in sorted(groups.items()):
        statuses = {entry['status'] for entry in entries}
        status = disposition(statuses)
        names = sorted({(entry['first_name'], entry['last_name']) for entry in entries if entry['first_name'] or entry['last_name']})
        # Prefer the most complete recorded name; retain every variant for review.
        first, last = max(names, key=lambda name: (bool(name[0]) + bool(name[1]), len(' '.join(name))), default=('', ''))
        values = lambda key: ' | '.join(sorted({entry[key] for entry in entries if entry.get(key)}))
        rows.append(dict(zip(FIELDS, [
            email, first, last, json.dumps(names, ensure_ascii=False), values('phone'), status,
            'YES', 'Not verified for current marketing; historical source data only',
            ' | '.join(sorted(statuses)), values('opt_in_time'), values('unsubscribe_time'), values('cleaned_time'),
            len(entries), values('source'),
        ])))
    return rows, rejected


def main():
    import openpyxl
    import xlrd
    from PIL import Image
    OUTPUT.mkdir(mode=0o700, exist_ok=True)
    OUTPUT.chmod(0o700)
    os.umask(0o077)
    records, sources, skipped = [], [], []
    hashes = {}

    def table(rows, label, sheet='', fingerprint=''):
        rows = [list(row) for row in rows if any(str(value or '').strip() for value in row)]
        if not rows:
            return
        header = [re.sub(r'[^a-z0-9]', '', str(value or '').lower()) for value in rows[0]]
        email_index = next((i for i, value in enumerate(header) if value in ['email', 'emailaddress', 'email1']), None)
        if email_index is None:
            if normalize_email(rows[0][0]):
                header = ['emailaddress', 'firstname', 'lastname'] + [f'field{i}' for i in range(3, len(rows[0]))]
                email_index, start = 0, 0
            else:
                skipped.append({'source': label, 'sheet': sheet, 'reason': 'No supported email column'})
                return
        else:
            start = 1
        count_before = len(records)
        for number, values in enumerate(rows[start:], start=start + 1):
            data = dict(zip(header, [str(value).strip() if value is not None else '' for value in values]))
            email = data.get(header[email_index], '')
            if not email and not data.get('firstname') and not data.get('lastname'):
                continue
            records.append({
                'email': email, 'first_name': data.get('firstname', ''), 'last_name': data.get('lastname', ''),
                'phone': data.get('phonenumber', data.get('phone', '')),
                'status': status_for(label), 'opt_in_time': data.get('optintime', ''),
                'unsubscribe_time': data.get('unsubtime', ''), 'cleaned_time': data.get('cleantime', ''),
                'source': f'{label} [sheet={sheet}; row={number}]',
            })
        sources.append({'source': label, 'sheet': sheet, 'sha256': fingerprint, 'records': len(records)-count_before, 'status': status_for(label)})

    mailing_roots = [ROOT.parent / 'optometric-mail-exports', ROOT / 'optometric-mail-exports', ROOT / 'Assets/optometric-mail-exports']
    for directory in mailing_roots:
        for path in sorted(directory.glob('*.zip')):
            content = path.read_bytes()
            digest = hashlib.sha256(content).hexdigest()
            label = str(path)
            if digest in hashes:
                sources.append({'source': label, 'duplicate_of': hashes[digest], 'sha256': digest, 'records': 0})
                continue
            hashes[digest] = label
            with ZipFile(io.BytesIO(content)) as archive:
                for info in archive.infolist():
                    if not info.filename.endswith('.csv') or info.file_size > 10_000_000:
                        continue
                    text = archive.read(info).decode('utf-8-sig')
                    table(csv.reader(io.StringIO(text)), f'{label}::{info.filename}', fingerprint=digest)

    paths = sorted((ROOT / 'Database').glob('*.xls*')) + [ROOT / 'error-optometric-lists.xlsx']
    for path in paths:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if path.suffix == '.xls':
            book = xlrd.open_workbook(path)
            for sheet in book.sheets():
                rows = []
                for row in range(sheet.nrows):
                    rows.append([xlrd.xldate_as_datetime(cell.value, book.datemode).isoformat() if cell.ctype == xlrd.XL_CELL_DATE else cell.value for cell in sheet.row(row)])
                table(rows, str(path), sheet.name, digest)
        else:
            book = openpyxl.load_workbook(path, read_only=True, data_only=True)
            for sheet in book.worksheets:
                table(sheet.iter_rows(values_only=True), str(path), sheet.title, digest)
            book.close()

    # The subscriber PDF is scanned. Keep OCR provenance and require human review.
    pdf = ROOT / 'Database/OC-subscribers to add.pdf'
    ocr = OUTPUT / 'ocr-review'
    ocr.mkdir(mode=0o700, exist_ok=True)
    subprocess.run(['pdftoppm', '-r', '200', '-png', str(pdf), str(ocr/'subscribers')], check=True, capture_output=True)
    ocr_candidates, ocr_lines = [], []
    for image in sorted(ocr.glob('subscribers-*.png')):
        # Pages 2/3 are sideways notebook spreads, verified visually from the scan.
        segments = []
        if image.stem.endswith(('-2','-3')):
            with Image.open(image) as page:
                upright = page.transpose(Image.Transpose.ROTATE_270)
                middle = upright.width // 2
                for side, box in [('left',(0,0,middle,upright.height)), ('right',(middle,0,upright.width,upright.height))]:
                    segment = ocr / f'upright-{image.stem}-{side}.png'
                    upright.crop(box).save(segment)
                    segments.append(segment)
        else:
            segments.append(image)
        for segment in segments:
            result = subprocess.run(['tesseract', str(segment), 'stdout', '--psm', '6'], check=True, capture_output=True, text=True)
            (ocr / f'{segment.stem}.txt').write_text(result.stdout, encoding='utf-8')
            for line_number, line in enumerate(result.stdout.splitlines(), 1):
                reference = f'{pdf.name}:{segment.stem}:{line_number}'
                if '@' in line or re.search(r'gmail|yahoo|aol|hotmail', line, re.I):
                    ocr_lines.append({'source': reference, 'raw_line': line, 'review_required': 'YES'})
                for email in EMAIL.findall(line):
                    ocr_candidates.append({'candidate_email': email, 'source': reference, 'raw_line': line, 'review_required': 'YES'})
    write_csv(OUTPUT/'ocr-email-candidates-review.csv', ['candidate_email','source','raw_line','review_required'], ocr_candidates)
    write_csv(OUTPUT/'handwritten-address-lines-review.csv', ['source','raw_line','review_required'], ocr_lines)
    skipped.append({'source': str(pdf), 'reason': 'Scanned subscriber sheet; OCR candidates are separate and must be verified before merging', 'ocr_email_candidates': len(ocr_candidates)})
    for path in ROOT.glob('oc[1-4].txt'):
        skipped.append({'source': str(path), 'reason': 'No email addresses found; not treated as a customer list'})

    rows, rejected = consolidate(records)
    write_csv(OUTPUT/'optometric-cafe-customers-consolidated.csv', FIELDS, rows)
    write_csv(OUTPUT/'contacts-requiring-review.csv', ['email','first_name','last_name','status','source'], rejected)
    report = {
        'created_at': datetime.now(timezone.utc).isoformat(), 'source_rows': len(records), 'unique_email_contacts': len(rows),
        'duplicate_email_rows_merged': len(records)-len(rows)-len(rejected), 'invalid_or_missing_email_rows': len(rejected),
        'status_counts': dict(Counter(row['mailing_status'] for row in rows)), 'sources': sources, 'skipped_or_review': skipped,
        'policy': 'All rows are do_not_email=YES. Subscription status is historical, not present-day consent. Unsubscribed/cleaned/error-list evidence overrides old subscription evidence. Exact normalized email deduplication only; no guessed corrections. OCR candidates remain separate.',
    }
    (OUTPUT/'consolidation-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    (OUTPUT/'README.txt').write_text('PRIVATE CUSTOMER CONTACT CONSOLIDATION\n\nOpen optometric-cafe-customers-consolidated.csv in a spreadsheet. UTF-8 BOM and quoted CSV support are included. Spreadsheet formulas are escaped.\n\nThe data comes from historical mailing lists; it does not prove customer status or current marketing permission. All rows are marked DO NOT EMAIL pending consent review. Unsubscribe, cleaned and error-list flags are preserved conservatively. Do not import the CSV as a subscribed/sendable list.\n\ncontacts-requiring-review.csv retains records with missing/invalid email addresses. The scanned PDF is in ocr-review; OCR candidates are in ocr-email-candidates-review.csv and are NOT merged automatically because handwriting/OCR may be wrong.\n\nconsolidation-report.json records every included source, duplicate archive and limitation. NAS sources were read only and unchanged. This directory is excluded from Git and Vercel; never place it under public/.\n', encoding='utf-8')
    print(json.dumps({key: report[key] for key in ['source_rows','unique_email_contacts','duplicate_email_rows_merged','invalid_or_missing_email_rows','status_counts']}, indent=2))
    print(f'OCR candidates requiring review: {len(ocr_candidates)}. Private CSV: {OUTPUT / "optometric-cafe-customers-consolidated.csv"}')


if __name__ == '__main__':
    main()
