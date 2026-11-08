# Local Contact Consolidation

Customer files are in the repository's **private-exports/** directory, not in `public/`. Both Git and Vercel ignore this directory. Never commit, publish or deploy its contents.

Run `python3 scripts/consolidate-customers.py` to reproduce the export from the explicitly supplied NAS folders. The script uses read-only spreadsheet/ZIP readers and local OCR; it does not upload customer data or change NAS sources. Dependencies `openpyxl` and `xlrd` can be installed under `private-exports/runtime`; Pillow, Tesseract and Poppler are required for the scanned PDF. It writes a UTF-8 BOM CSV, a private audit, invalid-address review rows, and separate handwriting/OCR review files.

Deduplication uses exact normalized email only, never guessed names or fuzzy address correction. Identical ZIP copies are not imported repeatedly. Unsubscribe, cleaned/bounced and error-list evidence is retained conservatively. All contacts are marked `do_not_email=YES` until current consent and accuracy are checked; historical "subscribed" files are not evidence of present permission. Formula-leading CSV values are escaped and output permissions are owner-only.

The scanned subscriber notebook contains handwriting and incomplete address shorthand. OCR candidates and address lines remain in private review files, not automatically added as valid contacts. The report lists these limitations explicitly. No outreach, list upload, re-subscription, or campaign is authorized by this consolidation.

Test synthetic merge/suppression/formula cases with `python3 -m unittest discover -s tests -p 'test_customer*.py'`. Tests contain no real contact data.
