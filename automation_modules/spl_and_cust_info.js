const nh_broadcast_number = '917317621840@c.us'
const standard_broadcast_number = '919820343499@c.us'
const czar_broadcast_number_irshad = '120363045731674745@g.us'
const czar_broadcast_number_tipu = '120363027382438815@g.us'
const nthing_broadcast_number = '919821368221@c.us'
const ub_broadcast_number = '917666664601@c.us'
const barkat_broadcast_number = '919987863947@c.us'
const bm_broadcast_number = '120363032108735489@g.us'
const nf_broadcast_number = '120363046341331934@g.us'
const baganic_broadcast_number = '917900093221@c.us'
const aamir_broadcast_number = '120363048677385880@g.us'
const amrosia_broadcast_number = '120363031339968383@g.us'

const barkat_inquiry_real = '919029359545-1635611147@g.us'
const nh_inquiry_real = '919029359545-1628145544@g.us'
const standard_inquiry_real = '919029359545-1627742946@g.us'
const czar_inquiry_real = '919029359545-1627113094@g.us'
const nthing_inquiry_real = '120363019271616646@g.us'
const dream_inquiry_real = '120363044617084287@g.us'
const nf_inquiry_real = '120363047412934890@g.us'
const baganic_inquiry_real = '120363045254251936@g.us'
const bm_inquiry_real = '120363047337367795@g.us'
const ub_inquiry_real = '120363021927062317@g.us'
const se_inquiry_real = '919029359545-1627544931@g.us'

const suppliers = {
    [nh_broadcast_number]: {
        msgArray: [], enable: false, keywords: [['Price', 'price', 'Pride'], ['Size'], ['Material']],
        inquiryGroup: nh_inquiry_real, inquiriesArray: [], name: 'NH Arfat SPL'
    },

    [standard_broadcast_number]: {
        msgArray: [], enable: false, keywords: [['₹', 'KISH', 'PRICE']],
        inquiryGroup: standard_inquiry_real, inquiriesArray: [], name: 'Meraj Standard SPL'
    },

    [bm_broadcast_number]: {
        msgArray: [], enable: true, keywords: [['PRICE'], [':::']],
        inquiryGroup: bm_inquiry_real, inquiriesArray: [], name: 'INHOUSE BMB'
    },

    [nf_broadcast_number]: {
        msgArray: [], enable: true, keywords: [[':::'], [false, 'GOGGLE', 'watch', 'FIX', 'mont', 'MONT', 'Fix', 'fix']],
        inquiryGroup: nf_inquiry_real, inquiriesArray: [], name: 'NFC'
    },

    [baganic_broadcast_number]: {
        msgArray: [], enable: true, keywords: [['PRICE'], [':::']],
        inquiryGroup: baganic_inquiry_real, inquiriesArray: [], name: 'Baganic Shop SPL'
    },

    [aamir_broadcast_number]: {
        msgArray: [], enable: true, keywords: [['At just', 'AT JUST', 'PRICE', 'Rate only']],
        inquiryGroup: dream_inquiry_real, inquiriesArray: [], name: 'Dreamzz Bags'
    },

    [amrosia_broadcast_number]: {
        msgArray: [], enable: true, keywords: [['₹', 'Rs', 'At just', 'CB PRODUCT', 'Price', 'PRICE', 'CB product'], [false, 'backpack']],
        inquiryGroup: dream_inquiry_real, inquiriesArray: [], name: 'Dreamzz Bags'
    },

    [czar_broadcast_number_irshad]: {
        msgArray: [], enable: true, keywords: [['₹', 'Rs', 'At just', 'CB PRODUCT', 'Price', 'PRICE', 'CB product'], [false, 'backpack']],
        inquiryGroup: czar_inquiry_real, inquiriesArray: [], name: 'Czar Irshad'
    },

    [czar_broadcast_number_tipu]: {
        msgArray: [], enable: true, keywords: [['₹', 'Rs', 'At just', 'CB PRODUCT', 'Price', 'PRICE', 'CB product'], [false, 'backpack']],
        inquiryGroup: czar_inquiry_real, inquiriesArray: [], name: 'Czar Community'
    },

    [nthing_broadcast_number]: {
        msgArray: [], enable: true, keywords: [['Rate']],
        inquiryGroup: nthing_inquiry_real, inquiriesArray: [], name: 'N Thing SPL'
    },

    [ub_broadcast_number]: {
        msgArray: [], enable: true, keywords: [['PRICE'], ['SHIPPING'], ['for']],
        inquiryGroup: ub_inquiry_real, inquiriesArray: [], name: 'United Bags SPL'
    },

    [barkat_broadcast_number]: {
        msgArray: [], enable: false, keywords: [['Price', 'Prize', 'PRICE', 'SHIPPING', 'Shipping']],
        inquiryGroup: barkat_inquiry_real, inquiriesArray: [], name: 'Barkat Bags SPL'
    },
}

