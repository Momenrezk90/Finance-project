import CryptoJS from 'crypto-js';

export const decryptData = (encryptedData, encryptionKey) => {
    const [iv, encrypted] = encryptedData.split(':');  // Split the IV and encrypted part
    const ivBytes = CryptoJS.enc.Hex.parse(iv);  // Convert IV to bytes
    const encryptedBytes = CryptoJS.enc.Hex.parse(encrypted);  // Convert encrypted data to bytes

    const keyBytes = CryptoJS.enc.Hex.parse(encryptionKey);  // Convert the encryption key to bytes

    // Decrypt the data using AES-256-CBC
    const decryptedBytes = CryptoJS.AES.decrypt({ ciphertext: encryptedBytes }, keyBytes, { iv: ivBytes });

    // Convert the decrypted bytes to a UTF-8 string
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

    return decryptedData;
};
