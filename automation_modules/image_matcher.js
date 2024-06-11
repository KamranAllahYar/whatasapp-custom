const fs = require('fs')
const cv = require('@u4/opencv4nodejs')
const { execFile } = require('child_process');
const { promisify } = require('util');


function cvMatToArray(cvMat) {
    let array = []
    for (let i = 0; i <= cvMat.rows - 1; i++) {
        let row = []
        for (let j = 0; j <= cvMat.cols - 1; j++) {
            let point = cvMat.at(i, j)
            row.push(point)
        }
        array.push(row)
    }
    return array
}

function getStockData(path) {
    const stockDataRaw = fs.readFileSync(path, 'utf-8').trim().split('\n');

    const stockData = stockDataRaw.map(stock => {
        const stockParts = stock.trim().split(',');

        const descriptorFilePath = `./Amrosia Stock Descriptors/${stockParts[1]}_${stockParts[2]}.txt`;
        const filePath = `./Purse Pics/Amrosia Stock/${stockParts[0]}/${stockParts[1]}.jpeg`;

        return [descriptorFilePath, filePath, ...stockParts];
    });

    return stockData;
}


function getSeStockData(path) {
    const stockData = ((fs.readFileSync(path, 'utf-8'))).trim().split('\n')

    stockData.forEach((stock, index) => {
        stockData[index] = stock.trim().split(',')
    })

    stockData.forEach((stock, index) => {
        const filePath = './SE Stock/' + stock[0] + '/' + stock[1] + '.jpeg'
        stockData[index].unshift(filePath)

        const descriptorFilePath = './SE Stock Descriptors/' + stock[1] + '_' + stock[2] + '.txt'
        stockData[index].unshift(descriptorFilePath)


        stockData[index][4] = JSON.parse(stock[4])
        stockData[index][5] = JSON.parse(stock[5].toLowerCase())
        stockData[index][6] = JSON.parse(stock[6])
    })

    return stockData
}

function getProductData(path) {
    const productDataRaw = fs.readFileSync(path, 'utf-8').trim().split('\n').filter(stock => stock);
    const productData = productDataRaw.map(stock => {
        const stockParts = stock.trim().split(',');

        const descriptorPath = `./Supplier Products/${stockParts[4]}/${stockParts[0]}/Descriptors/${stockParts[1]}.txt`;
        const imagePath = `./Supplier Products/${stockParts[4]}/${stockParts[0]}/${stockParts[1]}.jpeg`;

        const descriptor = descriptorPath;
        const filePath = imagePath;
        const lastAvailabilityUpdateTime = JSON.parse(stockParts[2]);
        const availability = JSON.parse(stockParts[3].toLowerCase());
        // 4 does not need to be processed
        const price = JSON.parse(stockParts[5]);
        const lastInquiryUpdateTime = JSON.parse(stockParts[6]);

        return [descriptor, filePath, lastAvailabilityUpdateTime, availability, stockParts[4], price, lastInquiryUpdateTime];
    });

    return productData;
}


const SIFT = new cv.SIFTDetector()
const bruteForceMatcher = new cv.BFMatcher()

bHistAxis = new cv.HistAxes({
    channel: 0,
    bins: 256,
    ranges: [0, 1]
})

gHistAxis = new cv.HistAxes({
    channel: 1,
    bins: 256,
    ranges: [0, 1]
})

rHistAxis = new cv.HistAxes({
    channel: 2,
    bins: 256,
    ranges: [0, 1]
})

function getDescriptors(img) {
    const keypoints = SIFT.detect(img)
    const descriptors = SIFT.compute(img, keypoints)
    return descriptors
}

function cropBlackBars(image) {
    const kSize = new cv.Size(15, 15)

    const grayImage = image.bgrToGray().gaussianBlur(kSize, 10, 10).convertTo(cv.CV_8UC1, 255).threshold(1, 255, cv.THRESH_BINARY)
    const contours = grayImage.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    const biggestContour = contours.sort((a, b) => {
        return b.area - a.area
    })[0]
    return image.getRegion(biggestContour.boundingRect())
}

function setSomeValuesToZeroInHist(hist) {
    hist.set(0, 0, 0)
    hist.set(1, 0, 0)
    hist.set(255, 0, 0)
    hist.set(254, 0, 0)
}

