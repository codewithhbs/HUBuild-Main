const jwt = require('jsonwebtoken')

const sendToken = async (user, res, status, message) => {
    try {
        //Generate JWT Token
        const token = jwt.sign({ id: user }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_TIME
        })

        const options = {
            // expires: new Date(
            //     Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
            // ),
            httpOnly: true,
            secure: true, // set to false in local dev
            sameSite: 'None', // use 'Lax' or 'Strict' if on same origin
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            credentials: true
        };

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