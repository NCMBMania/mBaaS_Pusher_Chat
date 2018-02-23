const crypto  = require("crypto");
const request = require('superagent');
const NCMB    = require('ncmb');
module.exports = (req, res) => {  
    const applicationKey = 'd288714a5a801f4ccaaac99c87df41d35e38b5804a9ecbcd2026c1901e914fc0';
    const clientKey = '3395ea58a34af1edb5009c9d15b3379761539ef3c8eb0ee0d797274e122359b8';
    saveDataStore(
        applicationKey,
        clientKey,
        req.body
    ).then(() => {
        return sendPusher(
            '443a8868e3321344be81',
            'fc4056e7e6cb5610a212',
            148932,
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