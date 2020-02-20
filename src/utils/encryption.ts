// @ts-ignore
import rsaPemToJwk from 'rsa-pem-to-jwk';
import crypto from 'crypto';

interface RSAKeyPair {
  public: string;
  private: string;
}

export const generateKeys = async (): Promise<RSAKeyPair> => {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        }
        resolve({
          public: publicKey,
          private: privateKey
        });
      }
    );
  });
};

export const transformKeys = (privateKey: string): void => {
  const pem = privateKey;
  return rsaPemToJwk(pem, { use: 'sig' }, 'public');
};
