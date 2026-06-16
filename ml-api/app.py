from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import json
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

MODEL_PATH     = "model.h5"
CLASS_MAP_PATH = "class_indices.json"
CLASSES = ['Black_Mold', 'Green_Mold', 'Healthy', 'Mixed_Infected', 'Single_Infected']

# ─── Step 1: Base Severity (from class) ──────────────────────────────────────
# Source: TNAU Agritech Portal – Mushroom Disease Management
SEVERITY_MAP = {
    'Healthy':          'None',
    'Single_Infected':  'Moderate',
    'Green_Mold':       'High',
    'Black_Mold':       'High',
    'Mixed_Infected':   'Critical',
}

RISK_MAP = {
    'None':     'Safe',
    'Moderate': 'Warning',
    'High':     'Critical',
    'Critical': 'Critical',
}

INFECTION_TYPE_MAP = {
    'Healthy':         'None',
    'Single_Infected': 'Bacterial/Fungal (early stage)',
    'Green_Mold':      'Fungal – Trichoderma / Penicillium',
    'Black_Mold':      'Fungal – Aspergillus / Rhizopus',
    'Mixed_Infected':  'Mixed Fungal & Bacterial',
}

# ─── Step 2 & 3: Confidence-Aware Multi-Step Recommendations ─────────────────
#
# Confidence bands:
#   uncertain  → < 60%   (model not sure)
#   likely     → 60–80%  (moderate certainty)
#   confirmed  → > 80%   (high certainty)
#
# Sources:
#   [NIOS]  National Institute of Open Schooling – Mushroom Production Module
#           https://www.nios.ac.in/media/documents/SrSecVocational/Horticulture/ch12.pdf
#   [TNAU]  Tamil Nadu Agricultural University – Mushroom Disease Management
#           https://agritech.tnau.ac.in/horticulture/horti_mushroom_diseases.html
#   [NCBI]  PubMed – Trichoderma & Fungicide Effectiveness in Mushroom Cultivation
#           https://pubmed.ncbi.nlm.nih.gov/
#   [ICAR]  Indian Council of Agricultural Research – Mushroom Cultivation Guidelines

