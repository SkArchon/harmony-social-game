const {
    encode,
    decode,
    randomBytes,
    toBech32,
    fromBech32,
    HarmonyAddress,
    generatePrivateKey,
    getPubkeyFromPrivateKey,
    getAddressFromPublicKey,
    getAddressFromPrivateKey,
    encryptPhrase,
    decryptPhrase
  } = require('@harmony-js/crypto');
  const { isPrivateKey, isAddress, isPublicKey } = require('@harmony-js/utils');

const e = fromBech32("one1yavw8wejhjug96wl5k3re2cs7ymufsscl7prpd")
console.log(e);