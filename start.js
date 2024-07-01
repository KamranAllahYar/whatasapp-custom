require('dotenv').config()
const MAX_CONCURRENT_PROCESSES = 1;
let activeProcesses = 0;
let waitingQueue = [];

function waitForAvailableSlot() {
    if (activeProcesses < MAX_CONCURRENT_PROCESSES) {
        activeProcesses++;
        return Promise.resolve();
    } else {
        return new Promise(resolve => {
            waitingQueue.push(resolve);
        });
    }
}

function releaseSlot() {
    activeProcesses--;
    if (waitingQueue.length > 0) {
        const nextResolve = waitingQueue.shift();
        nextResolve();
        activeProcesses++;
    }
}



const { Client, LocalAuth } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal');
// const cv = require('@u4/opencv4nodejs');
const fs = require('fs');

// const imageMatcher = require('./automation_modules/image_matcher.js')
const saveBroadcast = require('./automation_modules/save_broadcast.js')
const spl_and_cust_data = require('./automation_modules/spl_and_cust_info.js')
const desc_processor = require('./automation_modules/desc_processor.js');

const productDataPath = `./Supplier Products/product data.csv`;
const pendingInquiriesFilepath = './pending_inquiry_data.json';

if (!fs.existsSync('./Supplier Products')) fs.mkdirSync('./Supplier Products')
if (!fs.existsSync(productDataPath)) fs.writeFileSync(productDataPath, '')

const userConfig = JSON.parse(fs.readFileSync('./config.json'));

