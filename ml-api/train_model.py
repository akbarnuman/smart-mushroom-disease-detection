"""
Smart Mushroom Disease Detection — Model Training
Logs all output to training.log for reliable monitoring.
"""
import os
import sys
import json
import traceback

# Redirect ALL output to a log file
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "training.log")

class Logger:
    def __init__(self, filepath):
        self.file = open(filepath, "w", encoding="utf-8")
    def write(self, msg):
        self.file.write(msg)
        self.file.flush()
    def flush(self):
        self.file.flush()

sys.stdout = Logger(LOG_FILE)
sys.stderr = sys.stdout

print("=== Training script started ===")

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import numpy as np

# ─── Configuration ───────────────────────────────────────────────────────────
DATASET_PATH   = os.path.join(SCRIPT_DIR, "..", "data", "dataset")
IMG_SIZE       = (224, 224)
BATCH_SIZE     = 8
EPOCHS_PHASE1  = 10
EPOCHS_PHASE2  = 10
NUM_CLASSES    = 5
CLASSES        = ['Black_Mold', 'Green_Mold', 'Healthy', 'Mixed_Infected', 'Single_Infected']

CHECKPOINT_P1  = os.path.join(SCRIPT_DIR, "checkpoints", "phase1.h5")
FINAL_MODEL    = os.path.join(SCRIPT_DIR, "model.h5")
CLASS_MAP_FILE = os.path.join(SCRIPT_DIR, "class_indices.json")

os.makedirs(os.path.join(SCRIPT_DIR, "checkpoints"), exist_ok=True)

# ─── Custom callback ────────────────────────────────────────────────────────
class EpochLogger(tf.keras.callbacks.Callback):
    def on_epoch_begin(self, epoch, logs=None):
        print(f"  Epoch {epoch+1} started...")
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        print(f"  Epoch {epoch+1} done: "
              f"acc={logs.get('accuracy',0):.4f}  "
              f"val_acc={logs.get('val_accuracy',0):.4f}  "
              f"loss={logs.get('loss',0):.4f}  "
              f"val_loss={logs.get('val_loss',0):.4f}")

# ─── Helpers ─────────────────────────────────────────────────────────────────
def count_images(folder):
    exts = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')
    if not os.path.isdir(folder):
        return 0
    return len([f for f in os.listdir(folder) if f.lower().endswith(exts)])

def main():
    print("=" * 60)
    print("  Smart Mushroom Disease Detection - Model Training")
    print("=" * 60)

    # Dataset summary
    total = 0
    for cls in CLASSES:
        n = count_images(os.path.join(DATASET_PATH, cls))
        total += n
        print(f"  {cls}: {n} images")
    print(f"  Total: {total} images")

    if total == 0:
        print("ERROR: No images found!")
        return

    # Generators
    train_dg = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2,
    )
    val_dg = ImageDataGenerator(rescale=1./255, validation_split=0.2)

    train_gen = train_dg.flow_from_directory(
        DATASET_PATH, target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode='categorical', classes=CLASSES, subset='training',
        shuffle=True, seed=42,
    )
    val_gen = val_dg.flow_from_directory(
        DATASET_PATH, target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode='categorical', classes=CLASSES, subset='validation',
        shuffle=False, seed=42,
    )

    # Save class indices
    with open(CLASS_MAP_FILE, "w") as f:
        json.dump(train_gen.class_indices, f, indent=2)
    print(f"Class indices saved to {CLASS_MAP_FILE}")

    # Class weights
    counts = np.zeros(NUM_CLASSES)
    for cls, idx in train_gen.class_indices.items():
        counts[idx] = count_images(os.path.join(DATASET_PATH, cls))
    total_count = counts.sum()
    weights = {}
    for i in range(NUM_CLASSES):
        weights[i] = (total_count / (NUM_CLASSES * counts[i])) if counts[i] > 0 else 1.0
    print(f"Class weights: {weights}")

    # Build model
    print("\nBuilding MobileNetV2 model (alpha=0.35)...")
    base = MobileNetV2(weights='imagenet', include_top=False,
                       input_shape=(224, 224, 3), alpha=0.35)
    base.trainable = False
    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.4)(x)
    out = Dense(NUM_CLASSES, activation='softmax')(x)
    model = Model(inputs=base.input, outputs=out)
    print(f"Model built. Total params: {model.count_params():,}")

    # ─── Phase 1 ─────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  PHASE 1: Training classification head (base frozen)")
    print("=" * 60)

    model.compile(optimizer=Adam(1e-3), loss='categorical_crossentropy', metrics=['accuracy'])

    model.fit(train_gen, epochs=EPOCHS_PHASE1, validation_data=val_gen,
              class_weight=weights, verbose=0, callbacks=[EpochLogger()])

    model.save(CHECKPOINT_P1)
    print(f"Phase 1 checkpoint saved: {CHECKPOINT_P1}")
    model.save(FINAL_MODEL)
    print(f"model.h5 saved (usable by Flask API)")

    # ─── Phase 2 ─────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  PHASE 2: Fine-tuning top layers of MobileNetV2")
    print("=" * 60)

    for layer in base.layers[-20:]:
        layer.trainable = True

    model.compile(optimizer=Adam(1e-4), loss='categorical_crossentropy', metrics=['accuracy'])

    model.fit(train_gen, epochs=EPOCHS_PHASE2, validation_data=val_gen,
              class_weight=weights, verbose=0, callbacks=[EpochLogger()])

    model.save(FINAL_MODEL)
    print(f"\nFinal model saved: {FINAL_MODEL}")
    print("\n=== TRAINING COMPLETE ===")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nERROR: {e}")
        traceback.print_exc()
        print("\nIf Phase 1 completed, model.h5 is still usable.")
