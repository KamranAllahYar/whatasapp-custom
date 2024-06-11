import os
import sys
import cv2
import numpy as np
import json
import time


def read_file(path):
    with open(path, "r") as file:
        return file.read().strip().split("\n")


def get_stock_data(path):
    stock_data_raw = read_file(path)
    stock_data = []
    for stock in stock_data_raw:
        stock_parts = stock.strip().split(",")
        descriptor_file_path = f"./Amrosia Stock Descriptors/{stock_parts[1]}_{stock_parts[2]}.txt"
        file_path = f"./Purse Pics/Amrosia Stock/{stock_parts[0]}/{stock_parts[1]}.jpeg"
        stock_data.append([descriptor_file_path, file_path, *stock_parts])
    return stock_data


sift = cv2.SIFT_create()


def get_descriptors(img):
    keypoints = sift.detect(img, None)
    keypoints, descriptors = sift.compute(img, keypoints)
    return descriptors


def crop_black_bars(image):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray_image = cv2.GaussianBlur(gray_image, (15, 15), 10)
    _, thresh_image = cv2.threshold(gray_image, 1, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    biggest_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(biggest_contour)
    return image[y : y + h, x : x + w]


def set_some_values_to_zero_in_hist(hist):
    hist[0][0] = 0
    hist[1][0] = 0
    hist[254][0] = 0
    hist[255][0] = 0


def find_matches_with_histogram_no_JSON(stock_array, received_img):
    hist_comp_method = cv2.HISTCMP_BHATTACHARYYA
    similarity_threshold = 0.15
    similar_stock = []
    b_hist_rec = cv2.calcHist([received_img], [0], None, [256], [0, 256])
    g_hist_rec = cv2.calcHist([received_img], [1], None, [256], [0, 256])
    r_hist_rec = cv2.calcHist([received_img], [2], None, [256], [0, 256])
    set_some_values_to_zero_in_hist(b_hist_rec)
    set_some_values_to_zero_in_hist(g_hist_rec)
    set_some_values_to_zero_in_hist(r_hist_rec)

    for index, stock in enumerate(stock_array):
        file_path = stock[1]
        tempFileName = '_'.join(file_path.split('/')[2:]).replace('.jpeg', '')
        npyFileName = f"histograms/{tempFileName}.npy"
        stored_hist = np.load(npyFileName)
        b_hist_ref = np.array(stored_hist[0], dtype=np.float32)
        g_hist_ref = np.array(stored_hist[1], dtype=np.float32)
        r_hist_ref = np.array(stored_hist[2], dtype=np.float32)
        similarity_b = cv2.compareHist(b_hist_rec, b_hist_ref, hist_comp_method)
        similarity_g = cv2.compareHist(g_hist_rec, g_hist_ref, hist_comp_method)
        similarity_r = cv2.compareHist(r_hist_rec, r_hist_ref, hist_comp_method)
        if similarity_b < similarity_threshold and similarity_g < similarity_threshold and similarity_r < similarity_threshold:
            similar_stock.append(stock)
    return similar_stock


def best_match_using_feature_detector(some_array, received_img_descriptors):
    bf = cv2.BFMatcher()
    min_error = 10000
    best_match = None

    for data in some_array:
        stored_descriptors = data[0]
        matches = bf.match(stored_descriptors, received_img_descriptors)
        matches = sorted(matches, key=lambda x: x.distance)[:100]
        error_sum = sum([match.distance for match in matches])
        if error_sum < min_error:
            min_error = error_sum
            best_match = data
    return min_error, best_match


def optimised_image_matcher(image_data_array, image):
    image = crop_black_bars(image)
    reduced_stock_data_array = find_matches_with_histogram_no_JSON(image_data_array, image)
    
    for stock in reduced_stock_data_array:
        npyFilePath = stock[0].replace('.txt', '.npy')
        if os.path.exists(npyFilePath):
            stock[0] = np.load(npyFilePath)
            continue
        with open(stock[0], "r") as file:
            stock[0] = np.array(json.load(file), dtype=np.float32)
        np.save(npyFilePath, stock[0])

    received_img_descriptors = get_descriptors(image)
    feature_detector_result = best_match_using_feature_detector(reduced_stock_data_array, received_img_descriptors)

    if feature_detector_result[0] < 9000:
        product_filepath = feature_detector_result[1][1]
        detected_image = cv2.imread(product_filepath)
        # Further processing as needed

    return feature_detector_result


def get_product_data(path):
    product_data_raw = read_file(path)
    product_data = []
    for stock in product_data_raw:
        if not stock:  # Skip empty lines
            continue
        stock_parts = stock.strip().split(",")
        descriptor_path = f"./Supplier Products/{stock_parts[4]}/{stock_parts[0]}/Descriptors/{stock_parts[1]}.txt"
        image_path = f"./Supplier Products/{stock_parts[4]}/{stock_parts[0]}/{stock_parts[1]}.jpeg"
        last_availability_update_time = json.loads(stock_parts[2])
        availability = json.loads(stock_parts[3].lower())
        price = json.loads(stock_parts[5])
        last_inquiry_update_time = json.loads(stock_parts[6])
        product_data.append([
            descriptor_path,
            image_path,
            last_availability_update_time,
            availability,
            stock_parts[4],
            price,
            last_inquiry_update_time,
        ])
    return product_data


productDataPath = "./Supplier Products/product data.csv"
productData = get_product_data(productDataPath)

image_path = sys.argv[1]  # Replace with your actual image path
image = cv2.imread(image_path, cv2.IMREAD_COLOR)

result = optimised_image_matcher(productData, image)

try:
    with open('matches.txt', 'a') as file:
        file.write(json.dumps(result) + '\n')
except Exception as e:
    print(f"An error occurred: {e}")

print(json.dumps(result))
