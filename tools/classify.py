#!/usr/bin/env python3
"""FASE 2 (v2): Klasifikasi 2234 mesh ke sistem organ. Aturan: first-match-wins (ordered).
File dengan English name kosong -> fallback ke nama M-pair-nya (mirror)."""
import json, re
from pathlib import Path
from collections import Counter

BASE = Path.home() / "workspace/anatomi-explode/v2"
inv = json.load(open(BASE / "models/inventory.json"))
by_file = {r["file"]: r for r in inv}

# (sistem, [regex...]) — URUTAN = prioritas. First match wins.
RULES = [
    ("arteries", [
        r"\barter(y|ies|ial)\b", r"\baorta\b", r"\barteria\b",
        r"\btrunk\b(?!.*\bvein)", r"\b(palmar|plantar) arch\b",
    ]),
    ("veins", [
        r"\bvein(s)?\b", r"\bvenous\b", r"\bvena\b",
    ]),
    ("nervous_system", [
        r"\bnerve(s)?\b", r"\bbrain\b", r"cerebr(um|al)", r"cerebell",
        r"spinal cord", r"\bmedulla\b", r"\bneuron\b", r"\bganglion\b",
        r"\bgyrus\b", r"white matter", r"gray matter", r"\bfornix\b",
        r"hypothalamus", r"hippocampus", r"\bthalamus\b", r"\bmidbrain\b",
        r"\bpons\b", r"choroid plexus", r"cerebral aqueduct",
        r"lateral ventricle", r"third ventricle", r"fourth ventricle",
        r"interventricular foramen", r"interpeduncular", r"commissure",
        r"colliculus", r"brachium of", r"corpus callosum", r"habenula",
        r"\binsula\b", r"internal capsule", r"amygdala", r"caudate nucleus",
        r"globus pallidus", r"\bputamen\b", r"lamina terminalis",
        r"tuber cinereum", r"mammillary", r"geniculate", r"\bstria\b",
        r"tentorium", r"telencephalon", r"\blobule\b",
        r"(occipital|parietal|frontal|temporal) lobe",
    ]),
    ("urinary", [
        r"\bkidney(s)?\b", r"\bureter(s)?\b", r"\burethr(a|al)\b", r"\brenal\b",
        r"(?<!gall)bladder",
    ]),
    ("respiratory", [
        r"arytenoid cartilage", r"cricoid cartilage", r"thyroid cartilage",
        r"cuneiform cartilage", r"corniculate cartilage",
        r"thyrohyoid membrane", r"nasal cartilage", r"alar cartilage",
        r"nasal concha", r"\bvocal\b", r"conus elasticus",
        r"\blung(s)?\b", r"\bbronch", r"\btrachea\b", r"\balveol",
        r"\bdiaphragm\b", r"\bpleura\b", r"\bnasal\b", r"\blarynx\b",
        r"\blaryngeal\b", r"\bepiglottis\b", r"\bphrenic\b",
    ]),
    ("digestive", [
        r"\bliver\b", r"\bhepatic\b", r"\bstomach\b", r"\bgastric\b",
        r"\bintestin", r"\besophag", r"\bpancrea", r"\bgallbladder\b",
        r"\bcolon\b", r"\bcolic\b", r"\brectum\b", r"\brectal\b",
        r"\btongue\b", r"\bsalivary\b", r"\bpharyn", r"\bappendix\b",
        r"\bduodenum\b", r"\bjejunum\b", r"\bileum\b", r"ileocecal",
        r"\bmesentery\b", r"\bbiliary\b", r"\bbile\b", r"\bcecum\b",
        r"\bcecal\b", r"\bgingiva\b", r"\buvula\b", r"\bperitoneum\b",
        r"\bomentum\b", r"\bsphincter\b", r"sublingual", r"submandibular",
        r"hepatic duct", r"cystic duct", r"\btaenia\b", r"mesoappendix",
        r"mesocolon", r"hepatovenous",
    ]),
    ("heart", [
        r"\bheart\b", r"\bcardiac\b", r"\batri(um|al)\b", r"\bventricle\b",
        r"\bvalve\b", r"\bcusp\b", r"\bleaflet\b", r"\bcoronary\b",
        r"\bpapillary\b",
    ]),
    ("muscles", [
        r"\bmuscle\b", r"\bmusculus\b", r"flexor", r"extensor", r"abductor",
        r"adductor", r"pronator", r"supinator", r"\blongus\b", r"\bbrevis\b",
        r"\bbreves\b", r"\bmagnus\b", r"\bmaximus\b", r"\bmedius\b",
        r"\bminimus\b", r"\bminimi\b", r"\bmajor\b", r"\bminor\b",
        r"\bcapitis\b", r"cervicis", r"thoracis", r"lumborum", r"digitorum",
        r"pollicis", r"hallucis", r"digiti", r"\bcarpi\b", r"brachii",
        r"brachialis", r"gluteus", r"deltoid(?! ligament)", r"pectoralis",
        r"trapezius", r"rhomboid", r"serratus", r"scalenus", r"splenius",
        r"semispinalis", r"\bspinalis\b", r"interspinal", r"levator(es)?",
        r"lumbrical", r"\binterosseous\b(?! membrane)", r"\binterossei\b",
        r"\bteres\b", r"\boblique\b", r"\brectus\b", r"\btendon\b",
        r"\bpsoas\b", r"sartorius", r"gracilis", r"soleus", r"gastrocnemius",
        r"\bbiceps\b", r"\btriceps\b", r"sternocleidomastoid", r"\biliacus\b",
        r"\bpiriformis\b", r"\bobturator\b", r"gemellus", r"quadratus",
        r"vastus", r"\btibialis\b", r"fibularis", r"\bmentalis\b",
        r"platysma", r"cricothyroid(?! ligament)", r"\barytenoid\b",
        r"(genio|mylo|omo|sterno|stylo|thyro)hyoid(?! ligament)",
        r"pectineus", r"plantaris", r"popliteus", r"semimembranosus",
        r"semitendinosus", r"coccygeus", r"iliococcygeus", r"pubococcygeus",
        r"puborectalis", r"subclavius", r"anconeus", r"brachioradialis",
        r"subscapularis", r"supraspinatus", r"digastric", r"sternothyroid",
        r"intertransvers", r"\brotator\b", r"genioglossus", r"hyoglossus",
        r"palatopharyngeus", r"salpingopharyngeus", r"stylopharyngeus",
        r"aryepiglotticus", r"\bvocalis\b", r"tensor veli palatini",
        r"tensor fasciae latae",
    ]),
    ("sensory_organs", [
        r"\beye(s)?\b", r"\beyeball\b", r"\bear(s)?\b", r"\boptic\b",
        r"\bretina\b", r"\bcochle", r"\blacrimal\b(?! bone)", r"\bchoroid\b",
        r"\bciliary\b", r"\bciliaris\b", r"\bcornea\b", r"\biris\b",
        r"\blens\b", r"\bsclera\b", r"\bvitreous\b", r"\bconjunctiva\b",
        r"\beyelid\b", r"\bauricle\b", r"\bpinna\b", r"\btympanic\b",
        r"\bsemicircular\b", r"\beustachian\b", r"\bvestibular\b",
        r"\bmalleus\b", r"\bincus\b", r"\bstapes\b", r"canaliculus",
        r"nasolacrimal", r"tarsal plate", r"tendinous ring",
    ]),
    ("skin", [
        r"\bskin\b", r"\bintegument\b", r"eyebrow", r"\bhair\b", r"\blip\b",
    ]),
    ("skeleton", [
        r"\bbone(s)?\b", r"\bskull\b", r"\bcranium\b", r"\bmandible\b",
        r"\bvertebra", r"\brib(s)?\b", r"\bsternum\b", r"\bpelv",
        r"\bfemur\b", r"\bfibula\b", r"\btibia\b", r"\bhumerus\b",
        r"\bradius\b", r"\bulna\b", r"\bphalanx\b", r"\bphalanges\b",
        r"\bcarpal\b", r"\btarsal\b", r"\bclavicle\b", r"\bscapula\b",
        r"\bpatella\b", r"\bsacrum\b", r"\bcoccyx\b", r"\bteeth\b",
        r"\btooth\b", r"\bcartilage\b", r"\bligament\b", r"intervertebral",
        r"\bdisk\b", r"\bforamen\b", r"hyoid bone", r"\bvomer\b",
        r"\bxiphoid\b", r"\bmanubrium\b", r"\bsesamoid\b", r"\bsuture\b",
        r"\bcondyle\b", r"\btrochanter\b", r"\btuberosity\b", r"\btubercle\b",
        r"\bcrest\b", r"\bfossa\b", r"\bmembrane\b", r"\bjoint\b",
        r"\barticular\b", r"calcaneus", r"\btalus\b", r"capitate",
        r"\bhamate\b", r"\blunate\b", r"pisiform", r"scaphoid",
        r"trapezium", r"trapezoid", r"triquetral", r"maxilla", r"ethmoid",
        r"\batlas\b", r"\baxis\b", r"\bcuneiform\b",
    ]),
    ("reproductive", [
        r"\btestis\b", r"\btestes\b", r"\bpenis\b", r"\bpenile\b",
        r"epididymis", r"\bprostate\b", r"corpus cavernosum",
        r"corpus spongiosum", r"\bglans\b", r"\bscrot",
        r"deferent duct", r"seminal vesicle",
    ]),
]

