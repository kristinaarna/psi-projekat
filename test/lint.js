'use strict';

const fsRec = require('../fs-rec');

const TAB_SIZE = 2;
const TAB = ' '.repeat(TAB_SIZE);

const textExts = [
  'txt',
  'md',
  'bat',
  'js',
  'json',
  'htm',
  'css',
];

const allExts = textExts.concat([
  'png',
  'pdf',
  'docx',
  'blend',
  'zip',
]);

let cyr = 'абвгдђежзијклљмнњопрстћуфхцчџш';

const allowedChars = O.ca(95, i => O.sfcc(i + 32)).join('') +
  '\r\n'.split('') + cyr + cyr.toUpperCase();

const dir = path.join(cwd, '../../..');

(async () => {
  await fsRec.processFilesSync(dir, d => {
    if(d.processed) return;

    const f = d.fullPath;
    const sf = O.sf(d.relativeSubPath.replace(/\\/g, '/'));

    const dirs = f.split(/[\/\\]/);
    if(dirs.includes('.git')) return;

    const stat = fs.statSync(f);

    if(stat.isFile()){
      const e = (msg, line=null) => {
        msg = `${TAB}has ${msg}`;
        if(line !== null) msg = `${TAB}on line ${line + 1}\n${msg}`;
        err(`File ${sf}\n${msg}`);
      };

      if(!allExts.includes(d.ext))
        e(`forbidden extension ${O.sf(d.ext)}`);

      if(textExts.includes(d.ext)){
        const str = O.rfs(f, 1);

        if(str.length === 0)
          e('no content');

        if(str.startsWith(' '))
          e('space at the beginning');

        if(/[\r\n]/.test(str.replace(/\r\n/g, '')))
          e('non-CRLF line breaks');

        const lines = O.sanl(str);

        if(lines[0].length === 0)
          e('new line at the beginning');

        if(O.last(lines).length === 0)
          e('new line at the end');

        lines.forEach((line, i) => {
          if(line.endsWith(' '))
            e('space at the end of line', i);

          if(/\t/.test(line))
            e('tabs instead of spaces', i);

          if(/ {2}/.test(line.trim()))
            e('two consecutive spaces', i);

          {
            const index = line.split('').findIndex(c => !allowedChars.includes(c));
            if(index !== -1)
              e(`illegal unicode character \\u${O.hex(O.cc(line[index]), 2)}`, i);
          }

          if(i !== 0){
            const prev = lines[i - 1];

            if(line.length === 0 && prev.length === 0)
              e('two consecutive empty lines', i);

            const len = line.match(/^ */)[0].length;
            const lenPrev = prev.length !== 0 ?
              prev.match(/^ */)[0].length :
              lines[i - 2].match(/^ */)[0].length;
            const diff = len - lenPrev;

            if(Math.abs(diff) % TAB_SIZE !== 0)
              e(`indentation level that is not a multiple of ${TAB_SIZE}`, i);

            if(diff > 0 && diff !== TAB_SIZE)
              e(`wrong indentation (must be exactly ${TAB_SIZE} spaces)`, i);
          }
        });
      }

      return;
    }

    if(stat.isDirectory()){
      const e = msg => {
        msg = `${TAB}${msg}`;
        err(`Directory ${sf}\n${msg}`);
      };

      const files = fs.readdirSync(f);

      if(files.length === 0)
        e('is empty');

      return;
    }

    err('Unsupported file system entry type');
  });
})().then(done).catch(err);