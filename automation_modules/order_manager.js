const fs = require('fs')
const spl_and_cust_data = require('./spl_and_cust_info.js')

const orderManagerGroup = '120363031047059139@g.us'
const manualTrackingGroup = '120363050738464142@g.us'
const amrosia_notifications = '918097801079-1630940551@g.us'


function detectMobNoAndPincode(address) {
    const processedAddress = address.split('\n').join(' ')
    .split('.').join(' ')
    .split('*').join(' ')
    .split('-').join(' ')
    .split('+').join(' ')
    .split(':').join(' ')
    .split(',').join(' ')
    .split('/').join(' ')
    .split('(').join(' ')
    .split(')').join(' ')
    .split('_').join(' ')
    .split(' ')
    .filter((word) => {
        return !isNaN(word) && word.length > 0
    })
    .reduce((prv, crv) => {
        if(!isNaN(prv[0]) && !isNaN(crv) && [prv[0],crv].join('').length === 6){
            prv[0] = [prv[0],crv].join('')
            return prv
        } else if (!isNaN(prv[0]) && !isNaN(crv) && [prv[0],crv].join('').length === 10) {
            prv[0] = [prv[0],crv].join('')
            return prv
        } else {
            prv.unshift(crv)
            return prv
        }
    },[])

    const hasContactNo = processedAddress.filter((word) => {
        if(word.length === 12 && !isNaN(word)){
            return true
        }

        if(word.length === 10 && !isNaN(word)){
            return true
        }

        return false
    }).length > 0

    const hasPincode = processedAddress.filter((word) => {
        return word.length === 6 && !isNaN(word)
    }).length > 0



    return [hasContactNo, hasPincode]
}

function getPreviousOrderNo(orderNo){
    let someTxt = orderNo.split('')

    switch (someTxt[3]) {
        case 'F':
            someTxt[3] = 'E'
            break;

        case 'E':
            someTxt[3] = 'D'
            break;

        case 'D':
            someTxt[3] = 'C'
            break;

        case 'C':
            someTxt[3] = 'B'
            break;

        case 'B':
            someTxt[3] = 'A'
            break;

        case 'A':
            someTxt[3] = '9'
            break;

        case '0':
            someTxt[3] = 'F'
            switch (someTxt[2]) {
                case 'F':
                    someTxt[2] = 'E'
                    break;
            
                case 'E':
                    someTxt[2] = 'D'
                    break;
            
                case 'D':
                    someTxt[2] = 'C'
                    break;
            
                case 'C':
                    someTxt[2] = 'B'
                    break;
            
                case 'B':
                    someTxt[2] = 'A'
                    break;
            
                case 'A':
                    someTxt[2] = '9'
                    break;
            
                case '0':
                    someTxt[2] = 'F'
                    switch (someTxt[1]) {
                        case 'F':
                            someTxt[1] = 'E'
                            break;
                    
                        case 'E':
                            someTxt[1] = 'D'
                            break;
                    
                        case 'D':
                            someTxt[1] = 'C'
                            break;
                    
                        case 'C':
                            someTxt[1] = 'B'
                            break;
                    
                        case 'B':
                            someTxt[1] = 'A'
                            break;
                    
                        case 'A':
                            someTxt[1] = '9'
                            break;
                    
                        case '0':
                            someTxt[3] = '0'
                            someTxt[2] = '0'
                            break;
                    
                        default:
                            someTxt[1] = someTxt[1] - 1
                            break;
                    }
                            break;
            
                default:
                    someTxt[2] = someTxt[2] - 1
                    break;
            }
            break;

        default:
            someTxt[3] = someTxt[3] - 1
            break;
    }

    return someTxt.join('')
}

function getPendingTrackings(orderNo){
    const savedTrackings = fs.readdirSync(`./All Tracking Pics`)

    const pendingTrackings = []
    while(orderNo != 'F2A0'){
        if(!savedTrackings.includes(`${orderNo}.jpeg`)){
            pendingTrackings.push(`${orderNo}`)
        }
        orderNo = getPreviousOrderNo(orderNo)
    }

    return pendingTrackings
}

