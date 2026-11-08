import importlib.util
from pathlib import Path
import tempfile
import csv
import unittest

spec = importlib.util.spec_from_file_location('consolidation', Path(__file__).resolve().parents[1] / 'scripts/consolidate-customers.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def record(email, status, first='Example', last='Person'):
    return {'email': email, 'first_name': first, 'last_name': last, 'status': status, 'phone': '', 'opt_in_time': '', 'unsubscribe_time': '', 'cleaned_time': '', 'source': 'synthetic.csv:2'}


class ConsolidationTests(unittest.TestCase):
    def test_case_and_whitespace_only_email_deduplication(self):
        rows, rejected = module.consolidate([record(' PERSON@example.com ', 'historical_subscriber'), record('person@example.com', 'historical_subscriber'), record('person+tag@example.com', 'historical_subscriber')])
        self.assertEqual(len(rows), 2)
        self.assertEqual(rejected, [])
        self.assertEqual(next(row for row in rows if row['email'] == 'person@example.com')['source_count'], 2)

    def test_unsubscribe_and_cleaned_are_not_overridden(self):
        for status in ['unsubscribed', 'cleaned', 'requires_review_error_list']:
            rows, _ = module.consolidate([record('person@example.com', status), record('person@example.com', 'historical_subscriber')])
            self.assertEqual(rows[0]['mailing_status'], status)
            self.assertEqual(rows[0]['do_not_email'], 'YES')

    def test_historical_subscription_is_not_current_consent(self):
        rows, _ = module.consolidate([record('person@example.com', 'historical_subscriber')])
        self.assertEqual(rows[0]['do_not_email'], 'YES')
        self.assertIn('Not verified', rows[0]['consent_status'])

    def test_invalid_and_missing_addresses_remain_for_review(self):
        records = [record('', 'unknown'), record('not-an-email', 'unknown'), record('person@example..com', 'unknown')]
        rows, rejected = module.consolidate(records)
        self.assertEqual(rows, [])
        self.assertEqual(len(rejected), 3)

    def test_name_variants_preserved_without_name_only_merge(self):
        rows, _ = module.consolidate([record('one@example.com', 'unknown', first='Sample'), record('one@example.com', 'unknown', first='Different'), record('two@example.com', 'unknown', first='Sample')])
        self.assertEqual(len(rows), 2)
        variants = next(row for row in rows if row['email'] == 'one@example.com')['name_variants']
        self.assertIn('Sample', variants)
        self.assertIn('Different', variants)

    def test_csv_quotes_utf8_and_formula_escaping(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'synthetic.csv'
            module.write_csv(path, ['name','phone'], [{'name':'=IMPORTDATA("test")','phone':'+123'}, {'name':'Example, "Quoted"','phone':''}])
            with path.open(encoding='utf-8-sig', newline='') as handle:
                rows = list(csv.DictReader(handle))
            self.assertTrue(rows[0]['name'].startswith("'="))
            self.assertTrue(rows[0]['phone'].startswith("'+"))
            self.assertEqual(rows[1]['name'], 'Example, "Quoted"')
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)


if __name__ == '__main__':
    unittest.main()
