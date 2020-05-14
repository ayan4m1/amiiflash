import { NFC } from 'nfc-pcsc';

import { getLogger } from 'modules/logging';

const nfc = new NFC();
const log = getLogger('nfc');

class NTAG215 {
  constructor(reader) {
    this.reader = reader;
    this.password = Buffer.from([0, 0, 0, 0]);
    this.pack = Buffer.from([0, 0]);
  }

  async auth() {
    const { password, pack, reader } = this;
    const cmd = Buffer.from([
      0xff, // Class
      0x00, // Direct Transmit (see ACR122U docs)
      0x00, // ...
      0x00, // ...
      0x07, // Length of Direct Transmit payload (7 bytes)
      0xd4, // Data Exchange Command (see PN533 docs)
      0x42, // InCommunicateThru
      0x1b, // PWD_AUTH
      ...password
    ]);

    const response = await reader.transmit(cmd, 7);

    if (response.length < 5) {
      throw new Error(`Invalid response length of ${response.length} bytes`);
    }

    if (response[2] !== 0 || response.length < 7) {
      throw new Error('Invalid password supplied!');
    }

    const packCheck = response.slice(3, 5);

    if (!packCheck.equals(pack)) {
      throw new Error(`${packCheck} does not match pack ${pack}`);
    }
  }

  async write(data) {
    const { reader } = this;

    for (let page = 4; page < 130; page++) {
      log.info(`Writing page ${page} / 135`);
      await this.auth();
      await reader.write(page, data.slice(page * 4, (page + 1) * 4));
    }
  }

  async read() {
    const { reader } = this;
    const results = [];

    for (let page = 0; page < 135; page++) {
      log.info(`Reading page ${page} / 135`);
      await this.auth();
      results.push(await reader.read(page, 4));
    }

    return Buffer.concat(results);
  }
}

export const waitForTag = (handler) => {
  nfc.on('reader', (reader) => {
    reader.autoProcessing = false;
    const {
      reader: { name: readerName }
    } = reader;

    reader.on('card', async (card) => {
      try {
        if (card.type !== 'TAG_ISO_14443_3') {
          log.warn('Incompatible card detected!');
          return;
        }

        log.info(`${readerName}: Card detected`, card.standard);
        const tag = new NTAG215(reader);

        handler(tag);
      } catch (error) {
        log.error(error.message);
        log.error(error.stack);
      }
    });
    reader.on('card.off', (card) => {
      log.info(`${readerName}: Card lost`, card);
    });
    reader.on('error', (err) => {
      log.info(`${readerName}: An error occurred`, err);
    });
    reader.on('end', () => {
      log.info(`${readerName}: Device removed`);
    });
  });
};
