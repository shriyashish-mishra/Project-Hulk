/**
 * A small RFC4180-correct CSV parser — hand-rolled rather than a naive
 * `split(',')`/`split('\n')`, because this app's CSV import source (the
 * web app's report export) includes a "Raw Response" column that's a full
 * multi-paragraph Claude reply: it contains real commas and real
 * newlines, wrapped in double quotes with `""` as the escape for a
 * literal quote. A line-based split would silently corrupt every row
 * after the first one containing such a field.
 *
 * Returns rows of raw string cells, header row included as row 0 — no
 * column-name mapping here, that's the importer's job.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  function pushField() {
    row.push(field);
    field = '';
  }

  function pushRow() {
    pushField();
    rows.push(row);
    row = [];
  }

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ',') {
      pushField();
      i += 1;
      continue;
    }
    if (char === '\r') {
      // Bare \r (old Mac line endings) or the \r of a \r\n pair — either
      // way, treat it as the row terminator and let \n (if present) be
      // consumed on the next iteration without starting an empty row.
      pushRow();
      i += 1;
      if (text[i] === '\n') i += 1;
      continue;
    }
    if (char === '\n') {
      pushRow();
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  // A trailing newline leaves nothing left to push; anything else
  // (including a file with no trailing newline at all) still holds a
  // final row's worth of data.
  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** Turns parsed rows (header + data rows) into an array of column-name-keyed records — what the importer actually wants to work with. */
export function csvRowsToRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const [header, ...dataRows] = rows;
  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    header.forEach((column, index) => {
      record[column] = row[index] ?? '';
    });
    return record;
  });
}
