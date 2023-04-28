import * as path from 'path';

import { Dirent, Stats } from '@nodelib/fs.macchiato';

import type { Entry } from '../../types';

class EntryBuilder {
	#isFile: boolean = true;
	#isDirectory: boolean = false;
	#isSymbolicLink: boolean = false;

	readonly #entry: Entry = {
		name: '',
		path: '',
		dirent: new Dirent(),
	};

	public path(filepath: string): this {
		this.#entry.name = path.basename(filepath);
		this.#entry.path = filepath;

		return this;
	}

	public file(): this {
		this.#isFile = true;
		this.#isDirectory = false;

		return this;
	}

	public directory(): this {
		this.#isDirectory = true;
		this.#isFile = false;

		return this;
	}

	public symlink(): this {
		this.#isSymbolicLink = true;

		return this;
	}

	public stats(): this {
		this.#entry.stats = new Stats();

		return this;
	}

	public build(): Entry {
		this.#entry.dirent = new Dirent({
			name: this.#entry.name,
			isFile: this.#isFile,
			isDirectory: this.#isDirectory,
			isSymbolicLink: this.#isSymbolicLink,
		});

		return this.#entry;
	}
}

export function builder(): EntryBuilder {
	return new EntryBuilder();
}
