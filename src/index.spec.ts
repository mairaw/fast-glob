import * as assert from 'assert';

import * as tests from './tests';
import * as fg from '.';

import type { EntryItem, ErrnoException } from './types';

// Only for validating the input data.
const invalidInputData = null as unknown as string;

describe('Package', () => {
	describe('.sync', () => {
		it('should throw an error when input values can not pass validation', () => {
			const message = 'Patterns must be a string (non empty) or an array of strings';

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			assert.throws(() => fg.sync(invalidInputData), { message });
			assert.throws(() => fg.sync(''), { message });
		});

		it('should returns entries', () => {
			const expected: EntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md',
				'fixtures/third/library/a/book.md',
				'fixtures/third/library/b/book.md',
			];

			const actual = fg.sync(['fixtures/**/*.md']);

			actual.sort((a, b) => a.localeCompare(b));

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (two sources)', () => {
			const expected: EntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md',
			];

			const actual = fg.sync(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			actual.sort((a, b) => a.localeCompare(b));

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.async', () => {
		it('should throw an error when input values can not pass validation', async () => {
			const message = 'Patterns must be a string (non empty) or an array of strings';

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await assert.rejects(() => fg(invalidInputData), { message });
			await assert.rejects(() => fg(''), { message });
		});

		it('should returns entries', async () => {
			const expected: EntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md',
				'fixtures/third/library/a/book.md',
				'fixtures/third/library/b/book.md',
			];

			const actual = await fg(['fixtures/**/*.md']);

			actual.sort((a, b) => a.localeCompare(b));

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (two sources)', async () => {
			const expected: EntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md',
			];

			const actual = await fg(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			actual.sort((a, b) => a.localeCompare(b));

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.stream', () => {
		it('should throw an error when input values can not pass validation', () => {
			const message = 'Patterns must be a string (non empty) or an array of strings';

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			assert.throws(() => fg.stream(invalidInputData), { message });
			assert.throws(() => fg.stream(''), { message });
		});

		it('should returns entries', (done) => {
			const expected: string[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md',
				'fixtures/third/library/a/book.md',
				'fixtures/third/library/b/book.md',
			];

			const actual: string[] = [];

			const stream = fg.stream(['fixtures/**/*.md']);

			stream.on('data', (entry: string) => actual.push(entry));
			stream.once('error', (error: ErrnoException) => assert.fail(error));
			stream.once('end', () => {
				actual.sort((a, b) => a.localeCompare(b));

				assert.deepStrictEqual(actual, expected);
				done();
			});
		});

		it('should returns entries (two sources)', (done) => {
			const expected: EntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md',
			];

			const actual: string[] = [];

			const stream = fg.stream(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			stream.on('data', (entry: string) => actual.push(entry));
			stream.once('error', (error: ErrnoException) => assert.fail(error));
			stream.once('end', () => {
				actual.sort((a, b) => a.localeCompare(b));

				assert.deepStrictEqual(actual, expected);
				done();
			});
		});
	});

	describe('.generateTasks', () => {
		it('should throw an error when input values can not pass validation', () => {
			const message = 'Patterns must be a string (non empty) or an array of strings';

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			assert.throws(() => fg.generateTasks(invalidInputData), { message });
			assert.throws(() => fg.generateTasks(''), { message });
		});

		it('should return tasks', () => {
			const expected = [
				tests.task.builder().base('.').positive('*').build(),
			];

			const actual = fg.generateTasks(['*']);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return tasks with negative patterns', () => {
			const expected = [
				tests.task.builder().base('.').positive('*').negative('*.txt').negative('*.md').build(),
			];

			const actual = fg.generateTasks(['*', '!*.txt'], { ignore: ['*.md'] });

			assert.deepStrictEqual(actual, expected);
		});

		it('should clean up patterns', () => {
			const expected = [
				// Clean up duplicate slashes
				tests.task.builder().base('fixtures').positive('fixtures/*').build(),
			];

			const actual = fg.generateTasks(['fixtures//*']);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.isDynamicPattern', () => {
		it('should return true for dynamic pattern', () => {
			assert.ok(fg.isDynamicPattern('*'));
		});

		it('should return false for static pattern', () => {
			assert.ok(!fg.isDynamicPattern('abc'));
		});
	});

	describe('.escapePath', () => {
		it('should return escaped path', () => {
			const expected = 'C:/Program Files \\(x86\\)';

			const actual = fg.escapePath('C:/Program Files (x86)');

			assert.strictEqual(actual, expected);
		});
	});
});
