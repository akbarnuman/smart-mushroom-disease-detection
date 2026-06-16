"""
SMDD Model Evaluation Script
Computes: Accuracy, Precision, Recall, F1-Score, Confusion Matrix
Output: evaluation_report.txt + confusion_matrix.png
"""
import os
import sys
import json
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "evaluation.log")

# Log to file (same approach as train_model.py)
class Logger:
    def __init__(self, filepath):
        self.file = open(filepath, "w", encoding="utf-8")
        self.stdout = sys.stdout
    def write(self, msg):
        self.stdout.write(msg)
        self.file.write(msg)
        self.file.flush()
    def flush(self):
        self.stdout.flush()
        self.file.flush()

sys.stdout = Logger(LOG_FILE)
sys.stderr = sys.stdout

print("=" * 60)
print("  SMDD Model Evaluation")
print("=" * 60)

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

# ─── Configuration ───────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.h5")
CLASS_MAP_FILE = os.path.join(SCRIPT_DIR, "class_indices.json")
DATASET_PATH = os.path.join(SCRIPT_DIR, "..", "data", "dataset")
IMG_SIZE = (224, 224)
BATCH_SIZE = 8
CLASSES = ['Black_Mold', 'Green_Mold', 'Healthy', 'Mixed_Infected', 'Single_Infected']

REPORT_FILE = os.path.join(SCRIPT_DIR, "evaluation_report.txt")
CM_IMAGE = os.path.join(SCRIPT_DIR, "confusion_matrix.png")

# ─── Load Model ──────────────────────────────────────────────────────────────
print(f"\nLoading model from {MODEL_PATH}...")
if not os.path.exists(MODEL_PATH):
    print("ERROR: model.h5 not found! Train the model first.")
    sys.exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
print(f"Model loaded. Params: {model.count_params():,}")

# ─── Create Validation Generator ─────────────────────────────────────────────
print(f"\nLoading validation images from {DATASET_PATH}...")
val_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

val_gen = val_datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASSES,
    subset='validation',
    shuffle=False,  # IMPORTANT: don't shuffle so predictions align with labels
    seed=42,
)

print(f"Validation images: {val_gen.samples}")
print(f"Classes: {list(val_gen.class_indices.keys())}")

# ─── Run Predictions ─────────────────────────────────────────────────────────
print("\nRunning predictions on validation set...")
val_gen.reset()

predictions = model.predict(val_gen, verbose=0)
predicted_classes = np.argmax(predictions, axis=1)
true_classes = val_gen.classes
class_names = list(val_gen.class_indices.keys())

print(f"Predictions complete. ({len(predicted_classes)} images)")

# ─── Compute Metrics ─────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  EVALUATION RESULTS")
print("=" * 60)

# Accuracy
acc = accuracy_score(true_classes, predicted_classes)
print(f"\n  Overall Accuracy: {acc:.4f} ({acc*100:.1f}%)")

# Classification Report (Precision, Recall, F1)
report = classification_report(true_classes, predicted_classes,
                                target_names=class_names, digits=4)
print(f"\n  Classification Report:\n")
print(report)

# Confusion Matrix
cm = confusion_matrix(true_classes, predicted_classes)
print("  Confusion Matrix:")
print(cm)

# ─── Save Report ──────────────────────────────────────────────────────────────
with open(REPORT_FILE, "w", encoding="utf-8") as f:
    f.write("SMDD Model Evaluation Report\n")
    f.write("=" * 60 + "\n\n")
    f.write(f"Model: {MODEL_PATH}\n")
    f.write(f"Dataset: {DATASET_PATH}\n")
    f.write(f"Validation Images: {val_gen.samples}\n")
    f.write(f"Classes: {class_names}\n\n")
    f.write(f"Overall Accuracy: {acc:.4f} ({acc*100:.1f}%)\n\n")
    f.write("Classification Report:\n")
    f.write(report + "\n\n")
    f.write("Confusion Matrix:\n")
    f.write(str(cm) + "\n\n")
    f.write("Rows = Actual class, Columns = Predicted class\n")
    f.write("Diagonal values = Correct predictions\n")

print(f"\n  Report saved to: {REPORT_FILE}")

# ─── Generate Confusion Matrix Heatmap ────────────────────────────────────────
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=[c.replace('_', '\n') for c in class_names],
            yticklabels=[c.replace('_', '\n') for c in class_names],
            linewidths=0.5, linecolor='white',
            annot_kws={"size": 14, "fontweight": "bold"})
plt.xlabel('Predicted Label', fontsize=13, fontweight='bold', labelpad=10)
plt.ylabel('Actual Label', fontsize=13, fontweight='bold', labelpad=10)
plt.title('SMDD Model - Confusion Matrix', fontsize=16, fontweight='bold', pad=15)
plt.tight_layout()
plt.savefig(CM_IMAGE, dpi=150, bbox_inches='tight')
print(f"  Confusion matrix image saved to: {CM_IMAGE}")

print("\n" + "=" * 60)
print("  EVALUATION COMPLETE")
print("=" * 60)