RECOMMENDATIONS = {

    # ── HEALTHY ──────────────────────────────────────────────────────────────
    'Healthy': {
        'uncertain': {
            'treatment': [
                'Re-scan with a clearer, well-lit image for a definitive result.',
                'Inspect the mushroom visually for any discolouration or unusual spots.',
                'Do not apply any chemicals until disease is confirmed.',
            ],
            'prevention': [
                'Maintain relative humidity between 80–85% (NIOS recommended range).',
                'Ensure adequate fresh air exchange (2–3 air changes per hour).',
                'Keep all tools and surfaces sanitised.',
            ],
        },
        'likely': {
            'treatment': [
                'No active treatment required at this stage.',
                'Continue routine farm monitoring every 24–48 hours.',
                'Remove any physically damaged or discoloured mushrooms promptly.',
            ],
            'prevention': [
                'Maintain current temperature (20–28°C) and humidity (80–85%) as per NIOS guidelines.',
                'Sterilise substrate at ≥ 60°C for a minimum of 8 hours before use.',
                'Use gloves when handling mushroom bags to prevent cross-contamination.',
            ],
        },
        'confirmed': {
            'treatment': [
                'No treatment needed — mushroom is healthy.',
                'Continue scheduled harvesting and farm management.',
            ],
            'prevention': [
                'Maintain temperature 20–28°C and relative humidity 80–85% (ICAR guidelines).',
                'Sterilise all substrate thoroughly before inoculation.',
                'Enforce strict hygiene protocols: clean clothing, gloves, and sanitised tools (NIOS).',
                'Inspect all new substrate batches for contamination before use.',
            ],
        },
    },

    # ── SINGLE_INFECTED (Early Stage) ────────────────────────────────────────
    'Single_Infected': {
        'uncertain': {
            'treatment': [
                'Possible early-stage infection detected — monitor closely.',
                'Re-scan with better lighting and a closer crop of the infected area.',
                'Isolate the suspect bag/block from healthy crops as a precaution.',
            ],
            'prevention': [
                'Reduce humidity slightly to 75–80% to slow potential fungal growth.',
                'Improve air circulation around the suspect block.',
                'Sanitise nearby surfaces and tools with a 1% bleach solution (TNAU).',
            ],
        },
        'likely': {
            'treatment': [
                'Isolate the infected bag/block from all healthy mushrooms immediately.',
                'Prune visibly affected areas using sterile scissors or a knife.',
                'Apply a mild fungicide solution (e.g., 0.1% Carbendazim) to affected zones (TNAU).',
                'Re-scan after 48 hours to assess spread.',
            ],
            'prevention': [
                'Reduce relative humidity to below 80% to limit fungal spread (TNAU).',
                'Increase fresh air ventilation to 4–5 exchanges per hour.',
                'Sterilise all tools after contact with infected material (NIOS).',
                'Avoid watering directly on the mushroom surface.',
            ],
        },
        'confirmed': {
            'treatment': [
                'Immediately isolate all infected bags/blocks from healthy crops.',
                'Carefully prune and dispose of all infected fruiting bodies in a sealed bag.',
                'Apply Carbendazim (0.1%) or Benomyl to the affected substrate surface (TNAU).',
                'Discard severely infected bags — do not attempt to recover them.',
                'Monitor surrounding bags closely for the next 72 hours.',
            ],
            'prevention': [
                'Strictly enforce substrate sterilisation protocols (≥ 60°C for 8+ hours) — NIOS.',
                'Maintain humidity below 80% until the situation is controlled.',
                'Use a UV steriliser or formalin fumigation for the grow room (ICAR).',
                'Log the infected batch and trace back the substrate source.',
                'Do not reuse substrate or containers from infected batches.',
            ],
        },
    },

    # ── GREEN_MOLD (Trichoderma / Penicillium) ───────────────────────────────
    'Green_Mold': {
        'uncertain': {
            'treatment': [
                'Possible Green Mold (Trichoderma/Penicillium) detected — do not ignore.',
                'Isolate the suspect bag/block immediately as a precaution.',
                'Re-scan with a clear, close-up image of the green-tinted area.',
                'Do not apply fungicide until confirmed — avoid unnecessary chemical use.',
            ],
            'prevention': [
                'Reduce humidity to below 80% — Green Mold thrives in high moisture (TNAU).',
                'Increase ventilation to flush out fungal spores.',
                'Wipe surfaces with a 2% bleach solution (sodium hypochlorite).',
            ],
        },
        'likely': {
            'treatment': [
                'Isolate the infected bag/block from all healthy crops immediately.',
                'Apply Carbendazim (0.1%) or Chlorothalonil spray on the visible green patches (TNAU).',
                'Do not touch the green area with bare hands — wear gloves and a mask (spores spread).',
                'Remove infected fruiting bodies and seal in a plastic bag before disposal.',
                'Re-examine after 24 hours for spread.',
            ],
            'prevention': [
                'Keep humidity strictly below 85% — Green Mold (Trichoderma) thrives above this (TNAU).',
                'Ensure substrate is properly sterilised — Trichoderma commonly enters via poorly sterilised compost (NIOS).',
                'Increase air circulation significantly (5–6 exchanges per hour).',
                'Sanitise the grow room with formalin or 2% bleach solution after removal.',
            ],
        },
        'confirmed': {
            'treatment': [
                '🚨 IMMEDIATE ACTION REQUIRED — Green Mold (Trichoderma) confirmed.',
                'Remove and seal ALL infected bags in double plastic bags for disposal outside the farm.',
                'Apply Carbendazim (0.1%) or Benomyl to the grow room surfaces — proven effective against Trichoderma (TNAU, NCBI).',
                'Spraying Chlorothalonil on surrounding healthy blocks as a protective measure (TNAU).',
                'Fumigate the grow room with formalin solution (2%) after removing infected material (ICAR).',
                'Do not attempt to salvage infected bags — Green Mold spreads rapidly via airborne spores.',
            ],
            'prevention': [
                'Sterilise all future substrate at ≥ 121°C (autoclave) or ≥ 60°C for 12+ hours (NIOS).',
                'Maintain humidity strictly below 80% — highest priority control measure (TNAU).',
                'Enforce mandatory glove and mask use for all workers entering the grow room.',
                'Install HEPA air filters or positive pressure ventilation to prevent spore entry (ICAR).',
                'Quarantine and thoroughly clean the affected grow room before reuse.',
                'Source substrate only from certified, sterilised suppliers.',
            ],
        },
    },

    # ── BLACK_MOLD (Aspergillus / Rhizopus) ──────────────────────────────────
    'Black_Mold': {
        'uncertain': {
            'treatment': [
                'Possible Black Mold (Aspergillus/Rhizopus) detected — treat with caution.',
                'Isolate the suspect bag/block from the rest of the farm immediately.',
                'Re-scan with a clearer and well-lit image focused on the dark areas.',
                'Avoid disturbing the affected area — Black Mold spores are harmful if inhaled.',
            ],
            'prevention': [
                'Reduce humidity and improve air flow around the suspect block.',
                'Wear a mask when inspecting — Aspergillus spores can cause respiratory issues.',
                'Clean surrounding surfaces with a 2% bleach solution as a precaution.',
            ],
        },
        'likely': {
            'treatment': [
                'Isolate the infected bag/block immediately — wear gloves and a mask.',
                'Apply an appropriate fungicide (Carbendazim 0.1% or Mancozeb) to the surface (TNAU).',
                'Remove and safely dispose of darkened or decaying substrate sections.',
                'Clean surrounding areas with bleach solution.',
                'Re-scan after 48 hours.',
            ],
            'prevention': [
                'Avoid over-watering — Aspergillus/Rhizopus thrives in waterlogged conditions (TNAU).',
                'Improve air circulation to reduce moisture buildup.',
                'Sterilise substrate properly — Rhizopus commonly enters via inadequate sterilisation (NIOS).',
                'Store spawn and substrate in clean, dry conditions.',
            ],
        },
        'confirmed': {
            'treatment': [
                '🚨 IMMEDIATE ACTION REQUIRED — Black Mold (Aspergillus/Rhizopus) confirmed.',
                'Wear N95 mask and gloves before handling — Aspergillus spores are hazardous to health.',
                'Remove ALL infected bags immediately and seal in heavy-duty plastic bags.',
                'Apply Carbendazim (0.1%) or Mancozeb solution to affected area and surrounding surfaces (TNAU).',
                'Fumigate the grow room with formalin (2%) after complete removal of infected material (ICAR).',
                'Do not compost infected substrate — dispose of it away from the farm entirely.',
            ],
            'prevention': [
                'Eliminate over-watering entirely — the primary driver of Black Mold (TNAU).',
                'Improve drainage and air circulation in the grow room significantly.',
                'Autoclave or pressure-cook all substrate (≥ 121°C for 1+ hour) before inoculation (NIOS).',
                'Maintain grow room temperature between 20–25°C — cooler temps inhibit Aspergillus growth.',
                'Disinfect water sources and irrigation equipment regularly.',
                'Conduct a full grow room sanitation before the next cultivation cycle (ICAR).',
            ],
        },
    },

    # ── MIXED_INFECTED (Multiple pathogens) ───────────────────────────────────
    'Mixed_Infected': {
        'uncertain': {
            'treatment': [
                'Multiple infection types may be present — assess carefully.',
                'Isolate the suspect bags/blocks immediately.',
                'Re-scan with a clearer image — different infections may require different treatments.',
                'Do not apply any chemicals until the specific pathogens are identified.',
            ],
            'prevention': [
                'Immediately reduce humidity and increase ventilation.',
                'Sanitise all surfaces around suspect blocks with 2% bleach solution.',
                'Wear gloves and mask during inspection.',
            ],
        },
        'likely': {
            'treatment': [
                'Isolate ALL potentially infected bags/blocks — mixed infections spread rapidly.',
                'Apply a broad-spectrum fungicide (Carbendazim + Mancozeb combination) (TNAU).',
                'Remove all visibly diseased fruiting bodies and substrate sections.',
                'Sanitise the grow room floor and walls with bleach solution.',
                'Consider discarding the entire batch if spread is beyond 30% of bags.',
            ],
            'prevention': [
                'Multiple pathogens indicate poor sterilisation — review substrate preparation protocols (NIOS).',
                'Reduce humidity to below 75% to limit spread of all pathogen types.',
                'Enforce strict bio-security: limit worker access, mandatory gloves and masks (ICAR).',
                'Increase air exchanges to 6+ per hour.',
            ],
        },
        'confirmed': {
            'treatment': [
                '🚨 CRITICAL EMERGENCY — Multiple diseases confirmed across your crop.',
                'IMMEDIATELY quarantine the entire affected grow room — restrict all entry.',
                'Remove and seal ALL infected material in heavy-duty bags for off-site disposal.',
                'Apply broad-spectrum fungicide (Carbendazim 0.1% + Mancozeb) to entire room (TNAU).',
                'Fumigate the grow room with formalin (2%) after clearing all infected material (ICAR).',
                'Do NOT move any infected material through healthy growing areas.',
                'Notify all farm workers and enforce strict hygiene before re-entering any area.',
            ],
            'prevention': [
                'Complete shutdown and deep cleaning of the affected grow room is mandatory.',
                'Overhaul substrate sterilisation process — mixed infections indicate systemic failure (NIOS).',
                'All future substrate must be autoclaved at ≥ 121°C for minimum 1 hour.',
                'Implement strict bio-security: dedicated clothing, UV entry lights, air filtration (ICAR).',
                'Do not reuse any containers, tools, or substrate from the infected batch.',
                'Conduct independent microbiological testing of water and substrate sources.',
                'Allow minimum 2-week clean period before starting a new cultivation cycle.',
            ],
        },
    },
}


