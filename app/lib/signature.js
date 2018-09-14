import {
  hashPersonalMessage,
  ecrecover,
  toBuffer,
  pubToAddress,
  fromRpcSig,
  isValidSignature,
  bufferToHex
} from 'ethereumjs-util';

class SIGNATURE_ERRORS {
  static JSON_FORMAT = `There is a problem with JSON format of your signature. Make sure you've copied it correctly.`;
  static MISSING_MSG = `Message is missing in provided string. Make sure property "msg" is present.`;
  static MISSING_SIG = `Signature is missing in provided string. Make sure property "sig" is present.`;
  static MISSING_ADDRESS = `Address is missing in provided string. Make sure property "address" is present.`;
  static INVALID_SIG = `The signature seems to be invalid. Please try signing the transaction again.`;
  static INVALID_MSG = `The signed message seems to be invalid. Please make sure you are signing the correct message.`;
}

function parseSig(sigObject) {
  let signature;
  try {
    signature = JSON.parse(sigObject);
  } catch (error) {
    throw SIGNATURE_ERRORS.JSON_FORMAT;
  }

  if (!signature.msg) throw SIGNATURE_ERRORS.MISSING_MSG;
  if (!signature.sig) throw SIGNATURE_ERRORS.MISSING_SIG;
  if (!signature.address) throw SIGNATURE_ERRORS.MISSING_ADDRESS;

  return signature;
}

function checkSigMsg(signature, timeNodeAddress) {
  const [sigPrefix, sigAddress] = signature.msg.split(':');
  if (sigPrefix !== 'TimeNode' || sigAddress !== timeNodeAddress) {
    throw SIGNATURE_ERRORS.INVALID_MSG;
  }
}

/*
 * Checks if the signature from the wallet
 * (inputted by the user) is valid.
 */
function isSignatureValid(signature, timeNodeAddress) {
  checkSigMsg(signature, timeNodeAddress);

  const message = Buffer.from(signature.msg);

  const msgHash = hashPersonalMessage(message);
  const res = fromRpcSig(signature.sig);

  if (!isValidSignature(res.v, res.r, res.s)) throw SIGNATURE_ERRORS.INVALID_SIG;

  const pub = ecrecover(msgHash, res.v, res.r, res.s);
  const addrBuf = pubToAddress(pub);
  const addr = bufferToHex(addrBuf);

  return addr === signature.address;
}

/*
 * Since signature verifications are not standardized,
 * we perform another check for MyCrypto signature validity.
 *
 * This should be triggered in the case in which a user imports
 * a private key into MyCrypto and signs it directly using it's privKey.
 *
 * Modified from: https://github.com/MyCryptoHQ/MyCrypto/blob/592caaaf47f6b6bfb6940c15f632df8b7c984def/common/libs/signing.ts
 */
const stripHexPrefixAndLower = signature => signature.replace('0x', '').toLowerCase();

function isMyCryptoSigValid(signature, timeNodeAddress) {
  checkSigMsg(signature, timeNodeAddress);

  const { sig, msg, address } = signature;

  const sigb = new Buffer(stripHexPrefixAndLower(sig), 'hex');
  if (sigb.length !== 65) return false;
  sigb[64] = sigb[64] === 0 || sigb[64] === 1 ? sigb[64] + 27 : sigb[64];
  const hash = hashPersonalMessage(toBuffer(msg));
  const pubKey = ecrecover(hash, sigb[64], sigb.slice(0, 32), sigb.slice(32, 64));

  return stripHexPrefixAndLower(address) === pubToAddress(pubKey).toString('hex');
}

export { parseSig, isSignatureValid, isMyCryptoSigValid, SIGNATURE_ERRORS };
