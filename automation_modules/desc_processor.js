const fs = require('fs');


function getNewPrice(price) {
    const margins = JSON.parse(fs.readFileSync('./margins.json'));

    for (let index = margins.length - 1; index >= 0; index--) {
        // for (let index = 0; index < margins.length; index++) {
        // console.log(index);
        const threshold = margins[index][0];
        const increment = margins[index][1];

        console.log(price, threshold);
        console.log(``, price < threshold);
        if (price < threshold) continue;

        return price + increment
    }
}

const saveBroadcast = require('./save_broadcast.js');

const hafiz_broadcast_number = '120363142489041624@g.us'
const city_broadcast_number = '919867879142@c.us'
const ansari_broadcast_number = '120363205612765429@g.us' //'919892011201@c.us'
const faisal_broadcast_number = '919967090690@c.us'
const sf_broadcast_number = '120363042167400952@g.us'
const rbc_broadcast_number = '120363026790641248@g.us'
const nh_broadcast_number = '120363027712978846@g.us'
const nh_2_broadcast_number = '120363151406965045@g.us' //'120363047942288996@g.us' //'120363046162310181@g.us'
const standard_broadcast_number = '120363029595719509@g.us'
const anas_broadcast_number = '120363048328445528@g.us'
const czar_broadcast_number = '120363027382438815@g.us'
const czar_tipu_number = '918840459465@c.us'
const nthing_broadcast_number = '919821368221@c.us'
const ub_broadcast_number = '120363036272459461@g.us'
const barkat_broadcast_number = '120363050812360652@g.us'
const ashraf_broadcast_number = '919819670168@c.us'
const ib_broadcast_number = '120363023237717015@g.us'
const czar_irshad_broadcast_number = '120363045829572319@g.us'
const aamir_broadcast_number = '120363193273663962@g.us'
const otawali_broadcast_number = '120363212307873648@g.us'
const amrosia_broadcast_number = '120363046474619631@g.us'
const nf_broadcast_number = '120363046341331934@g.us'
const craze_broadcast_number = '120363151535627216@g.us'
const saad_broadcast_number = '919619202021@c.us';
const bts_imported_bags_broadcast_number = "120363211179526430@g.us";
const dreamzz_bags_broadcast = "120363328339119089@g.us";
const united_bags_broadcast = "120363139394297363@g.us";


const hafiz_inquiry_group = '919029359545@c.us'
const ansari_inquiry_group = '919029359545@c.us'
const faisal_inquiry_group = '919029359545@c.us'
const sf_inquiry_group = '919029359545@c.us'
const rbc_inquiry_group = '919029359545@c.us'
const nh_inquiry_group = '919029359545@c.us'
const standard_inquiry_group = '919029359545@c.us'
const anas_inquiry_group = '919029359545@c.us'
const czar_inquiry_group = '919029359545@c.us'
const barkat_inquiry_group = '919029359545@c.us'
const ib_inquiry_group = '919029359545@c.us'
const nthing_inquiry_group = '919029359545@c.us'
const aamir_inquiry_group = '919029359545@c.us'
const city_inquiry_group = '919029359545@c.us'
const test_inquiry_group = '919029359545@c.us'
const nf_inquiry_group = '919029359545@c.us'
const craze_inquiry_group = '919029359545@c.us'
const dreamzz_bags_inquiry_group = '918286742730@c.us'
const united_bags_inquiry_group = '917666664601@c.us'

// 96952 85901


const ub_inquiry_group = ''
const ashraf_inquiry_group = ''


function processGenericBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        const newPrice = getNewPrice(parseInt(price));

        if (line.includes(price)) {
            processedDesc[index] = '*Price: ' + newPrice + '/-*'
        }

        if (line.includes('Rate')) {
            processedDesc[index] = '*Price: ' + newPrice + '/-*'
        }
    });
    return processedDesc.join('\n');
}

