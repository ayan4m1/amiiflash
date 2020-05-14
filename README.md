# amiiflash

## prerequisites

- [Node.JS](https://nodejs.org/en/download/)
- [ACR122U](https://www.acs.com.hk/en/products/3/acr122u-usb-nfc-reader/)
- [NTAG215](https://www.nxp.com/products/rfid-nfc/nfc-hf/ntag/ntag-for-tags-labels/ntag-213-215-216-nfc-forum-type-2-tag-compliant-ic-with-144-504-888-bytes-user-memory:NTAG213_215_216)

## setup

```sh
git clone git@github.com:ayan4m1/amiiflash.git
cd amiiflash
npm i
npm run build
node lib/index.js -h
```

## usage

### dump tag

```sh
node lib/index.js dump output.bin
```

### flash tag

```sh
node lib/index.js flash tag.bin key.bin
```
