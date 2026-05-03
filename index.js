const fs = require('fs');
const login = require('fca-project-orion');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const emojiData = JSON.parse(fs.readFileSync('./emojis.json', 'utf8'));
const replyData = JSON.parse(fs.readFileSync('./replies.json', 'utf8'));
const appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));

login({appState: appState}, (err, api) => {
    if(err) return console.error("লগইন ফেইল! নতুন কুকি দিয়ে ট্রাই করুন বস।");

    api.setOptions({ listenEvents: true, selfListen: false, forceLogin: true });
    console.log(`[ ONLINE ] Bot Active by ENAFUL`);

    api.listenMqtt((err, event) => {
        if(err) return;

        if (event.type === "message" || event.type === "message_reply") {
            const msgText = event.body ? event.body.toLowerCase() : "";

            // ১. সব মিডিয়া বা মেসেজে অটো রিঅ্যাক্ট
            const randomEmoji = emojiData.reactList[Math.floor(Math.random() * emojiData.reactList.length)];
            api.setMessageReaction(randomEmoji, event.messageID, (err) => {}, true);

            // ২. ইনবক্সে কথার পিঠে কথা (Smart Reply)
            if (!event.isGroup) {
                let botReply = null;
                for (let key in replyData) {
                    if (msgText.includes(key.toLowerCase())) {
                        botReply = replyData[key];
                        break;
                    }
                }

                // যদি ম্যাচ না করে তবে ডিফল্ট রিপ্লাই
                if (!botReply && msgText.length > 0) botReply = config.defaultReply;

                if (botReply) {
                    api.sendMessage(`${botReply}\n\n— [ Developer by ENAFUL ]`, event.threadID);
                }
            }
        }
    });
});