function processIBBroadcast(chatMsgText, price, descIsSinglePara) {
    const freeShip = chatMsgText.includes('free');
    let processedDesc = descIsSinglePara ? chatMsgText.split(' ') : chatMsgText.split('\n');
    processedDesc = processedDesc.map(line => {
        if (line.includes(price)) {
            return `Price: ${parseInt(price) + 50}/-`;
        }
        if (line.includes('ship') || line.includes('Ship') || line.includes('SHIP')) {
            return '';
        }
        return line;
    });
    processedDesc = descIsSinglePara ? processedDesc.join(' ') : processedDesc.join('\n');
    while (processedDesc.includes('\n\n\n')) {
        processedDesc = processedDesc.replace('\n\n\n', '\n\n');
    }
    if (freeShip) processedDesc = processedDesc + `\nShip free`;

    return processedDesc;
}

function processAnasBroadcast(chatMsgText, price, descIsSinglePara) {
    let processedDesc = chatMsgText.split('\n');
    processedDesc = processedDesc.map(line => {
        if (line.includes(price)) {
            return `Price: ${parseInt(price) + 45}/-`;
        }
        if (line.includes('ship') || line.includes('Ship') || line.includes('SHIP')) {
            return '';
        }
        return line;
    });
    processedDesc = processedDesc.join('\n');
    while (processedDesc.includes('\n\n\n')) {
        processedDesc = processedDesc.replace('\n\n\n', '\n\n');
    }
    return processedDesc;
}

function processNHBroadcast(chatMsgText, price, descIsSinglePara) {
    price = parseInt(price) + 50;
    let processedDesc = chatMsgText.replace('price', 'Price');
    processedDesc = processedDesc.replace('Pride', 'Price');
    processedDesc = processedDesc.split('Price')[0].trim();
    processedDesc = processedDesc + '\n' + '*Price: ' + price + '/-*';
    return processedDesc;
}

function processStandardBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n');
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price) - 15;
            processedDesc[index] = '*Price: ' + price + '/-*';
        }
    });

    return processedDesc.join('\n');
}

function processCzarBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = descIsSinglePara ? chatMsgText.split(' ') : chatMsgText.split('\n');

    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    })

    return descIsSinglePara ? processedDesc.join(' ') : processedDesc = processedDesc.join('\n')
}

function processNthingBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n');

    price = parseInt(price) + 50
    processedDesc.forEach((line, index) => {
        if (line.includes('Rate')) {
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    })

    return processedDesc.join('\n');
}

function processUBBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    })

    return processedDesc.join('\n');
}

function processBarkatBroadcast(chatMsgText, price, descIsSinglePara) {
    return chatMsgText;
}

function processAamirBroadcast(chatMsgText, price, descIsSinglePara) {
    return chatMsgText;
}

function processAshrafBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 75
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    })
    return processedDesc.join('\n');
}

function processHafizBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });

    return descIsSinglePara ? processedDesc.join(' ') : processedDesc = processedDesc.join('\n')
}

function processCityBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });

    // if (descIsSinglePara) {
    //     processedDesc = processedDesc.join(' ')
    // } else {
    //     processedDesc = processedDesc.join('\n')
    // }
    // return processedDesc;

    return descIsSinglePara ? processedDesc.join(' ') : processedDesc = processedDesc.join('\n')
}

function processRBCBroadcast1(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });
    return processedDesc.join('\n');
}

function processAnsariBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });
    return processedDesc.join('\n');
}

function processFaisalBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });
    return processedDesc.join('\n');
}

function processSFBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
        if (line.includes('Rate')) {
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });
    return processedDesc.join('\n');
}

function processNFBroadcast(chatMsgText, price, descIsSinglePara) {
    const processedDesc = chatMsgText.split('Mumbai')[0].split('\n')

    let priceLineDetected = false
    processedDesc.forEach((line, index) => {
        if (priceLineDetected) {
            processedDesc[index] = ''
        }

        if (line.includes(price)) {
            priceLineDetected = true
            price = parseInt(price) + 80
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    })
    // processedDesc = processedDesc.join('\n')
    return processedDesc.join('\n');
}


function processDreamzzBroadcast(chatMsgText, price, descIsSinglePara) {
    if (!chatMsgText.toLowerCase().includes('fix')) return chatMsgText
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 50
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });
    return processedDesc.join('\n');
}


