const crypto  = require("crypto");
const request = require('superagent');
const NCMB    = require('ncmb');
module.exports = (req, res) => {  
    const applicationKey = 'YOUR_APPLICATION_KEY';
    const clientKey = 'YOUR_CLIENT_KEY';
    saveDataStore(
        applicationKey,
        clientKey,
        req.body
    ).then(() => {
        return sendPusher(
            'YOUR_PUSHER_AUTH_KEY',
            'YOUR_PUSHER_SECRET_KEY',
            'YOUR_PUSHER_APP_ID',
            req.body
        )
    })
    .then((response) => {
        res.json({});
    })
    .catch((err) => res.status(401).json(err));
};

const saveDataStore = (applicationKey, clientKey, body) => {
    const ncmb = new NCMB(applicationKey, clientKey);
    const Chat = ncmb.DataStore('Chat');
    const chat = new Chat;
    return chat
        .set('channel', body.channel)
        .set('userName', body.userName)
        .set('message', body.message)
        .save()
}

const sendPusher = (authKey, secretKey, appId, body) => {
    const authTimestamp = Date.now() / 1000;
    const authVersion = '1.0';
    const medhod = 'POST';
    const path = `/apps/${appId}/events`;
    const message = {
        data: JSON.stringify({
            userName: body.userName,
            message: body.message
        }),
        name: "message",
        channel: body.channel
    };
    const bodyMd5 = crypto
        .createHash('md5')
        .update(JSON.stringify(message))
        .digest('hex');
    const queryString = `auth_key=${authKey}&auth_timestamp=${authTimestamp}&auth_version=${authVersion}&body_md5=${bodyMd5}`;
    const authSigning = [
        medhod,
        path,
        queryString
    ].join("\n");
    const signature = crypto
        .createHmac("SHA256", secretKey)
        .update(authSigning)
        .digest("hex");
    return request
        .post(`https://api.pusherapp.com${path}?${queryString}&auth_signature=${signature}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(message))
}
