// XOR Encrypt and Decrypt function
export const xorEncryptDecrypt = (input, secretKey) => {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        const inputCode = input.charCodeAt(i);
        const secretCode = secretKey.charCodeAt(i % secretKey.length);
        const encryptedCode = inputCode ^ secretCode; 
        output += String.fromCharCode(encryptedCode);
    }
    return output; 
}

// Encryption function
export const encrypt = (data, secretKey) => {
    const jsonData = JSON.stringify(data);
    return xorEncryptDecrypt(jsonData, secretKey);
}

// Decryption function
export const decrypt = (data, secretKey) => {
    const jsonData = xorEncryptDecrypt(data, secretKey);
    return JSON.parse(jsonData);
}