function processBTSBroadcast(chatMsgText, price, descIsSinglePara) {
    if (!chatMsgText.toLowerCase().includes('fix')) return chatMsgText
    const processedDesc = chatMsgText.split('\n')
    processedDesc.forEach((line, index) => {
        if (line.includes(price)) {
            price = parseInt(price)
            price = price + 100;
            processedDesc[index] = '*Price: ' + price + '/-*'
        }
    });
    return processedDesc.join('\n');
}

const suppliers = {
    [nf_broadcast_number]: {
        msgArray: [], enable: true, keywords: [[':::'], [false, 'GOGGLE', 'watch', 'FIX', 'mont', 'MONT', 'Fix', 'fix']],
        inquiryGroup: '120363028881630507@g.us', inquiriesArray: [], name: 'NFC', processingFunction: processAamirBroadcast
    },

    [nh_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'price', 'Pride'], ['Size'], ['Material']],
        inquiryGroup: '918828493275@c.us',
        name: 'NH Broadcast SPL', processingFunction: processNHBroadcast
    },

    [nh_2_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'price', 'Pride'], ['Size'], ['Material']],
        inquiryGroup: '918828493275@c.us',
        name: 'NH Broadcast SPL', processingFunction: processNHBroadcast
    },

    [standard_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['₹', 'KISH', 'PRICE']],
        inquiryGroup: standard_inquiry_group,
        name: 'Meraj shaikh', processingFunction: processStandardBroadcast
    },

    [sf_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'Prize', 'PRICE', 'SHIP', 'Ship', 'RATE', 'rate', 'Rate'], ['$']],
        inquiryGroup: '919967203141@c.us',
        name: 'Sf bag group no 6 (yusuf )', processingFunction: processSFBroadcast
    },

    [anas_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['SIZE'], ['@']],
        inquiryGroup: '919819476590@c.us',
        name: 'Anas BW SPL', processingFunction: processAnasBroadcast
    },

    [czar_tipu_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['₹', 'Rs', 'At just', 'CB PRODUCT', 'Price', 'PRICE', 'CB product', 'price']],
        inquiryGroup: '917985435789@c.us',
        name: 'Czar Bags', processingFunction: processCzarBroadcast
    },

    [czar_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['₹', 'Rs', 'At just', 'CB PRODUCT', 'Price', 'PRICE', 'CB product']],
        inquiryGroup: '917985435789@c.us',
        name: 'Czar Bags', processingFunction: processCzarBroadcast
    },

    [nthing_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Rate']],
        inquiryGroup: nthing_broadcast_number,
        name: 'N Thing SPL', processingFunction: processNthingBroadcast
    },

    [ib_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'PRICE']],
        inquiryGroup: '919891416849@c.us',
        name: 'New member IB BAGS', processingFunction: processIBBroadcast
    },

    [barkat_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'Prize', 'PRICE', 'SHIPPING', 'Shipping']],
        inquiryGroup: '919987863947@c.us',
        name: 'Barkat Bags SPL', processingFunction: processBarkatBroadcast
    },

    [saad_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'Prize', 'PRICE', 'SHIPPING', 'Shipping']],
        inquiryGroup: saad_broadcast_number,
        name: 'Saad Enterprises', processingFunction: processBarkatBroadcast
    },

    [hafiz_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'Prize', 'PRICE', 'price', 'Just for'], ['Size', 'size', 'SIZE']],
        inquiryGroup: '919324334076@c.us',
        name: 'Hafij Bags SPL', processingFunction: processHafizBroadcast
    },

    [city_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['New', 'new', 'NEW', 'Model', 'model', 'MODEL', 'Only', 'only', 'ONLY'], ['BAG', 'bag', 'Bag']],
        inquiryGroup: '918454824800@c.us',
        name: 'City Bags SPL', processingFunction: processCityBroadcast
    },

    [ansari_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'Prize', 'PRICE', 'Bag', 'bag'], ['only', 'ONLY', 'Only']],
        inquiryGroup: ansari_broadcast_number,
        name: 'Ansari Bags SPL', processingFunction: processAnsariBroadcast
    },

    [faisal_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['Price', 'Prize', 'PRICE', 'SHIPPING', 'Shipping', 'Size', 'size', 'SIZE'], ['only', 'Only', 'ONLY']],
        inquiryGroup: faisal_broadcast_number,
        name: 'Faisal Bags SPL', processingFunction: processFaisalBroadcast
    },

    // [aamir_broadcast_number]: {
    //     msgArray: [], inquiriesArray: [],
    //     enable: true, keywords: [['At just', 'AT JUST', 'PRICE', 'Rate only', 'fixed price', 'shipping', 'Shipping', 'price', 'Price']],
    //     inquiryGroup: '918286742730@c.us',
    //     name: 'Dreamzz Bags', processingFunction: processDreamzzBroadcast
    // },

    [dreamzz_bags_broadcast]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['At just', 'AT JUST', 'PRICE', 'Rate only', 'fixed price', 'shipping', 'Shipping', 'price', 'Price']],
        inquiryGroup: dreamzz_bags_inquiry_group,
        name: 'Dreamzz Bags', processingFunction: processDreamzzBroadcast
    },

    [united_bags_broadcast]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['At just', 'AT JUST', 'PRICE', 'Rate only', 'fixed price', 'shipping', 'Shipping', 'price', 'Price']],
        inquiryGroup: united_bags_inquiry_group,
        name: 'United Bags', processingFunction: processUBBroadcast
    },

    // [bts_imported_bags_broadcast_number]: {
    //     msgArray: [], inquiriesArray: [],
    //     enable: true, keywords: [['At just', 'AT JUST', 'PRICE', 'Rate only', 'fixed price', 'shipping', 'Shipping', 'price', 'Price']],
    //     inquiryGroup: '919695285901@c.us',
    //     name: 'BTS Imported', processingFunction: processBTSBroadcast
    // },

    [otawali_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['At just', 'AT JUST', 'PRICE', 'Rate only', 'fixed price', 'shipping', 'Shipping', 'price', 'Price']],
        inquiryGroup: '919653465803@c.us',
        name: 'Otawali', processingFunction: processHafizBroadcast
    },

    [rbc_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['of just', 'for'], ['₹']],
        inquiryGroup: '918291644078@c.us',
        name: 'RBC Something', processingFunction: processRBCBroadcast1
    },

    [czar_irshad_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: true, keywords: [['₹', 'Rs', 'At just', 'CB PRODUCT', 'Price', 'PRICE', 'CB product']],
        inquiryGroup: '917985435789@c.us',
        name: 'Czar Bags', processingFunction: processCzarBroadcast
    },

    [amrosia_broadcast_number]: {
        msgArray: [], inquiriesArray: [],
        enable: false, keywords: [['']],
        inquiryGroup: test_inquiry_group,
        name: 'Test Group'
    },
}

