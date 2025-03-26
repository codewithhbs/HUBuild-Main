import { decrypt, encrypt } from "./encryption";

const SECRET_CODE = "ABCDEFGHIJKLMNOPQRSTUVWXY"


export const setData = (key, data) => {
    const encryptedData = encrypt(JSON.stringify(data), SECRET_CODE);
    localStorage.setItem(key, encryptedData);
}


export const GetData = (key) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return decrypt(data, SECRET_CODE);
}