function findMatchesWithHistogram(stockArray, receivedImg) {

    const histCompMethod = cv.HISTCMP_BHATTACHARYYA
    const similarityThreshold = 0.15

    const similarStock = []

    const bHistRec = cv.calcHist(receivedImg, [bHistAxis]).convertTo(cv.CV_32F, 1 / 255)
    const gHistRec = cv.calcHist(receivedImg, [gHistAxis]).convertTo(cv.CV_32F, 1 / 255)
    const rHistRec = cv.calcHist(receivedImg, [rHistAxis]).convertTo(cv.CV_32F, 1 / 255)
    setSomeValuesToZeroInHist(bHistRec)
    setSomeValuesToZeroInHist(gHistRec)
    setSomeValuesToZeroInHist(rHistRec)

    const storedHistograms = JSON.parse(fs.readFileSync(`./histograms.txt`))

    for (let index = 0; index < stockArray.length; index++) {
        const stock = stockArray[index]
        const filePath = stock[1]

        const bHistRef = new cv.Mat(storedHistograms[filePath][0], cv.CV_32F)
        const similarityB = bHistRec.compareHist(bHistRef, histCompMethod)
        if (!(similarityB < similarityThreshold)) {
            continue
        }

        const gHistRef = new cv.Mat(storedHistograms[filePath][1], cv.CV_32F)
        const similarityG = gHistRec.compareHist(gHistRef, histCompMethod)
        if (!(similarityG < similarityThreshold)) {
            continue
        }

        const rHistRef = new cv.Mat(storedHistograms[filePath][2], cv.CV_32F)
        const similarityR = rHistRec.compareHist(rHistRef, histCompMethod)
        if (!(similarityR < similarityThreshold)) {
            continue
        }

        similarStock.push(stock.slice())
    }

    return similarStock
}

function bestMatchUsingFeatureDetector(someArray, receivedImgDescriptors) {
    let minError = 10000
    let bestMatch
    someArray.forEach(data => {
        const matches = bruteForceMatcher.match(data[0], receivedImgDescriptors)
            .sort((a, b) => {
                return a.distance - b.distance
            })
            .splice(0, 100)

        let errorSum = 0
        matches.forEach(match => {
            errorSum = match.distance + errorSum
        })

        if (errorSum < minError) {
            minError = errorSum
            bestMatch = data
        }
    })

    if (minError < 4500) {
        // console.log(`best match[4] = ${bestMatch[4]}`)
    }

    return [minError, bestMatch]
}

async function optimisedImageMatcher(imageDataArray, image) {
    image = cropBlackBars(image)

    const reducedStockDataArray = findMatchesWithHistogram(imageDataArray, image.convertTo(cv.CV_32F, 1 / 255))

    reducedStockDataArray.forEach(((stock, index) => {
        reducedStockDataArray[index][0] = JSON.parse(fs.readFileSync(stock[0]))
        reducedStockDataArray[index][0] = new cv.Mat(stock[0], cv.CV_32F)
    }))

    const receivedImgDescriptors = getDescriptors(image.convertTo(cv.CV_8U))
    const featureDetectorResult = bestMatchUsingFeatureDetector(reducedStockDataArray, receivedImgDescriptors)

    if (featureDetectorResult[0] < 9000) {
        const productFilepath = featureDetectorResult[1][1]
        const detectedImage = cv.imread(productFilepath)

        // const detectionNo = fs.readdirSync(`./Recognised Products`).length + 1
        // const detectionoDirPath = `./Recognised Products/${detectionNo}`
        // fs.mkdirSync(detectionoDirPath)
        // cv.imwrite(`${detectionoDirPath}/detected.jpeg`, detectedImage)
        // cv.imwrite(`${detectionoDirPath}/received.jpeg`, image)
        // fs.writeFileSync(`${detectionoDirPath}/min error.txt`, JSON.stringify(featureDetectorResult[0]))
    }

    return featureDetectorResult
}


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}


const execFileAsync = promisify(execFile);
async function optimisedImageMatcherCuda(imageDataArray, image) {

    const imgFilePath = `temp_images/${generateRandomString(16)}.jpeg`;
    console.log(imgFilePath);
    cv.imwrite(imgFilePath, image);

    const featureDetectorResult = JSON.parse((await execFileAsync('python', ['automation_modules/image_matcher.py', imgFilePath])).stdout);
    fs.unlink(imgFilePath, () => {});

    return featureDetectorResult;
}

module.exports.getProductData = getProductData;
module.exports.getSeStockData = getSeStockData;
module.exports.getStockData = getStockData;
module.exports.cvMatToArray = cvMatToArray;

module.exports.bHistAxis = bHistAxis;
module.exports.rHistAxis = rHistAxis;
module.exports.gHistAxis = gHistAxis;
module.exports.cropBlackBars = cropBlackBars;
module.exports.getDescriptors = getDescriptors;
module.exports.setSomeValuesToZeroInHist = setSomeValuesToZeroInHist;
module.exports.findMatchesWithHistogram = findMatchesWithHistogram;
module.exports.bestMatchUsingFeatureDetector = bestMatchUsingFeatureDetector;
module.exports.optimisedImageMatcher = optimisedImageMatcher;
module.exports.optimisedImageMatcherCuda = optimisedImageMatcherCuda;