// info for how to combine the inquiries arrays
function initializeSuppliers(suppliers) {
    const names = {};

    Object.keys(suppliers).forEach(spl => {
        const name = suppliers[spl].name
        names[name] ? names[name].push(suppliers[spl]) : names[name] = [suppliers[spl]]
    })

    Object.keys(names).forEach(name => {
        const commonSuppliers = names[name]
        const commonInquiriesArray = commonSuppliers[0].inquiriesArray
        commonSuppliers.forEach(spl => spl.inquiriesArray = commonInquiriesArray)
    })

    Object.freeze(suppliers)
    for (key in suppliers) {
        Object.freeze(suppliers[[key]])
    }

    return suppliers
}

function processSupplierDesc(chatMsgText, supplierNumber, processFunction) {
    let processedDesc = chatMsgText;
    let price = saveBroadcast.getPriceFromDesc(chatMsgText);
    let desc = '';
    let descIsSinglePara = null;

    if (chatMsgText.includes('\n')) {
        desc = chatMsgText.split('\n');
        descIsSinglePara = true;
    } else {
        desc = chatMsgText.split(' ');
        descIsSinglePara = false;
    }

    if (typeof processFunction === 'function') {
        processedDesc = processFunction(chatMsgText, price, descIsSinglePara);
    } else {
        processedDesc = chatMsgText;
    }

    while (processedDesc.includes('\n\n')) {
        processedDesc = processedDesc.replace('\n\n', '\n');
    }

    return processedDesc;
}


module.exports.suppliers = suppliers;
module.exports.initializeSuppliers = initializeSuppliers;
module.exports.processSupplierDesc = processSupplierDesc;
