# SMDD — Treatment & Prevention System Documentation

**File:** `TREATMENT_PREVENTION.md`  
**Location:** `ml-api/`  
**Last Updated:** April 2026  
**Author:** SMDD Project

---

## 1. Overview

The Smart Mushroom Disease Detection (SMDD) system does not just identify diseases — it also provides **actionable, research-backed treatment and prevention recommendations** for each detected condition.

These recommendations are:
- Specific to each of the **5 detected disease classes**
- Adjusted based on the **model's confidence score**
- Sourced from **government agricultural institutions and peer-reviewed research**

---

## 2. Disease Classes & What They Mean

The SMDD model detects 5 classes of mushroom health conditions:

| Class | Meaning | Real-World Indication |
|-------|---------|----------------------|
| `Healthy` | No disease detected | Mushroom is developing normally |
| `Single_Infected` | Early-stage, single-pathogen infection | One area or surface shows early signs of contamination |
| `Green_Mold` | Trichoderma / Penicillium fungal infection | Visible green patches on substrate or mushroom surface |
| `Black_Mold` | Aspergillus / Rhizopus fungal infection | Dark/black patches, often with powdery texture |
| `Mixed_Infected` | Multiple pathogens present simultaneously | Widespread contamination with more than one disease type |

---

## 3. Severity Classification Logic

Each class is assigned a **base severity level** derived from its real-world agricultural impact.

| Class | Base Severity | Risk Level | Rationale |
|-------|:------------:|:----------:|-----------|
| `Healthy` | None | Safe | No disease present |
| `Single_Infected` | Moderate | Warning | Localised infection, containable if caught early |
| `Green_Mold` | High | Critical | Trichoderma spreads rapidly via airborne spores |
| `Black_Mold` | High | Critical | Aspergillus spores are hazardous; spreads quickly |
| `Mixed_Infected` | Critical | Critical | Multiple pathogens = systemic farm risk |

> **Source:** Severity classification is based on disease spread rates and agricultural impact documented in TNAU Agritech Portal and ICAR mushroom cultivation guidelines.

---

## 4. Confidence Band System

The model outputs a **confidence score** (0–100%) for each prediction. This score represents how certain the model is about its detected class.

Simply knowing the disease class is not enough — a **47% confident "Mixed Infected"** prediction should lead to very different action than a **92% confident "Mixed Infected"** prediction.

### Confidence Bands

| Band | Confidence Range | Interpretation | Badge Shown to User |
|------|:---------------:|---------------|---------------------|
| `uncertain` | < 60% | Model is not sure | 🔘 Uncertain — Re-scan Recommended |
| `likely` | 60% – 80% | Moderate certainty | 🟠 Likely — Take Precaution |
| `confirmed` | > 80% | High certainty | 🔴 Confirmed — Act Now |

### Why This Matters

Without confidence adjustment:
- A **45% Green Mold** prediction would trigger the same emergency steps as a **95% Green Mold** — this could lead to **unnecessary chemical use** and **farmer panic**
- A **55% Mixed Infected** prediction could cause disposal of entirely healthy batches

With confidence adjustment:
- `uncertain` band → "Do not apply chemicals. Re-scan with a clearer image."
- `confirmed` band → "Immediately remove infected bags. Apply fungicide. Fumigate."

---

## 5. Recommendation Logic — How It Works

The final recommendation is determined by **combining both factors**:

```
Disease Class  +  Confidence Band  =  Specific Recommendation Set
```

### Example Combinations

| Disease | Confidence | Band | Action Level |
|---------|:---------:|------|-------------|
| Green_Mold | 92% | confirmed | Emergency — remove bags, apply Carbendazim, fumigate |
| Green_Mold | 68% | likely | Precautionary — isolate, apply fungicide, re-examine |
| Green_Mold | 44% | uncertain | Monitor — re-scan, do not apply chemicals yet |
| Healthy | 85% | confirmed | All clear — maintain current conditions |
| Mixed_Infected | 47% | uncertain | Isolate and re-scan before taking major action |
| Mixed_Infected | 91% | confirmed | Critical emergency — quarantine entire grow room |

This gives **15 unique recommendation sets** (5 diseases × 3 confidence bands), ensuring the advice is always proportionate to the actual risk.

---

## 6. Treatment & Prevention Content — Sources

All treatment and prevention steps are based on the following credible sources:

---

### 6.1 National Institute of Open Schooling (NIOS)
**Document:** Mushroom Production — Disease Management Module  
**Publisher:** Ministry of Education, Government of India  
**URL:** https://www.nios.ac.in/media/documents/SrSecVocational/Horticulture/ch12.pdf

**What it covers (used in SMDD):**
- Importance of substrate sterilisation (≥ 60°C for 8+ hours)
- Removal of infected material from the grow area
- General farm hygiene protocols
- Worker hygiene: gloves, dedicated clothing, tool sterilisation
- Compost preparation and contamination prevention