function getPendingActions(){
    const orderIDs_v2 = JSON.parse(fs.readFileSync('order_ids_v2.txt'))

    const pendingActions = Object.keys(orderIDs_v2)
    .filter((orderNo) => {
        // if(orderIDs_v2[orderNo].status === 'Tracking Forwarded'){
        //     return false
        // }
    
        // if(orderIDs_v2[orderNo].status === 'Tracking No. Uploaded'){
        //     return false
        // }
    
        const currentTime = Date.now()
        const deadline = (new Date(orderIDs_v2[orderNo].deadline)).getTime() 
        return currentTime > deadline
    })
    .map((orderNo) => {
        const messageBody = `${orderNo}
        deadline : ${orderIDs_v2[orderNo].deadline}
        status : ${orderIDs_v2[orderNo].status}`
        .split(`  `).join('')

        return messageBody
    })
    
    return pendingActions
}

const stockIsAvailable = 'stock is available?'
const stockWillChange = 'stock will change?'
const stockChanged = 'stock changed?' 
const returnTrackingReceieved = 'return tracking received?'
const customerWantsToReturn = 'customer wants to return?'
const rtoReceived = 'rto recieved?'
const redispatch = 'redispatch?'
const willDeliver = 'will deliver?'
const parcelDelivered = 'parcel delivered?'
const refunded = 'refunded?'


function getInquiryTxt(status){
    switch (status) {
        case 'Order No. Generated':  //change to 'stock available?'
            return 'Iski tracking bhejo'

        case stockIsAvailable:
            return 'Iski tracking bhejo'
            
        case stockWillChange:
            return 'This stock is over.'

        case stockChanged:
            return 'Please choose new color for this order.'

        case refunded:
            return 'Refund pending.'    

        case parcelDelivered:
            return 'Has your customer received this parcel? If yes, please share review.'

        case willDeliver:
            return 'ye parcel deliver karwao'

        case redispatch:
            return 'Delivery Unsuccessful.'

        case rtoReceived:
            return 'ye parcel return karo'

        case customerWantsToReturn:
            return 'How was the quality of the bag?.'

        case returnTrackingReceieved:
            return 'Has your customer dispatched this bag?'
    
        default:
            return undefined
    }
}

function getNextAction(currentStatus, response){
    if(response === 'yes' || response === 'ys'){
        responseIsPositive = true
    } else {
        responseIsPositive = false
    }

    let nextAction = undefined
    let nextDeadline = undefined
    switch (currentStatus) {
        case stockIsAvailable:
        //     null

        // case 'Order No. Generated':  //change to 'stock available?'
            if(responseIsPositive){
                nextAction = 'Order No. Generated'
                nextDeadline = 1
            } else {
                nextAction = stockWillChange
                nextDeadline = 1
            }
            break;
                        
        case stockWillChange:
            if(responseIsPositive){
                nextAction = stockChanged
                nextDeadline = 1
            } else {
                nextAction = refunded
                nextDeadline = 0
            }
            break;
    
        case stockChanged:
            if(responseIsPositive){
                nextAction = 'Order No. Generated'
                nextDeadline = 1
            } else {
                nextAction = stockChanged
                nextDeadline = 1
            }
            break;
    
        case refunded:
            if(responseIsPositive){
                nextAction = 'order closed'
                nextDeadline = 0
            } else {
                nextAction = refunded
                nextDeadline = 0
            }
            break;
    
        case parcelDelivered:
            if(responseIsPositive){
                nextAction = customerWantsToReturn
                nextDeadline = 0
            } else {
                nextAction = willDeliver
                nextDeadline = 0
            }
            break;
    
        case willDeliver:
            if(responseIsPositive){
                nextAction = parcelDelivered
                nextDeadline = 2
            } else {
                nextAction = redispatch
                nextDeadline = 0
            }
            break;
    
        case redispatch:
            if(responseIsPositive){
                nextAction = rtoReceived
                nextDeadline = 5
            } else {
                nextAction = refunded
                nextDeadline = 0
            }
            break;
    
        case rtoReceived:
            if(responseIsPositive){
                nextAction = 'order closed'
                nextDeadline = 1
            } else {
                nextAction = rtoReceived
                nextDeadline = 1
            }
            break;
    
        case customerWantsToReturn:
            if(responseIsPositive){
                nextAction = returnTrackingReceieved
                nextDeadline = 1
            } else {
                nextAction = 'order closed'
                nextDeadline = 1
            }
            break;
    
        case returnTrackingReceieved:
            if(responseIsPositive){
                nextAction = refunded
                nextDeadline = 1
            } else {
                nextAction = returnTrackingReceieved
                nextDeadline = 1
            }
            break;
        }

    return {'status' : nextAction, 'days' :  nextDeadline}
}