const client = new Client({

    authStrategy: new LocalAuth(), //{ clientId: userConfig.sessionName }
    takeoverOnConflict: true,
    puppeteer: { headless: false, executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', "--disabled-setupid-sandbox"] },
    webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014580163-alpha.html', }
})

const positiveResponses = ['yes', 'Yes', 'Yed', 'yed', 'Ys', 'ys', 'Available', 'available', 'avl', 'Avl', 'Abl', 'abl', 'Hai', 'hai', 'Okay', 'ok', 'Ok', 'okay', 'k', 'K', 'yss', 'Yss', 'All available', 'all available', 'yes all', 'yes available']
const negativeResponses = ['No', 'no', 'nhi', 'Nhi', 'Nahi', 'nahi', 'Not available', 'not available', 'ɴᴏ']
const validResponses = [...positiveResponses, ...negativeResponses];

const temp_messages_chat = userConfig.tempMessagesChat;
const resellersGroupId = userConfig.resellersGroupId;

// Move this array to a more appropriate place
const messagesToBeForwarded = [];
let awaitingAck = false;
let msgIdAwaitingAck = null;
let msgAwaitingAck = null;

function getTime() {
    const currentTime = new Date(Date.now());
    return (`Date - ${currentTime.getDate()}/${currentTime.getMonth() + 1} ## Time : ${currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds()}\n`);
}

async function startMessagesForwarding() {
    if (!messagesToBeForwarded.length) {
        console.log('All messages forwarded.', messagesToBeForwarded.length);
        return
    } // No more messages to be sent

    if (awaitingAck) return;

    const msg = messagesToBeForwarded.shift();
    console.log('messagesToBeForwarded.length', messagesToBeForwarded.length);

    if (msg.type == 'image') {
        const media = await msg.downloadMedia();
        if (media == undefined) {
            startMessagesForwarding();
            return
        }

        const sentMsg = await client.sendMessage(resellersGroupId, new MessageMedia('image/jpeg', media.data));
        msgIdAwaitingAck = sentMsg.id._serialized;
        msgAwaitingAck = sentMsg;
    } else if (msg.type == 'chat') {
        const sentMsg = await client.sendMessage(resellersGroupId, msg.body);

        msgIdAwaitingAck = sentMsg.id._serialized;
        msgAwaitingAck = sentMsg;
    } else {
        throw new Error('Invalid message type.')
    }
    console.log('New message id:', msgIdAwaitingAck);
    awaitingAck = true;
}

async function replyToPendingInquiries(productFilepath) {
    const productData = imageMatcher.getProductData(productDataPath);

    const product = productData.find(product => {
        return product[1] == productFilepath;
    });

    const available = product[3];

    if (!available) return;

    const pendingInquiries = JSON.parse(fs.readFileSync('./pending_inquiry_data.json'));

    if (!Object.keys(pendingInquiries).includes(productFilepath)) return;

    const imgMedia = MessageMedia.fromFilePath(productFilepath);
    await Promise.all(pendingInquiries[productFilepath].map(async chatID => {
        const sentMsg = await client.sendMessage(chatID, imgMedia);

        let hasReplied = false; // Flag to ensure single execution

        // Define a named function for the listener
        const ackListener = async (ackMsg, ack) => {
            if (ackMsg.id.id === sentMsg.id.id && ack > 0 && !hasReplied) {
                hasReplied = true; // Set the flag

                // Message is confirmed sent/delivered/read
                await sentMsg.reply(`*Auto Reply*\nAvailable.\nPrice: ₹ ${product[5]}`);

                console.log(`${chatID} successfully received a reply for ${productFilepath}.\n`);

                // Remove the listener
                client.off('message_ack', ackListener);
            }
        };

        // Add the listener
        client.on('message_ack', ackListener);

        return;
    }))

    delete pendingInquiries[productFilepath];
    fs.writeFileSync(pendingInquiriesFilepath, JSON.stringify(pendingInquiries));
    return;
}

const suppliers = desc_processor.initializeSuppliers(desc_processor.suppliers);

client.initialize();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('disconnected', (reason) => {
    console.log('Client disconnected');
    console.log(reason);

    client.initialize();
});

client.on('authenticated', (session) => {
    console.log(session)
});

client.on('change_state', (state) => {
    console.log(state);
});

// New Feature 1: Add tests to ensure all required components
// New Feature 2: Switch from CSVs to SQL database
client.on('ready', async () => {
    console.log('Client is ready!');

    const currentTime = new Date(Date.now());
    console.log(`${currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds()}\n`);

    const spllChats = (await client.getChats()).filter((chat) => {
        ;
        if (chat.name === undefined) {
            return false;
        }

        return chat.name.includes('Reseller')
    })
    console.log(`SPL chats : ${spllChats.length}`)

    // if (spllChats.length === 0) {
    //     await client.destroy();
    //     console.log('Client destroyed');

    //     await client.initialize();
    //     return;
    // }

    client.pupPage.on('dialog', async (dialog) => {
        await dialog.dismiss();
    })

    await client.sendMessage(temp_messages_chat, `Program is online. ${getTime()}`);


    setInterval(async () => {

        // Feature 6: Refactor printing the time
        const currentTime = new Date(Date.now());
        await client.sendMessage(temp_messages_chat, `Program is online. ${getTime()}`);

    }, (3600 * 0.1) * 1000)

    setInterval(async () => {

        const lastMsgsInResellerGroup = (await (await client.getChatById(resellersGroupId)).fetchMessages({ limit: 20 }));
        if (!lastMsgsInResellerGroup.length) return

        console.log(`messagesToBeForwarded.length`, messagesToBeForwarded.length);
        console.log('awaitingAck', awaitingAck);
        console.log('msgIdAwaitingAck', msgIdAwaitingAck);
        if (!!msgAwaitingAck) console.log('msgAwaitingAck.type', msgAwaitingAck.type);

        // Returns if working normally
        if (!awaitingAck) return;


        //
        const lastSentMsgIndex = lastMsgsInResellerGroup.findIndex(msg => msg.id._serialized == msgIdAwaitingAck);
        console.log('lastSentMsgIndex', lastSentMsgIndex);

        if (lastSentMsgIndex == -1) {

            if (!!msgAwaitingAck) return;



            if (msgAwaitingAck.type == 'chat') {

                messagesToBeForwarded.unshift(msgAwaitingAck);

                msgAwaitingAck = null;
                msgIdAwaitingAck = null;
                awaitingAck = false;
                startMessagesForwarding();

            } else if (msgAwaitingAck.type == 'image') {

                messagesToBeForwarded.unshift(msgAwaitingAck);

                msgAwaitingAck = null;
                msgIdAwaitingAck = null;
                awaitingAck = false;
                startMessagesForwarding();

                // try {
                //     await msgAwaitingAck.downloadMedia()
                //     console.log('Image downloaded successfully after ack was not received for too long.')

                // } catch (error) {
                //     console.log(error)
                // }
            }


            return;
        }

        // Returns if enough time has not passed
        const lastSentMsg = lastMsgsInResellerGroup[lastSentMsgIndex];

        const elapsedTimeSinceLastMessageSentInResellerGroup = Math.floor(new Date(Date.now()).getTime() / 1000) - lastSentMsg.timestamp;

        console.log('elapsedTimeSinceLastMessageSentInResellerGroup in mins:', Math.round(elapsedTimeSinceLastMessageSentInResellerGroup / 36) / 100 * 60);
        console.log('lastSentMsg.ack', lastSentMsg.ack);

        if ((Math.round(elapsedTimeSinceLastMessageSentInResellerGroup / 36) / 100 * 60) < 2) return;



        console.log('lastMsgsInResellerGroup[0].ack', lastMsgsInResellerGroup[0].ack)
        console.log('!!msgAwaitingAck', !!msgAwaitingAck);
        if (!!msgAwaitingAck) console.log('msgAwaitingAck.type', msgAwaitingAck.type);

        // Restart forwarding
        msgAwaitingAck = null;
        msgIdAwaitingAck = null;
        awaitingAck = false;
        startMessagesForwarding();

    }, (3600 * 0.05) * 1000)

})

client.on('message', async message => {
    const chatId = (await message.getChat()).id._serialized
    if (chatId == temp_messages_chat) {
        console.log('Debug message received...')

        if (message.type != 'chat') return;

        if (message.body == 'start messages forwarding') {
            console.log(`Pending messages length:`, messagesToBeForwarded.length);
            console.log('Awaiting Ack:', awaitingAck);
            console.log('Message Id:', msgIdAwaitingAck);
            console.log('Message type:', msgAwaitingAck.type);

            awaitingAck = false;

            startMessagesForwarding();
            return;
        }

        if (message.body == 'check pending messages') {
            console.log(`Pending messages length:`, messagesToBeForwarded.length);
            console.log('Awaiting Ack:', awaitingAck);
            console.log('Message Id:', msgIdAwaitingAck);
            if (!!msgAwaitingAck) console.log('Message type:', msgAwaitingAck.type);

            const lastMsgsInResllerGroup = (await (await client.getChatById(resellersGroupId)).fetchMessages({ limit: 50 }))

            const lastSentMsgIndex = lastMsgsInResllerGroup.findIndex(msg => msg.id._serialized == msgIdAwaitingAck);
            console.log('lastSentMsgIndex', lastSentMsgIndex);

            if (lastSentMsgIndex == -1) return

            const lastSentMsg = lastMsgsInResllerGroup[lastSentMsgIndex];

            const elapsedTimeSinceLastMessageSentInResellerGroup = Math.floor(new Date(Date.now()).getTime() / 1000) - lastSentMsg.timestamp;
            console.log('elapsedTimeSinceLastMessageSentInResellerGroup in mins:', Math.round(elapsedTimeSinceLastMessageSentInResellerGroup / 36) / 100 * 60);
            console.log('lastSentMsg.ack', lastSentMsg.ack);

            return;
        }

        const allChats = await client.getChats()
        allChats.forEach(async (chat) => {

            if (chat.name === undefined) {
                return
            }

            if (chat.name.includes(message.body)) {
                const messageTime = (await chat.fetchMessages({ limit: 1 }))

                console.log(`${chat.name} = ${chat.id._serialized}`);
                _ = (messageTime.length) ? console.log(messageTime[0].timestamp) : console.log(messageTime)
            }

        })
    }

    const currentTime = new Date(Date.now());

    if (message.isStatus) {
        return;
    }

    if (!(message.type == 'image' || message.type == 'chat')) {
        return;
    }

    const senderName = (await message.getChat()).name;
    const senderID = (await message.getChat()).id._serialized;

    // const productData = imageMatcher.getProductData(productDataPath);

    if (suppliers.hasOwnProperty(message.from)) {
        const responseIsValid = validResponses.includes(message.body.toLowerCase());

        console.log(`Start of broadcast forwarding. ${senderName} : ${message.type}. ${getTime()}`)
        const supplierNumber = message.from;
        console.log(supplierNumber);
        const supplier = suppliers[[supplierNumber]];

        const supplierMsgs = supplier.msgArray;
        if (message.type == 'image') {
            if (supplierMsgs.length > 0) {
                const lastMsgTime = supplierMsgs[supplierMsgs.length - 1].timestamp;
                const timeDifference = message.timestamp - lastMsgTime;
                if (timeDifference > 1800) {
                    console.log(`Old Images discarded. Time difference : ${timeDifference / 3600} hours.\n`)
                    while (supplierMsgs.length > 0) {
                        supplierMsgs.pop()
                    }
                }
            }

            supplierMsgs.push(message)
            return
        }

        if (message.type == 'chat') {
            const chatText = message.body

            const chatIsDesc = saveBroadcast.classifyText(chatText, supplier.keywords)

            if (chatIsDesc && supplierMsgs.length > 0) {
                // Immediately clear the supplierMsgs array
                const newBroadcastMsgs = supplierMsgs.slice();
                while (supplierMsgs.length > 0) {
                    supplierMsgs.shift()
                }

                // const desc = `*Automated Message*\n\n` + desc_processor.processSupplierDesc(chatText, supplierNumber, supplier.processingFunction)
                const desc = (chatText.startsWith(`*Automated Message*`)) ? desc_processor.processSupplierDesc(chatText, supplierNumber, supplier.processingFunction) : `*Automated Message*\n\n` + desc_processor.processSupplierDesc(chatText, supplierNumber, supplier.processingFunction);
                const descMsg = await client.sendMessage(temp_messages_chat, desc);
                newBroadcastMsgs.push(descMsg);

                // const announcementMsg = await client.sendMessage(temp_messages_chat, `*Ye broadcast automatically forward hua hai software ke through. Agar photos ya description mai koi mistake hai toh order lene se pehle ek baar confirm krlena.*`);
                // supplierMsgs.push(announcementMsg);

                if (supplier.enable) newBroadcastMsgs.forEach(msg => messagesToBeForwarded.push(msg));
                console.log(`${senderName} broadcast forwarded. ${getTime()}\n`);

                startMessagesForwarding();

                console.log(`Length of supplier messages of ${senderName} before saving the broadcast. ${(newBroadcastMsgs.slice()).length}. ${getTime()}\n`)
                await waitForAvailableSlot();
                // saveBroadcast.saveBroadcast(supplier.name, newBroadcastMsgs.slice())
                releaseSlot();

            } else {
                console.log(`Chat sent by ${senderName} is not a description.\n`);
                console.log('chatIsDesc', chatIsDesc, 'supplierMsgs.length', supplierMsgs.length)

                if (chatText.length > 100 && !responseIsValid) {
                    if (supplierMsgs.length == 0) return;

                    const lastMsgTime = supplierMsgs[supplierMsgs.length - 1].timestamp
                    const timeDifference = message.timestamp - lastMsgTime
                    console.log(`Invalid broadcast. Discarding Images. Time difference : ${timeDifference / 3600} hours.\n`)

                    while (supplierMsgs.length > 0) {
                        supplierMsgs.pop()
                    }
                    return;
                }

                if (!responseIsValid) return;
            }
            if (!responseIsValid) return;
        }
        if (!responseIsValid) return;
    }

    if (senderName.includes('Reseller') || senderName.includes('+') || senderName.includes('Reseler')) {
        const chat = (await message.getChat())
        if (chat.isGroup) return

        console.log(senderName, message.type)

        if (message.type == 'chat') {
            const isRequestForPaymentDetails = saveBroadcast.classifyText(message.body.toLowerCase(), [['scanner', 'pay', 'phonepe', 'phnpe', 'qr', 'upi', 'number'],
            [false, 'done', 'kitna', 'kiya', 'problem', 'from', 'ref', 'order', 'check', 'receive', 'available', 'kardi', 'track', 'trak', 'not interested', 'my']])
            if (isRequestForPaymentDetails) {
                message.reply(MessageMedia.fromFilePath('./paymentInfo.jpeg'))
                return
            }
        }

        // const media = await message.downloadMedia()
        // if (media == undefined) {
        //     return
        // }
        // const buffer = Buffer.from(media.data, 'base64')
        // const receivedImg = cv.imdecode(buffer)

        // await waitForAvailableSlot();
        // const optimisedMatcherResult = await imageMatcher.optimisedImageMatcherCuda(productData, receivedImg);
        // releaseSlot();

        // const minError = optimisedMatcherResult[0];
        // const bestMatch = optimisedMatcherResult[1];

        // const contact = (await message.getContact())
        // const senderChat = (await contact.getChat())

        // const senderChatID = message.fromMe ? (await message.getChat()).id._serialized : senderChat.id._serialized


        // if (minError < 4150) {
        //     const product = bestMatch[1].split('./Supplier Products/')[1].split('.jpeg')[0].split('/').join('_').split(' ').join('-')
        //     const productOwner = bestMatch[1].split('./Supplier Products/')[1].split('.jpeg')[0].split('/')[0]

        //     const elapsedTimeSinceLastUpdate = Math.floor(new Date(Date.now()).getTime() / 1000) - bestMatch[2]
        //     const elapsedTimeSinceLastUpdateInHours = Math.round(elapsedTimeSinceLastUpdate / 36) / 100
        //     console.log(`Time since info for ${product} was updated: ${elapsedTimeSinceLastUpdateInHours} hours.\n`)

        //     const supplierNumber = Object.keys(suppliers).find(spl => {
        //         return suppliers[spl].name === productOwner
        //     })
        //     const supplier = suppliers[[supplierNumber]]

        //     console.log(product)

        //     if (elapsedTimeSinceLastUpdate < ((3600) * 36)) {
        //         if (bestMatch[3]) {
        //             message.reply(`*Auto Reply*\nAvailable.\nPrice: ₹ ${bestMatch[5]}`, senderChatID)
        //         } else {
        //             message.reply(`*Auto Reply*\nOut of stock.`, senderChatID)
        //         }

        //         console.log(`${senderName} successfully received a reply for ${product}.\n`)
        //         return
        //     }

        //     // Feature 3: Query supplier for stale product data.
        //     const elapsedTimeSinceLastInquiry = Math.floor(new Date(Date.now()).getTime() / 1000) - bestMatch[6];
        //     console.log('Stale product data', elapsedTimeSinceLastInquiry, 'inquiry timestamp')
        //     const elapsedTimeSinceLastInquiryInHours = Math.round(elapsedTimeSinceLastInquiry / 36) / 100
        //     console.log(`Time since last inquiry for ${product} : ${elapsedTimeSinceLastInquiryInHours} hours.\n`);

        //     if (elapsedTimeSinceLastInquiry > ((3600) * 2)) {

        //         console.log(bestMatch);
        //         // Send pic to supplier iquiry chat
        //         const sentMsg = await client.sendMessage(supplier.inquiryGroup, media);

        //         // Update inquiry timestamp for product
        //         const productData = imageMatcher.getProductData(productDataPath);

        //         const productFilepath = bestMatch[1];
        //         const product = productData.find(product => {
        //             return product[1] == productFilepath;
        //         });

        //         product[6] = sentMsg.timestamp;

        //         productData.forEach((product, index) => {
        //             productData[index][0] = product[0].split('/')[3];
        //             productData[index][1] = product[1].split('/')[4].split('.')[0];

        //             productData[index] = productData[index].join(',');
        //         });

        //         const productDataTxt = productData.join('\n');

        //         fs.writeFileSync(productDataPath, productDataTxt);

        //         // Save inquiry data to JSON file
        //         const pendingInquiries = JSON.parse(fs.readFileSync('./pending_inquiry_data.json'));

        //         if (Object.keys(pendingInquiries).includes(productFilepath)) {
        //             pendingInquiries[productFilepath].push(senderChatID)
        //         } else {
        //             pendingInquiries[productFilepath] = [senderChatID];
        //         }

        //         fs.writeFileSync(pendingInquiriesFilepath, JSON.stringify(pendingInquiries));
        //     }
        //     return
        // }
        return
    }

    // const inquiryGroups = Object.keys(desc_processor.suppliers).map(spl => {
    //     return desc_processor.suppliers[spl]['inquiryGroup'];
    // })

    // if (inquiryGroups.includes(senderID)) {
    //     if (message.type != 'chat') return;

    //     const responseIsValid = validResponses.includes(message.body.toLowerCase()) || message.body.startsWith('*Auto Reply*\nAvailable.');

    //     if (!responseIsValid) return
    //     console.log(`Valid response from ${senderName}.`, getTime());

    //     if (message.hasQuotedMsg) {

    //         const quotedMessage = await message.getQuotedMessage();
    //         // if (quotedMessage.type != 'image') return;

    //         if (quotedMessage.type == 'image') {
    //             const media = await quotedMessage.downloadMedia()
    //             if (media == undefined) {
    //                 return;
    //             }
    //             const buffer = Buffer.from(media.data, 'base64');
    //             const qoutedImg = cv.imdecode(buffer);

    //             await waitForAvailableSlot();
    //             const optimisedMatcherResult = await imageMatcher.optimisedImageMatcherCuda(imageMatcher.getProductData(productDataPath), qoutedImg);
    //             releaseSlot();

    //             const minError = optimisedMatcherResult[0];
    //             if (minError > 4150) return;

    //             const bestMatch = optimisedMatcherResult[1];

    //             const positiveResponse = positiveResponses.includes(message.body);

    //             const productData = imageMatcher.getProductData(productDataPath);
    //             const productFilepath = bestMatch[1];
    //             const product = productData.find(product => {
    //                 return product[1] == productFilepath;
    //             });

    //             product[2] = message.timestamp;
    //             product[3] = positiveResponse;

    //             productData.forEach((product, index) => {
    //                 productData[index][0] = product[0].split('/')[3]
    //                 productData[index][1] = product[1].split('/')[4].split('.')[0]

    //                 productData[index] = productData[index].join(',')
    //             })

    //             const productDataTxt = productData.join('\n');

    //             fs.writeFileSync(productDataPath, productDataTxt);

    //             console.log(`Inquiry response from ${senderName}. Pattern 1.`, getTime());

    //             replyToPendingInquiries(productFilepath);
    //             return;
    //         }

    //         if (quotedMessage.type != 'chat') return;
    //     }

    //     const previousMsgs = (await (await message.getChat()).fetchMessages({ limit: 10 })).sort((a, b) => -(a.timestamp - b.timestamp)); // sorted in descending order

    //     const chatMsgIndex = previousMsgs.findIndex(msg => {
    //         return msg.id._serialized == message.id._serialized;
    //     })

    //     previousMsgs.slice(chatMsgIndex).forEach((msg, index) => console.log(index, msg.type));

    //     if (previousMsgs.slice(chatMsgIndex + 1)[0].type == 'image') {
    //         const lastImageMsgIndex = previousMsgs.slice(chatMsgIndex + 1).find(msg => {
    //             return !(msg.type == 'image' && msg.fromMe);
    //         })

    //         const allImageMsgs = previousMsgs.slice(chatMsgIndex + 1).slice(0, lastImageMsgIndex + 1);
    //         allImageMsgs.forEach(msg => {
    //             console.log(msg.type);
    //         })

    //         console.log(`Inquiry response from ${senderName}. Pattern 3.`, getTime());
    //     }

    //     const imageMsg = previousMsgs.slice(chatMsgIndex).find(msg => {
    //         return msg.type == 'image' && msg.fromMe;
    //     });

    //     if (!imageMsg) {
    //         console.log('No image message.')
    //         return
    //     }

    //     const media = await imageMsg.downloadMedia().catch(() => {
    //         return undefined
    //     });
    //     console.log(media);

    //     if (media == undefined) {
    //         return;
    //     }
    //     const buffer = Buffer.from(media.data, 'base64');
    //     const referencedImg = cv.imdecode(buffer);

    //     await waitForAvailableSlot();
    //     const optimisedMatcherResult = await imageMatcher.optimisedImageMatcherCuda(imageMatcher.getProductData(productDataPath), referencedImg);
    //     releaseSlot();

    //     const minError = optimisedMatcherResult[0];
    //     if (minError > 4150) return;

    //     const bestMatch = optimisedMatcherResult[1];

    //     const positiveResponse = positiveResponses.includes(message.body);

    //     const productData = imageMatcher.getProductData(productDataPath);
    //     const productFilepath = bestMatch[1];
    //     const product = productData.find(product => {
    //         return product[1] == productFilepath;
    //     });

    //     product[2] = message.timestamp;
    //     product[3] = positiveResponse;

    //     productData.forEach((product, index) => {
    //         productData[index][0] = product[0].split('/')[3];
    //         productData[index][1] = product[1].split('/')[4].split('.')[0];

    //         productData[index] = productData[index].join(',');
    //     })

    //     const productDataTxt = productData.join('\n');

    //     fs.writeFileSync(productDataPath, productDataTxt);

    //     console.log(`Inquiry response from ${senderName}. Pattern 2.`);

    //     replyToPendingInquiries(productFilepath);
    //     return;
    // }
})

async function getImageData(msg) {
    return false;

    // const media = await msg.downloadMedia()
    // if (media == undefined) {
    //     return
    // }
    // const buffer = Buffer.from(media.data, 'base64')
    // const receivedImg = cv.imdecode(buffer)

    // const productData = imageMatcher.getProductData(productDataPath)

    // await waitForAvailableSlot();
    // const optimisedMatcherResult = await imageMatcher.optimisedImageMatcherCuda(productData, receivedImg);
    // releaseSlot();

    // return optimisedMatcherResult
}

client.on('message_create', async message => {

    if (message.id.remote == 'status@broadcast') return

    const imageData = message.type == 'image' ? (await getImageData(message)) : null

    const chat = await message.getChat()

    const data = [
        message.type,
        message.timestamp,
        message.body,
        chat.id._serialized,
        chat.name,
        chat.isGroup,
        message.to,
        message.from,
        message.author,
        message.description,
        imageData
    ]

    fs.appendFileSync('./chat_history.txt', '\n' + JSON.stringify(data))

    if (!message.fromMe) {
        return
    }

    if (message.isStatus) {
        return
    }

    if (!(message.type === 'chat')) {
        return
    }

    if (message.body === 'wait') {
        if (message.hasQuotedMsg) {
            const quotedMessage = await message.getQuotedMessage()
            client.emit('message', quotedMessage)
        }
    }

});

client.on('message_ack', (msg, ack) => {

    if (msg.id._serialized == msgIdAwaitingAck && ack >= 1 && awaitingAck) {
        msgAwaitingAck = null;
        msgIdAwaitingAck = null;
        awaitingAck = false;
        startMessagesForwarding();
    }

})

// setInterval(async () => {

//     // Feature 6: Refactor printing the time
//     const currentTime = new Date(Date.now());
//     await client.sendMessage(temp_messages_chat, `Program is online. ${getTime()}`);

// }, (3600 * 0.1) * 1000)

// setInterval(async () => {

//     const lastMsgsInResellerGroup = (await (await client.getChatById(resellersGroupId)).fetchMessages({ limit: 20 }));
//     if (!lastMsgsInResellerGroup.length) return

//     console.log(`messagesToBeForwarded.length`, messagesToBeForwarded.length);
//     console.log('awaitingAck', awaitingAck);
//     console.log('msgIdAwaitingAck', msgIdAwaitingAck);
//     if (!!msgAwaitingAck) console.log('msgAwaitingAck.type', msgAwaitingAck.type);

//     // Returns if working normally
//     if (!awaitingAck) return;


//     //
//     const lastSentMsgIndex = lastMsgsInResellerGroup.findIndex(msg => msg.id._serialized == msgIdAwaitingAck);
//     console.log('lastSentMsgIndex', lastSentMsgIndex);

//     if (lastSentMsgIndex == -1) {

//         if (!!msgAwaitingAck) return;



//         if (msgAwaitingAck.type == 'chat') {

//             messagesToBeForwarded.unshift(msgAwaitingAck);

//             msgAwaitingAck = null;
//             msgIdAwaitingAck = null;
//             awaitingAck = false;
//             startMessagesForwarding();

//         } else if (msgAwaitingAck.type == 'image') {

//             messagesToBeForwarded.unshift(msgAwaitingAck);

//             msgAwaitingAck = null;
//             msgIdAwaitingAck = null;
//             awaitingAck = false;
//             startMessagesForwarding();

//             // try {
//             //     await msgAwaitingAck.downloadMedia()
//             //     console.log('Image downloaded successfully after ack was not received for too long.')

//             // } catch (error) {
//             //     console.log(error)
//             // }
//         }


//         return;
//     }

//     // Returns if enough time has not passed
//     const lastSentMsg = lastMsgsInResellerGroup[lastSentMsgIndex];

//     const elapsedTimeSinceLastMessageSentInResellerGroup = Math.floor(new Date(Date.now()).getTime() / 1000) - lastSentMsg.timestamp;

//     console.log('elapsedTimeSinceLastMessageSentInResellerGroup in mins:', Math.round(elapsedTimeSinceLastMessageSentInResellerGroup / 36) / 100 * 60);
//     console.log('lastSentMsg.ack', lastSentMsg.ack);

//     if ((Math.round(elapsedTimeSinceLastMessageSentInResellerGroup / 36) / 100 * 60) < 2) return;



//     console.log('lastMsgsInResellerGroup[0].ack', lastMsgsInResellerGroup[0].ack)
//     console.log('!!msgAwaitingAck', !!msgAwaitingAck);
//     if (!!msgAwaitingAck) console.log('msgAwaitingAck.type', msgAwaitingAck.type);

//     // Restart forwarding
//     msgAwaitingAck = null;
//     msgIdAwaitingAck = null;
//     awaitingAck = false;
//     startMessagesForwarding();

// }, (3600 * 0.05) * 1000)

process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
})
