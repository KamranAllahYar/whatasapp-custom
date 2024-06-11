const os = require('os');
const desc_processor = require('./desc_processor.js')
// const imageMatcher = require('./image_matcher.js')
// const cv = require('@u4/opencv4nodejs')
const fs = require('fs')

const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

function getCurrentTime() {
    const currentTime = new Date(Date.now())

    return `Time : ${currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds()}\n`
}

function getPriceFromDesc(unprocessedDesc) {
    let someTxt = unprocessedDesc.includes('\n') ? unprocessedDesc.trim().split('\n') : unprocessedDesc.trim().split(' ');

    if (someTxt.filter(line => line.toLowerCase().includes('price') && line.includes('+')).length == 1) {
        someTxt = someTxt.map(line => {
            if (line.toLowerCase().includes('price') && line.includes('+')) {
                line = line.split('').map((char) => {
                    if (isNaN(char)) {
                        return ' '
                    } else {
                        return char
                    }
                }).
                    join('').
                    split(' ').filter(word => !!word)
                return line

            }
        }).flat().filter(line => !!line);
    }

    if (someTxt.length == 1) return someTxt[0]

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
        return !isNaN(parseInt(line)) && parseInt(line) > 100
    }).sort((a, b) => {
        return a - b
    })


    someTxt = someTxt.filter(txt => {
        return unprocessedDesc.includes(txt)
    })[0]

    const price = someTxt

    return price
}

function classifyText(textBody, keywordsArray) {
    // const price = getPriceFromDesc(textBody)
    // if (price == undefined) {
    //     return false
    // }

    let descFlag = true
    keywordsArray.forEach(subArray => {
        let subArrayDescFlag = false

        if (subArray[0] != false) {
            subArrayDescFlag = false

            subArray.forEach(keyword => {
                if (textBody.includes(keyword)) {
                    subArrayDescFlag = true
                }
            })

            if (subArrayDescFlag == false) {
                descFlag = false
            }
        }

        if (subArray[0] == false) {
            subArrayDescFlag = true

            const subArrayCopy = subArray.slice()
            subArrayCopy.shift()
            subArrayCopy.forEach(keyword => {
                if (textBody.includes(keyword)) {
                    subArrayDescFlag = false
                }
            })

            if (subArrayDescFlag == false) {
                descFlag = false
            }
        }
    })
    return descFlag
}

// async function saveBroadcast(supplierName, msgsArray) {
//     console.log(msgsArray.map(msg => msg.type))

//     msgsArray.sort((prvMsg, crvMsg) => {
//         return -(prvMsg.length - crvMsg.length)
//     })

//     // console.log(msgsArray.map(msg => msg.type))

//     const productDataPath = `./Supplier Products/product data.csv`

//     const desc = msgsArray.pop()

//     console.log(desc.body)
//     const price = getPriceFromDesc(desc.body)

//     if (price == undefined) {
//         console.log(`Price for ${supplierName} is undefined.\n`)
//         console.log(desc.body, '\n')
//         return
//     }

//     console.log(`Start of broadcast saving. ${supplierName} : ${msgsArray.length}. ${getCurrentTime()}\n`)

//     for (let index = 0; index < msgsArray.length; index++) {
//         const msg = msgsArray[index]
//         const media = await msg.downloadMedia()
//         if (media == undefined) {
//             return
//         }
//         const buffer = Buffer.from(media.data, 'base64')
//         const supplierProductImg = cv.imdecode(buffer)

//         console.log(`Product detection. ${supplierName} : ${index}\n`)
//         const productData = imageMatcher.getProductData(productDataPath)

//         const freeMemory = os.freemem();
//         const totalMemory = os.totalmem();
//         const memoryUsage = process.memoryUsage();

//         console.log(`Free memory: ${Math.round(freeMemory / 1024 / 1024)}MB`);
//         console.log(`Total memory: ${Math.round(totalMemory / 1024 / 1024)}MB`);
//         console.log(`Process memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);


//         const optimisedMatcherResult = await imageMatcher.optimisedImageMatcherCuda(productData, supplierProductImg);
//         const minError = optimisedMatcherResult[0]
//         const bestMatch = optimisedMatcherResult[1]

//         if (minError < 1150) {
//             const productName = bestMatch[1].split('./Supplier Products/')[1].split('.jpeg')[0].split('/').join('_').split(' ').join('-')
//             console.log(`${productName} was detected in ${supplierName}'s broadcast.\n`)

//             const productFilepath = bestMatch[1]
//             const product = productData.find(product => {
//                 return product[1] == productFilepath
//             })

//             console.log(`Old product data : ${product}`)

//             product[2] = msg.timestamp
//             product[3] = true
//             product[5] = price

//             productData.forEach((product, index) => {
//                 productData[index][0] = product[0].split('/')[3]
//                 productData[index][1] = product[1].split('/')[4].split('.')[0]

