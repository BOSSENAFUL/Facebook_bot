const fs = require('fs');

async function startBot() {
    // ESM মডিউল এরর এড়াতে ডাইনামিক ইমপোর্ট
    const login = (await import('fca-project-orion')).default;

    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    const emojiData = JSON.parse(fs.readFileSync('./emojis.json', 'utf8'));
    const replyData = JSON.parse(fs.readFileSync('./replies.json', 'utf8'));
    const appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));

    login({appState: appState}, (err, api) => {
        if(err) return console.error("লগইন ফেইল বস! কুকি চেক করুন।");

        api.setOptions({ listenEvents: true, selfListen: false, forceLogin: true });
        console.log(`[ ONLINE ] Bot is active. Developed by ENAFUL`);

        api.listenMqtt((err, event) => {
            if(err || !event) return;

            if (event.type === "message" || event.type === "message_reply") {
                const msgText = event.body ? event.body.toLowerCase() : "";

                // ১. অটো রিঅ্যাক্ট
                const randomEmoji = emojiData.reactList[Math.floor(Math.random() * emojiData.reactList.length)];
                api.setMessageReaction(randomEmoji, event.messageID, (err) => {}, true);

                // ২. স্মার্ট রিপ্লাই
                if (!event.isGroup) {
                    let botReply = null;
                    for (let key in replyData) {
                        if (msgText.includes(key.toLowerCase())) {
                            botReply = replyData[key];
                            break;
                        }
                    }
                    if (!botReply && msgText.length > 0) botReply = config.defaultReply;
                    if (botReply) {
                        api.sendMessage(`${botReply}\n\n— [ Developer by ENAFUL ]`, event.threadID);
                    }
                }
            }
        });
    });
}

startBot().catch(console.error);
