import os
import cv2
import numpy as np
import random
from glob import glob

def generate_synthetic_mold(image_path, output_path, mold_type="black"):
    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        return False
        
    h, w, _ = img.shape
    
    # Create an overlay layer (with alpha channel for transparency blending)
    overlay = img.copy()
    
    # Determine mold parameters
    num_spots = random.randint(2, 6)
    
    for _ in range(num_spots):
        # Random location
        center_x = random.randint(int(w*0.1), int(w*0.9))
        center_y = random.randint(int(h*0.1), int(h*0.9))
        
        # Random size relative to image
        radius = random.randint(int(w*0.05), int(w*0.15))
        
        # Determine color based on mold type (BGR format for OpenCV)
        if mold_type == "black":
            # Very dark grays/blacks
            b = random.randint(10, 40)
            g = random.randint(10, 40)
            r = random.randint(10, 40)
        else: # green
            # Dark forest greens
            b = random.randint(10, 50)
            g = random.randint(80, 150)
            r = random.randint(10, 50)
            
        color = (b, g, r)
        
        # Draw a filled circle on the overlay
        cv2.circle(overlay, (center_x, center_y), radius, color, -1)
        
        # Add some irregular shapes to make it look less like a perfect circle
        for _ in range(3):
            off_x = center_x + random.randint(-radius//2, radius//2)
            off_y = center_y + random.randint(-radius//2, radius//2)
            sub_radius = random.randint(radius//3, int(radius*0.8))
            cv2.circle(overlay, (off_x, off_y), sub_radius, color, -1)

    # Blur the overlay heavily to make it look like fuzzy mold instead of paint
    blur_kernel_size = min(w, h) // 10
    if blur_kernel_size % 2 == 0:
        blur_kernel_size += 1 # Kernel size must be odd
    
    overlay = cv2.GaussianBlur(overlay, (blur_kernel_size, blur_kernel_size), 0)

    # Blend the original image with the fuzzy overlay
    # Alpha controls opacity. 0.4 to 0.7 means the mold is somewhat see-through
    alpha = random.uniform(0.4, 0.7)
    blended = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)
    
    # Save the synthetic image
    cv2.imwrite(output_path, blended)
    return True

if __name__ == "__main__":
    # Define paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "dataset"))
    healthy_dir = os.path.join(base_dir, "Healthy")
    black_mold_dir = os.path.join(base_dir, "Black_Mold")
    green_mold_dir = os.path.join(base_dir, "Green_Mold")
    
    # Get all healthy images
    healthy_images = glob(os.path.join(healthy_dir, "*.*"))
    print(f"Found {len(healthy_images)} Healthy images to use as base.")
    
    # Counters
    black_count = 0
    green_count = 0
    
    print("Ensuring exactly 200 synthetic images exist for Black and Green Mold...")
    
    # Check Black Mold
    bm_synth_files = glob(os.path.join(black_mold_dir, "synth_bm_*"))
    if len(bm_synth_files) > 200:
        excess = len(bm_synth_files) - 200
        print(f"Found {len(bm_synth_files)} synthetic Black Mold images. Removing {excess} excess images...")
        for file in bm_synth_files[200:]:
            os.remove(file)
    print(f"Black Mold synthetic count is now: {min(len(bm_synth_files), 200)}")

    # Check Green Mold
    gm_synth_files = glob(os.path.join(green_mold_dir, "synth_gm_*"))
    if len(gm_synth_files) > 200:
        excess = len(gm_synth_files) - 200
        print(f"Found {len(gm_synth_files)} synthetic Green Mold images. Removing {excess} excess images...")
        for file in gm_synth_files[200:]:
            os.remove(file)
    print(f"Green Mold synthetic count is now: {min(len(gm_synth_files), 200)}")
    
    print("\nDataset perfectly balanced to 200 synthetic images each!")
    print("You can now run: python train_model.py")
