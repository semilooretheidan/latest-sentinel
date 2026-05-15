import cv2
import os
from skimage.metrics import structural_similarity as ssim

def compare_images(ref_path, upload_path):
    # Check if reference image exists, if not, download a placeholder
    if not os.path.exists(ref_path):
        import requests
        print(f"Reference image {ref_path} missing. Downloading a default...")
        url = "apple1.png"
        # url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
        # r = requests.get(url)
        # with open(ref_path, 'wb') as f:
        #     f.write(r.content)

    original = cv2.imread(ref_path)
    test = cv2.imread(upload_path)

    if original is None:
        raise ValueError(f"Reference image not found at {ref_path}")
    if test is None:
        raise ValueError(f"Uploaded image could not be read at {upload_path}")


    test = cv2.resize(test, (original.shape[1], original.shape[0]))

    gray1 = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(test, cv2.COLOR_BGR2GRAY)

    score, _ = ssim(gray1, gray2, full=True)
    return score * 100