def get_confidence_band(confidence_float):
    """Returns confidence band label and description."""
    if confidence_float < 0.60:
        return 'uncertain', 'Uncertain — Re-scan Recommended'
    elif confidence_float < 0.80:
        return 'likely', 'Likely — Take Precaution'
    else:
        return 'confirmed', 'Confirmed — Act Now'


# ─── Model loading ───────────────────────────────────────────────────────────
model = None

def load_ml_model():
    global model, CLASSES
    if not os.path.exists(MODEL_PATH):
        print("⚠  model.h5 not found – run train_model.py first.")
        return
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅  Model loaded from {MODEL_PATH}")
        if os.path.exists(CLASS_MAP_PATH):
            with open(CLASS_MAP_PATH) as f:
                idx_map = json.load(f)
            CLASSES = sorted(idx_map, key=idx_map.get)
            print(f"✅  Classes: {CLASSES}")
    except Exception as exc:
        print(f"❌  Failed to load model: {exc}")


# ─── Health endpoint ─────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


# ─── Prediction endpoint ──────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img = img.resize((224, 224))

        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)  # (1, 224, 224, 3)

        preds      = model.predict(img_array, verbose=0)[0]
        pred_idx   = int(np.argmax(preds))
        disease    = CLASSES[pred_idx]
        confidence = float(preds[pred_idx])

        # ── Step 1: Base severity from class ──
        severity       = SEVERITY_MAP.get(disease, 'Unknown')
        risk_level     = RISK_MAP.get(severity, 'Unknown')
        infection_type = INFECTION_TYPE_MAP.get(disease, 'Unknown')

        # ── Step 2: Confidence band ──
        band, band_label = get_confidence_band(confidence)

        # ── Step 3: Combined recommendation ──
        rec         = RECOMMENDATIONS.get(disease, {}).get(band, {})
        treatment   = rec.get('treatment', ['No recommendation available.'])
        prevention  = rec.get('prevention', ['No recommendation available.'])

        all_probs = {CLASSES[i]: round(float(preds[i]), 6) for i in range(len(CLASSES))}

        return jsonify({
            'disease':              disease,
            'confidence':           f"{confidence * 100:.2f}%",
            'confidence_raw':       round(confidence, 4),
            'confidence_label':     band_label,        # e.g. "Confirmed — Act Now"
            'severity':             severity,
            'risk_level':           risk_level,
            'infection_type':       infection_type,
            'treatment':            treatment,         # now a list of steps
            'prevention':           prevention,        # now a list of steps
            'all_probabilities':    all_probs,
        })

    except Exception as exc:
        return jsonify({'error': f'Prediction failed: {str(exc)}'}), 500


# ─── Entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    load_ml_model()
    app.run(port=5000, debug=False)