**Applied to classes:** All 5 classes, primarily `Single_Infected`, `Healthy` prevention

---

### 6.2 Tamil Nadu Agricultural University (TNAU) Agritech Portal
**Section:** Major Mushroom Diseases & Their Management  
**Publisher:** Tamil Nadu Agricultural University, Government of Tamil Nadu  
**URL:** https://agritech.tnau.ac.in/horticulture/horti_mushroom_diseases.html

**What it covers (used in SMDD):**
- Specific fungicides for Green Mold (Trichoderma):
  - **Carbendazim (0.1%)** — primary fungicide recommendation
  - **Benomyl** — alternative fungicide
  - **Chlorothalonil** — protective spray for surrounding healthy blocks
- Humidity control: keep below 85% to prevent Trichoderma growth
- Air circulation requirements (fresh air exchanges per hour)
- Black Mold (Aspergillus) management: Carbendazim, Mancozeb
- Salt treatment and bleach-based sanitation (2% sodium hypochlorite)
- Importance of proper air filtration and positive pressure ventilation

**Applied to classes:** `Green_Mold` (primary), `Black_Mold`, `Mixed_Infected`

---

### 6.3 Indian Council of Agricultural Research (ICAR)
**Document:** Mushroom Cultivation — Good Agricultural Practices  
**Publisher:** ICAR — Directorate of Mushroom Research, Solan, Himachal Pradesh  
**URL:** https://www.icar.org.in/

**What it covers (used in SMDD):**
- Formalin fumigation (2%) for grow room decontamination after infection
- Bio-security protocols: restricted worker access, UV entry lights
- Grow room shutdown and cleaning procedures after outbreaks
- Water source and irrigation equipment disinfection
- Mandatory rest period (minimum 2 weeks) after cleaning infected rooms

**Applied to classes:** `Black_Mold` confirmed, `Mixed_Infected` confirmed

---

### 6.4 National Center for Biotechnology Information (NCBI) / PubMed
**Topic:** Trichoderma Control Using Fungicides in Mushroom Cultivation  
**Publisher:** U.S. National Library of Medicine  
**URL:** https://pubmed.ncbi.nlm.nih.gov/

**Key research findings (used in SMDD):**
- Carbendazim is an effective fungicide against Trichoderma harzianum (Green Mold)
- Trichoderma spreads via airborne conidia — air filtration is critical
- Early detection and substrate removal are more effective than post-infection treatment
- Proper sterilisation temperature (≥ 121°C autoclave) significantly reduces Trichoderma contamination rates

**Applied to classes:** `Green_Mold` confirmed band recommendations

---

## 7. Source-to-Recommendation Mapping

| Recommendation Step | Source |
|--------------------|--------|
| "Sterilise substrate at ≥ 60°C for 8+ hours" | NIOS |
| "Apply Carbendazim (0.1%) to affected zones" | TNAU |
| "Keep humidity below 85%" | TNAU |
| "Increase fresh air exchanges to 5–6 per hour" | TNAU |
| "Fumigate grow room with formalin (2%)" | ICAR |
| "Allow minimum 2-week rest before reuse" | ICAR |
| "Use N95 mask — Aspergillus spores hazardous" | NCBI + TNAU |
| "Apply Chlorothalonil to healthy surrounding blocks" | TNAU |
| "Do not reuse containers from infected batches" | NIOS + ICAR |
| "Autoclave at ≥ 121°C for 1+ hour" | NCBI |

---

## 8. What This System Is Not

This system provides **general agricultural guidance** based on established research. It is:

- **Not a substitute** for professional mycological consultation
- **Not a guaranteed diagnosis** — model accuracy depends on image quality and training data
- **Not a prescription** — fungicide usage should follow local agricultural regulations

> **Disclaimer:** Recommendations are general guidelines based on NIOS, TNAU, ICAR, and NCBI publications. Consult a certified mycologist or agricultural extension officer for farm-specific advice.

---

## 9. Quick Reference — Confidence + Disease Matrix

| | `uncertain` (<60%) | `likely` (60–80%) | `confirmed` (>80%) |
|--|:--:|:--:|:--:|
| **Healthy** | Re-scan recommended | Maintain conditions | All clear ✅ |
| **Single_Infected** | Isolate & monitor | Prune + Carbendazim | Full isolation + discard |
| **Green_Mold** | Isolate & re-scan | Apply fungicide + isolate | Emergency removal + fumigate |
| **Black_Mold** | Isolate & re-scan | Apply Carbendazim + Mancozeb | Emergency + formalin |
| **Mixed_Infected** | Isolate & re-scan | Broad-spectrum fungicide | Full quarantine 🚨 |
