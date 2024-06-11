import os


import sys
import cv2
import numpy as np
import json

def set_some_values_to_zero_in_hist(hist):
    hist[0][0] = 0
    hist[1][0] = 0
    hist[254][0] = 0
    hist[255][0] = 0

tempFileName = sys.argv[1]

img = cv2.imread(f"""temp_images/{tempFileName}.jpeg""")

b_hist = cv2.calcHist([img], [0], None, [256], [0, 256])
g_hist = cv2.calcHist([img], [1], None, [256], [0, 256])
r_hist = cv2.calcHist([img], [2], None, [256], [0, 256])

set_some_values_to_zero_in_hist(b_hist)
set_some_values_to_zero_in_hist(g_hist)
set_some_values_to_zero_in_hist(r_hist)

hist = np.array([b_hist, g_hist, r_hist])

np.save(f"""histograms/{tempFileName}""", hist)
