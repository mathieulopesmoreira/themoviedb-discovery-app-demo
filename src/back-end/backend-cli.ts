#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAndInitDatabase, DEFAULT_DB_PATH } from './database/schema';
import { importGenresFromCsv, cleanUnusedGenres } from './database/genre-csv';
import {
  importCountriesFromCsv,
  cleanUnusedCountries,
} from './database/country-csv';
import { importMoviesFromCsv } from './database/movie-csv';

const program = new Command();

program
  .name('backend-cli')
  .description('CLI pour la gestion de la base de données TMDB Discovery App')
  .option('--path <path>', 'Chemin du fichier SQLite', DEFAULT_DB_PATH);

program
  .command('add-genres <csv-file>')
  .description('Importer ou actualiser les genres depuis un fichier CSV')
  .action((csvFile: string) => {
    const opts = program.opts<{ path: string }>();
    const dbPath = resolve(process.cwd(), opts.path);
    const resolvedCsv = resolve(process.cwd(), csvFile);
    const content = readFileSync(resolvedCsv, 'utf8');

    const db = createAndInitDatabase(dbPath);
    try {
      const count = importGenresFromCsv(db, content);
      console.log(`Importé/actualisé ${count} genres dans ${dbPath}`);
    } finally {
      db.close();
    }
  });

program
  .command('clean-genres')
  .description('Supprimer les genres non associés à des films')
  .action(() => {
    const opts = program.opts<{ path: string }>();
    const dbPath = resolve(process.cwd(), opts.path);
    const db = createAndInitDatabase(dbPath);
    try {
      const removed = cleanUnusedGenres(db);
      console.log(`Supprimé ${removed} genres inutilisés dans ${dbPath}`);
    } finally {
      db.close();
    }
  });

program
  .command('add-countries <csv-file>')
  .description('Importer ou actualiser les pays depuis un fichier CSV')
  .action((csvFile: string) => {
    const opts = program.opts<{ path: string }>();
    const dbPath = resolve(process.cwd(), opts.path);
    const resolvedCsv = resolve(process.cwd(), csvFile);
    const content = readFileSync(resolvedCsv, 'utf8');

    const db = createAndInitDatabase(dbPath);
    try {
      const count = importCountriesFromCsv(db, content);
      console.log(`Importé/actualisé ${count} pays dans ${dbPath}`);
    } finally {
      db.close();
    }
  });

program
  .command('clean-countries')
  .description('Supprimer les pays non associés à des films')
  .action(() => {
    const opts = program.opts<{ path: string }>();
    const dbPath = resolve(process.cwd(), opts.path);
    const db = createAndInitDatabase(dbPath);
    try {
      const removed = cleanUnusedCountries(db);
      console.log(`Supprimé ${removed} pays inutilisés dans ${dbPath}`);
    } finally {
      db.close();
    }
  });

program
  .command('add-movies <csv-file>')
  .description('Importer ou actualiser les films depuis un fichier CSV')
  .action((csvFile: string) => {
    const opts = program.opts<{ path: string }>();
    const dbPath = resolve(process.cwd(), opts.path);
    const resolvedCsv = resolve(process.cwd(), csvFile);
    const content = readFileSync(resolvedCsv, 'utf8');

    const db = createAndInitDatabase(dbPath);
    try {
      const count = importMoviesFromCsv(db, content);
      console.log(`Importé/actualisé ${count} films dans ${dbPath}`);
    } finally {
      db.close();
    }
  });

program.action(() => {
  const opts = program.opts<{ path: string }>();
  const dbPath = resolve(process.cwd(), opts.path);
  const db = createAndInitDatabase(dbPath);
  try {
    console.log(`Base de données initialisée avec succès dans ${dbPath}`);
  } finally {
    db.close();
  }
});

program.parse(process.argv);