suppliers[[czar_broadcast_number_tipu]].inquiriesArray = suppliers[[czar_broadcast_number_irshad]].inquiriesArray
Object.freeze(suppliers)
for (key in suppliers) {
    Object.freeze(suppliers[[key]])
}

function getPriceFromDesc(unprocessedDesc) {
    let someTxt = []
    if (unprocessedDesc.includes('\n')) {
        someTxt = unprocessedDesc.trim().split('\n')
    } else {
        someTxt = unprocessedDesc.trim().split(' ')
    }

    someTxt.forEach((line, index) => {
        line = line.split('').map((char) => {
            if (isNaN(char)) {
                return ' '
            } else {
                return char
            }
        })

        line = line.join('')

        while (line.includes('  ')) {
            line = line.replace('  ', ' ')
        }

        line = line.split(' ')

        someTxt[index] = line
    })

    someTxt = someTxt.flat()

    someTxt = someTxt.filter(line => {
        return !isNaN(parseInt(line)) && parseInt(line) > 140
    }).sort((a, b) => {
        return a - b
    })


    someTxt = someTxt.filter(txt => {
        return unprocessedDesc.includes(txt)
    })[0]

    const price = someTxt

    return price
}

function processSupplierDesc(chatMsgText, supplierNumber) {
    let processedDesc = chatMsgText
    let price = getPriceFromDesc(chatMsgText)

    let descIsSinglePara = null
    if (chatMsgText.includes('\n')) {
        desc = chatMsgText.split('\n')
        descIsSinglePara = true
    } else {
        desc = chatMsgText.split(' ')
        descIsSinglePara = false
    }

    let BOGOFTrue = false
    switch (supplierNumber) {

        case aamir_broadcast_number:
            processedDesc = processedDesc.split('\n')

            processedDesc.forEach((line, index) => {
                if (line.includes(price)) {
                    price = parseInt(price) + 80
                    processedDesc[index] = '*Price: ' + price + '/-*'
                    line = processedDesc[index]
                }

                if (line.includes('Ship') || line.includes('ship') || line.includes('SHIP')) {
                    processedDesc[index] = ''
                }

                if (line.includes('less') || line.includes('LESS') || line.includes('Less')) {
                    processedDesc[index] = ''
                }
            })
            processedDesc = processedDesc.join('\n')
            break;

        case bm_broadcast_number:
            processedDesc = processedDesc.split('\n')

            priceLineDetected = false
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
            processedDesc = processedDesc.join('\n')
            break;

        case nf_broadcast_number:
            processedDesc = processedDesc.split('Mumbai')[0]
            processedDesc = processedDesc.split('\n')

            priceLineDetected = false
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
            processedDesc = processedDesc.join('\n')
            break;

        case baganic_broadcast_number:
            price = getPriceFromDesc(processedDesc)
            processedDesc = processedDesc.split('\n')

            priceLineDetected = false
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
            processedDesc = processedDesc.join('\n')
            break;

        case nh_broadcast_number:
            price = parseInt(price)
            price = price + 80 + 25
            processedDesc = processedDesc.replace('price', 'Price')
            processedDesc = processedDesc.replace('Pride', 'Price')
            processedDesc = processedDesc.split('Price')[0].trim()
            processedDesc = processedDesc + '\n' + '*Price: ' + price + '/-*'
            break;

        case standard_broadcast_number:
            processedDesc = chatMsgText.split('\n')
            processedDesc.forEach((line, index) => {
                if (line.includes(price)) {
                    price = parseInt(price)
                    if (price > 475) {
                        price = price + 150
                    } else {
                        price = price + 100
                    }
                    processedDesc[index] = '*Price: ' + price + '/-*'
                }
            })
            processedDesc = processedDesc.join('\n')
            break;

        case czar_broadcast_number_irshad:
            BOGOFTrue = chatMsgText.includes('Buy') && chatMsgText.includes('free')
            if (descIsSinglePara) {
                processedDesc = chatMsgText.split(' ')
            } else {
                processedDesc = chatMsgText.split('\n')
            }

            processedDesc.forEach((line, index) => {
                if (line.includes(price)) {
                    price = parseInt(price)

                    if (BOGOFTrue) {
                        singlePrice = Math.round(price / 2)
                        singlePrice = singlePrice + 80
                        price = price + 80
                        // processedDesc[index] = '*Combo Price: ' + price + '/-*'  
                        processedDesc[index] = `*Combo Price: ${price}/-*\nSingle Price: ${singlePrice}`
                    } else {
                        if (price > 475) {
                            price = price + 100
                        } else {
                            price = price + 80
                        }
                        processedDesc[index] = '*Price: ' + price + '/-*'
                    }
                }

                if (line.includes('Ship') || line.includes('ship') || line.includes('SHIP')) {
                    processedDesc[index] = ''
                }
            })

            if (descIsSinglePara) {
                processedDesc = processedDesc.join(' ')
            } else {
                processedDesc = processedDesc.join('\n')
            }
            break;

        case czar_broadcast_number_tipu:
            BOGOFTrue = chatMsgText.includes('Buy') && chatMsgText.includes('free')
            if (descIsSinglePara) {
                processedDesc = chatMsgText.split(' ')
            } else {
                processedDesc = chatMsgText.split('\n')
            }

            processedDesc.forEach((line, index) => {
                if (line.includes(price)) {
                    price = parseInt(price)

                    if (BOGOFTrue) {
                        singlePrice = Math.round(price / 2)
                        singlePrice = singlePrice + 80
                        price = price + 80
                        // processedDesc[index] = '*Combo Price: ' + price + '/-*'  
                        processedDesc[index] = `*Combo Price: ${price}/-*\nSingle Price: ${singlePrice}`
                    } else {
                        if (price > 475) {
                            price = price + 100
                        } else {
                            price = price + 80
                        }
                        processedDesc[index] = '*Price: ' + price + '/-*'
                    }
                }

                if (line.includes('Ship') || line.includes('ship') || line.includes('SHIP')) {
                    processedDesc[index] = ''
                }
            })

            if (descIsSinglePara) {
                processedDesc = processedDesc.join(' ')
            } else {
                processedDesc = processedDesc.join('\n')
            }
            break;

        case amrosia_broadcast_number:
            BOGOFTrue = chatMsgText.includes('Buy') && chatMsgText.includes('free')
            if (descIsSinglePara) {
                processedDesc = chatMsgText.split(' ')
            } else {
                processedDesc = chatMsgText.split('\n')
            }

            processedDesc.forEach((line, index) => {
                if (line.includes(price)) {
                    price = parseInt(price)

                    if (BOGOFTrue) {
                        singlePrice = Math.round(price / 2)
                        singlePrice = singlePrice + 80
                        price = price + 80
                        // processedDesc[index] = '*Combo Price: ' + price + '/-*'  
                        processedDesc[index] = `*Combo Price: ${price}/-*\nSingle Price: ${singlePrice}`
                    } else {
                        if (price > 475) {
                            price = price + 100
                        } else {
                            price = price + 80
                        }
                        processedDesc[index] = '*Price: ' + price + '/-*'
                    }
                }

                if (line.includes('Ship') || line.includes('ship') || line.includes('SHIP')) {
                    processedDesc[index] = ''
                }
            })

            if (descIsSinglePara) {
                processedDesc = processedDesc.join(' ')
            } else {
                processedDesc = processedDesc.join('\n')
            }
            break;

        case nthing_broadcast_number:
            price = parseInt(price) + 80
            processedDesc = processedDesc.split('\n')
            processedDesc.forEach((line, index) => {
                if (line.includes('Rate')) {
                    processedDesc[index] = '*Price: ' + price + '/-*'
                }
            })
            processedDesc = processedDesc.join('\n')
            break;

        case ub_broadcast_number:
            processedDesc = chatMsgText
            processedDesc = processedDesc.split('\n')

            processedDesc.forEach((line, index) => {
                if (line.includes('for')) {
                    processedDesc[index] = ''
                }

                if (line.includes('LIVE VIDEO')) {
                    processedDesc[index] = ''
                }

            })

            price = getPriceFromDesc(processedDesc.join('\n'))
            console.log(price)
            processedDesc.forEach((line, index) => {
                if (line.includes(price)) {
                    price = parseInt(price) + 100
                    processedDesc[index] = '*Price: ' + price + '/-*'
                }
            })

            processedDesc = processedDesc.join('\n')
            break;

        case barkat_broadcast_number:
            processedDesc = chatMsgText
            processedDesc = processedDesc.split('\n')
            processedDesc.forEach((line, index) => {
                if (line.includes(price)) {
                    price = parseInt(price) + 75
                    processedDesc[index] = '*Price: ' + price + '/-*'
                }
            })
            processedDesc = processedDesc.join('\n')
            break;

        default:
            processedDesc = chatMsgText
    }

    while (processedDesc.includes('\n\n')) {
        processedDesc = processedDesc.replace('\n\n', '\n')
    }

    return processedDesc
}

