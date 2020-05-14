import { program } from 'commander';
import { exec } from 'child_process';
import { createReadStream, createWriteStream } from 'fs';
import getStream from 'get-stream';

import { getLogger } from 'modules/logging';
import { waitForTag } from 'modules/nfc';

const log = getLogger('app');

program.version('0.1.0');

program
  .command('dump <destination>')
  .description('reads the contents of a tag to a file')
  .action((destination) => {
    log.info('Waiting for tag to dump...');
    waitForTag(async (tag) => {
      try {
        const data = await tag.read();
        const stream = createWriteStream(destination);

        stream.write(data);
        stream.end();
        log.info(`Dumped tag to ${destination}`);
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
      }
    });
  });

program
  .command('flash <source> <key>')
  .description('writes the contents of an encrypted binary to a tag')
  .action((sourcePath, keyPath) => {
    log.info('Waiting for tag to flash...');
    waitForTag(async (tag) => {
      try {
        const decryptedPath = `./decrypted.bin`;
        const toolCommand = `amiitool.exe -d -k "${keyPath}" -i "${sourcePath}" -o "${decryptedPath}"`;

        log.info(`Running ${toolCommand}`);
        exec(toolCommand);

        const sourceStream = createReadStream(`./${decryptedPath}`);
        const sourceData = await getStream.buffer(sourceStream, {
          encoding: 'binary'
        });

        await tag.write(sourceData);
        log.info(`Decrypted ${sourcePath} and wrote it to tag!`);
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
      }
    });
  });

program.parse(process.argv);
