const jwt = require('jsonwebtoken')

const sendToken = async (user, res, status, message) => {
    try {
        //Generate JWT Token
        const token = jwt.sign({ id: user }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_TIME
        })

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieDomain = process.env.COOKIE_DOMAIN || undefined; // e.g. .dessobuild.com
        const options = {
            httpOnly: true,
            secure: isProduction, // only secure in production over HTTPS
            sameSite: isProduction ? 'None' : 'Lax',
            domain: cookieDomain,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        console.log("done in send token")
        // Send token in cookie
        res.status(status).cookie('token', token, options).json({
            success: true,
            message,
            token,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = sendToken;