const ahmed_booking = '919029359545-1628172221@g.us'
const bmbBookingGroup = '120363024904059150@g.us'
const gulamBookingGroup = '120363028474385830@g.us'
const ilyasBookingGroup = '120363027074024695@g.us'
const sayedBookingGroup = '120363027338930459@g.us'
const rizwanBookingGroup = '120363047165175895@g.us'
const ajBookingGroup = '120363027396367372@g.us'
const cbBookingGroup = '120363047101799845@g.us'
const jpBookingGroup = '120363028524550263@g.us'
const azBookingGroup = '120363029099633816@g.us'
const haiderBookingGroup = '120363028358722750@g.us'
const saudBookingGroup = '120363027750308619@g.us'
const sameerBookingGroup = '120363029945704372@g.us'

const bookingGroups = [azBookingGroup,
    bmbBookingGroup, ahmed_booking, gulamBookingGroup,
    ilyasBookingGroup, sayedBookingGroup, rizwanBookingGroup,
    ajBookingGroup, cbBookingGroup, jpBookingGroup, haiderBookingGroup,
    saudBookingGroup,
    sameerBookingGroup]

module.exports.suppliers = suppliers
module.exports.getPriceFromDesc = getPriceFromDesc
module.exports.processSupplierDesc = processSupplierDesc
module.exports.bookingGroups = bookingGroups

const orderManagerID = '120363031047059139@g.us'
module.exports.orderManagerID = orderManagerID

const phoolMohdId = '919769714584@c.us'
const sachenDtdcId = '917718028087@c.us'
const tilakId = '919022744014@c.us'
const amrosia_notifications = '918097801079-1630940551@g.us'

module.exports.amrosia_notifications = amrosia_notifications
module.exports.phoolMohdId = phoolMohdId
module.exports.tilakId = tilakId
module.exports.sachenDtdcId = sachenDtdcId