let pendingTrackingNo = null
function getPendingTrackingNo(){
    const trackingPics = fs.readdirSync(`./All Tracking Pics`).reverse()
    const savedTrackings = fs.readFileSync('./trackingData.csv', 'utf-8')
    .split('\n').map(line => {
        return line.slice(0, 4)
    })

    for (let index = 0; index < trackingPics.length; index++) {
        const pic = trackingPics[index].split('.')[0]
        if(!savedTrackings.includes(pic)){
            return pic
        }
                
    }
}

function getInquiryRecipient(orderId,  courierService){
    switch (orderId.status) {
        case 'Order No. Generated':  //change to 'stock available?'
            return spl_and_cust_data.phoolMohdId

        case stockIsAvailable:
            return spl_and_cust_data.phoolMohdId
            
        case stockWillChange:
            return orderId.customer

        case stockChanged:
            return orderId.customer

        case refunded:
            return spl_and_cust_data.amrosia_notifications

        case parcelDelivered:
            return orderId.customer

        case willDeliver:
            if(courierService === 'DTDC'){
                return spl_and_cust_data.sachenDtdcId
            } else if(courierService === 'Mahavir'){
                return spl_and_cust_data.tilakId
            } else {
                return amrosia_notifications
            }

        case rtoReceived:
            if(courierService === 'DTDC'){
                return spl_and_cust_data.sachenDtdcId
            } else if(courierService === 'Mahavir'){
                return spl_and_cust_data.tilakId
            } else {
                return spl_and_cust_data.phoolMohdId
            }

        case redispatch:
            return orderId.customer
    
        case customerWantsToReturn:
            return orderId.customer

        case returnTrackingReceieved:
            return orderId.customer
    
        default:
            return undefined
    }
}

module.exports.stockIsAvailable = stockIsAvailable
module.exports.stockWillChange = stockWillChange
module.exports.stockChanged = stockChanged
module.exports.returnTrackingReceieved = returnTrackingReceieved
module.exports.customerWantsToReturn = customerWantsToReturn
module.exports.rtoReceived = rtoReceived
module.exports.redispatch = redispatch
module.exports.willDeliver = willDeliver
module.exports.parcelDelivered = parcelDelivered
module.exports.refunded = refunded

module.exports.getInquiryTxt = getInquiryTxt
module.exports.getNextAction = getNextAction
module.exports.detectMobNoAndPincode = detectMobNoAndPincode
module.exports.getPreviousOrderNo = getPreviousOrderNo
module.exports.getPendingTrackings = getPendingTrackings
module.exports.getPendingActions = getPendingActions
module.exports.getPendingTrackingNo = getPendingTrackingNo
module.exports.getInquiryRecipient = getInquiryRecipient


module.exports.orderManagerGroup = orderManagerGroup
module.exports.manualTrackingGroup = manualTrackingGroup
module.exports.amrosia_notifications = amrosia_notifications


module.exports.pendingTrackingNo = pendingTrackingNo