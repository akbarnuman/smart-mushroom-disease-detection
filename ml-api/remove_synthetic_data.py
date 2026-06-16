import os
from glob import glob

def remove_synthetic_images():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "dataset"))
    black_mold_dir = os.path.join(base_dir, "Black_Mold")
    green_mold_dir = os.path.join(base_dir, "Green_Mold")
    
    deleted_count = 0
    
    print("Scanning for synthetic images...")
    
    for folder in [black_mold_dir, green_mold_dir]:
        if os.path.exists(folder):
            synth_files = glob(os.path.join(folder, "synth_*"))
            for file in synth_files:
                try:
                    os.remove(file)
                    deleted_count += 1
                except Exception as e:
                    print(f"Could not delete {file}: {e}")
                    
    print(f"\nCleanup Complete! Removed {deleted_count} synthetic images.")
    print("Your dataset is now back to its original state.")
    print("You can now safely run: python train_model.py")

if __name__ == "__main__":
    remove_synthetic_images()