//                 productData[index] = productData[index].join(',')
//             })

//             console.log(`New product data : ${product}`)

//             const productDataTxt = productData.join('\n')
//             fs.writeFileSync(productDataPath, productDataTxt)

//             msgsArray[index] = null
//         }
//     }

//     const newProductsArray = msgsArray.filter((msg) => {
//         return !(msg == null)
//     })

//     const productAlreadyExists = !(newProductsArray.length > 0)
//     if (productAlreadyExists) {
//         console.log('Product already exists, hence was not saved.\n')
//         return
//     }

//     //Saving new product
//     console.log('New product detected.')

//     const supplierProductsDir = './Supplier Products/' + supplierName
//     if (!fs.existsSync(supplierProductsDir)) {
//         fs.mkdirSync(supplierProductsDir)
//     }

//     const productNo = fs.readdirSync(supplierProductsDir).length + 1
//     const productImagesDirPath = supplierProductsDir + '/Product ' + productNo

//     const productDescriptorsDirPath = productImagesDirPath + '/Descriptors'
//     fs.mkdirSync(productImagesDirPath)
//     fs.mkdirSync(productDescriptorsDirPath)

//     const productData = imageMatcher.getProductData(productDataPath)
//     // const storedHistograms = JSON.parse(fs.readFileSync(`./histograms.txt`))

//     for (let index = 0; index < newProductsArray.length; index++) {
//         const msg = newProductsArray[index]
//         if (msg === null) {
//             continue
//         }

//         const media = await msg.downloadMedia()
//         if (media == undefined) return

//         const buffer = Buffer.from(media.data, 'base64')
//         const supplierProductImg = cv.imdecode(buffer)

//         const imgFilePath = supplierProductsDir + '/' + 'Product ' + productNo + '/' + index + '.jpeg'
//         console.log(`${imgFilePath}`)
//         cv.imwrite(imgFilePath, supplierProductImg)

//         // const xyz = cv.calcHist(supplierProductImg.convertTo(cv.CV_32F, 1/255), [imageMatcher.bHistAxis]).convertTo(cv.CV_32F, 1/255)
//         const referenceBlueHist = cv.calcHist(supplierProductImg.convertTo(cv.CV_32F, 1 / 255), [imageMatcher.bHistAxis]).convertTo(cv.CV_32F, 1 / 255);
//         imageMatcher.setSomeValuesToZeroInHist(referenceBlueHist);

//         const referenceGreenHist = cv.calcHist(supplierProductImg.convertTo(cv.CV_32F, 1 / 255), [imageMatcher.gHistAxis]).convertTo(cv.CV_32F, 1 / 255);
//         imageMatcher.setSomeValuesToZeroInHist(referenceGreenHist);

//         const referenceRedHist = cv.calcHist(supplierProductImg.convertTo(cv.CV_32F, 1 / 255), [imageMatcher.rHistAxis]).convertTo(cv.CV_32F, 1 / 255);
//         imageMatcher.setSomeValuesToZeroInHist(referenceRedHist);

//         // storedHistograms[imgFilePath] = [imageMatcher.cvMatToArray(referenceBlueHist), imageMatcher.cvMatToArray(referenceGreenHist), imageMatcher.cvMatToArray(referenceRedHist)];

//         const tempFileName = imgFilePath.split('/').slice(2).join('_').replace('.jpeg', '');
//         cv.imwrite(`temp_images/${tempFileName}.jpeg`, supplierProductImg);
//         await execFileAsync('python', ['automation_modules/save_histograms.py', tempFileName]);
//         fs.unlink(`temp_images/${tempFileName}.jpeg`, () => { });

//         let imgDescriptor = imageMatcher.getDescriptors(supplierProductImg);
//         imgDescriptor = imageMatcher.cvMatToArray(imgDescriptor);

//         const imgDescriptorPath = productDescriptorsDirPath + '/' + index + '.txt';
//         fs.writeFileSync(imgDescriptorPath, JSON.stringify(imgDescriptor));

//         productData.push([imgDescriptorPath, imgFilePath, msg.timestamp, true, supplierName, price, msg.timestamp]);
//     }

//     // fs.writeFileSync(`./histograms.txt`, JSON.stringify(storedHistograms))

//     productData.forEach((product, index) => {
//         productData[index][0] = product[0].split('/')[3]
//         productData[index][1] = product[1].split('/')[4].split('.')[0]

//         productData[index] = productData[index].join(',')
//     })

//     const productDataTxt = productData.join('\n')
//     fs.writeFileSync(productDataPath, productDataTxt)

//     console.log(`${supplierName} broadcast saved. Time : ${getCurrentTime()}\n`)
// }

module.exports.classifyText = classifyText;
// module.exports.saveBroadcast = saveBroadcast;
module.exports.getPriceFromDesc = getPriceFromDesc;
module.exports.getCurrentTime = getCurrentTime;