compiled = [(s, [re.compile(p, re.I) for p in pats]) for s, pats in RULES]

def classify(name):
    for sistem, pats in compiled:
        for p in pats:
            if p.search(name):
                return sistem, p.pattern
    return "lainnya", None

def resolve_name(rec):
    """Nama kosong -> fallback ke nama M-pair (mirror)."""
    if rec["name_en"].strip():
        return rec["name_en"], None
    stem = rec["file"][:-4]
    pair = (stem + "M") if not stem.endswith("M") else stem[:-1]
    pr = by_file.get(pair + ".obj")
    if pr and pr["name_en"].strip():
        return pr["name_en"], pair + ".obj"
    return "", None

result, per_system, debug, resolved = {}, Counter(), {}, {}
for r in inv:
    name, src = resolve_name(r)
    s, pat = classify(name) if name else ("lainnya", None)
    result[r["file"]] = s
    per_system[s] += 1
    debug[r["file"]] = pat
    if src:
        resolved[r["file"]] = {"used_name": name, "from_pair": src}

with open(BASE / "models/classification.json", "w") as f:
    json.dump({"file_to_system": result, "counts": dict(per_system),
               "matched_rule": debug, "resolved_empty_names": resolved}, f, indent=1)

print(f"Total: {sum(per_system.values())}")
for s, c in per_system.most_common():
    print(f"  {c:5d}  {s}")
print(f"\nLainnya = {per_system['lainnya']} ({100*per_system['lainnya']/2234:.2f}%)")
print(f"Empty names resolved via M-pair: {len(resolved)}")
print("\n--- SISA LAINNYA ---")
for r in inv:
    if result[r["file"]] == "lainnya":
        nm = r["name_en"] or f"(empty; pair={resolved.get(r['file'],{}).get('used_name','?')})"
        print(f"  {r['file']}: {nm}")
