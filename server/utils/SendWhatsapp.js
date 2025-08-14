const axios = require('axios');

const SendWhatsapp = async (number, message) => {
    console.log("number, message",number, message)
    const apiKey = "9c9673c00d8649c380acc43fd55eb743";
    const baseUrl = "https://api.iconicsolution.co.in/wapp/v2/api/send";

    // Construct query parameters
    const params = new URLSearchParams({
        apikey: apiKey,
        mobile: number,
        msg: message
    });

    try {
        const response = await axios.get(`${baseUrl}?${params.toString()}`);
        return response.data; // Return only the response data
    } catch (error) {
        console.error("Internal server error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
};

module.exports = SendWhatsapp;
