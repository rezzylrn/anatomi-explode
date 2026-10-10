# CLASSIFICATION — ANATOMI v2 (Human Atlas 3D)

Aturan klasifikasi 2.234 mesh BodyParts3D 4.0 ke 12 sistem organ + `lainnya`.
Implementasi: `v2/classify.py`. Output: `v2/models/classification.json`.

## Metode
- Keyword matching case-insensitive terhadap **English name** dari header OBJ.
- **First-match-wins** sesuai urutan sistem di bawah (urutan = prioritas).
- 17 file dengan English name kosong memakai nama M-pair-nya (mirror), tercatat di
  `resolved_empty_names` pada classification.json.

## Urutan sistem & keyword (regex)

1. **arteries** — `\barter(y|ies|ial)\b`, `\baorta\b`, `\barteria\b`,
   `\btrunk\b(?!.*\bvein)`, `\b(palmar|plantar) arch\b`
2. **veins** — `\bvein(s)?\b`, `\bvenous\b`, `\bvena\b`
3. **nervous_system** — nerve(s), brain, cerebr(um|al), cerebell, spinal cord,
   medulla, neuron, ganglion, gyrus, white/gray matter, fornix, hypothalamus,
   hippocampus, thalamus, midbrain, pons, choroid plexus, cerebral aqueduct,
   lateral/third/fourth ventricle, interventricular foramen, interpeduncular,
   commissure, colliculus, brachium of, corpus callosum, habenula, insula,
   internal capsule, amygdala, caudate nucleus, globus pallidus, putamen,
   lamina terminalis, tuber cinereum, mammillary, geniculate, stria, tentorium,
   telencephalon, lobule, (occipital|parietal|frontal|temporal) lobe
4. **urinary** — kidney(s), ureter(s), urethr(a|al), renal (`\brenal\b`, tidak
   match "adrenal"), `(?<!gall)bladder` (tidak match "gallbladder")
5. **respiratory** — frasa kartilago laring/hidung (arytenoid|cricoid|thyroid|
   cuneiform|corniculate cartilage, nasal|alar cartilage, thyrohyoid membrane,
   nasal concha), vocal, conus elasticus, lung(s), bronch, trachea, alveol,
   diaphragm, pleura, nasal, larynx, laryngeal, epiglottis, phrenic
6. **digestive** — liver, hepatic, stomach, gastric, intestin, esophag, pancrea,
   gallbladder, colon, colic, rectum, rectal, tongue, salivary, pharyn,
   appendix, duodenum, jejunum, ileum, ileocecal, mesentery, biliary, bile,
   cecum, cecal, gingiva, uvula (`\buvula\b`), peritoneum, omentum, sphincter,
   sublingual, submandibular, hepatic/cystic duct, taenia, mesoappendix,
   mesocolon, hepatovenous
7. **heart** — heart, cardiac, atri(um|al), ventricle, valve, cusp, leaflet,
   coronary, papillary
8. **muscles** — muscle, musculus, flexor, extensor, abductor, adductor,
   pronator, supinator, longus, brevis/breves, magnus, maximus, medius,
   minimus/minimi, major, minor, capitis, cervicis, thoracis, lumborum,
   digitorum, pollicis, hallucis, digiti, carpi, brachii, brachialis, gluteus,
   deltoid(?! ligament), pectoralis, trapezius, rhomboid, serratus, scalenus,
   splenius, semispinalis, spinalis, interspinal, levator(es), lumbrical,
   interosseous(?! membrane), interossei, teres, oblique, rectus, tendon,
   psoas, sartorius, gracilis, soleus, gastrocnemius, biceps, triceps,
   sternocleidomastoid, iliacus, piriformis, obturator, gemellus, quadratus,
   vastus, tibialis, fibularis, mentalis, platysma, cricothyroid(?! ligament),
   arytenoid, (genio|mylo|omo|sterno|stylo|thyro)hyoid(?! ligament),
   pectineus, plantaris, popliteus, semimembranosus, semitendinosus,
   coccygeus, iliococcygeus, pubococcygeus, puborectalis, subclavius,
   anconeus, brachioradialis, subscapularis, supraspinatus, digastric,
   sternothyroid, intertransvers, rotator, genioglossus, hyoglossus,
   palatopharyngeus, salpingopharyngeus, stylopharyngeus, aryepiglotticus,
   vocalis, tensor veli palatini, tensor fasciae latae
9. **sensory_organs** — eye(s), eyeball, ear(s), optic, retina, cochle,
   lacrimal(?! bone), choroid, ciliary, ciliaris, cornea, iris, lens, sclera,
   vitreous, conjunctiva, eyelid, auricle, pinna, tympanic, semicircular,
   eustachian, vestibular, malleus, incus, stapes, canaliculus, nasolacrimal,
   tarsal plate, tendinous ring
10. **skin** — skin, integument, eyebrow, hair, lip (`\blip\b`)
11. **skeleton** — bone(s), skull, cranium, mandible, vertebra, rib(s),
    sternum, pelv, femur, fibula, tibia, humerus, radius, ulna, phalanx,
    phalanges, carpal, tarsal, clavicle, scapula, patella, sacrum, coccyx,
    teeth, tooth, cartilage, ligament, intervertebral, disk, foramen,
    hyoid bone, vomer, xiphoid, manubrium, sesamoid, suture, condyle,
    trochanter, tuberosity, tubercle, crest, fossa, membrane, joint,
    articular, calcaneus, talus, capitate, hamate, lunate, pisiform,
    scaphoid, trapezium, trapezoid, triquetral, maxilla, ethmoid, atlas,
    axis, cuneiform
12. **reproductive** — testis, testes, penis, penile, epididymis, prostate,
    corpus cavernosum, corpus spongiosum, glans, scrot, deferent duct,
    seminal vesicle
13. **lainnya** — sisa (target <5%)

## Hasil akhir

| Sistem | Jumlah |
|---|---|
| arteries | 639 |
| muscles | 430 |
| veins | 394 |
| skeleton | 281 |
| nervous_system | 142 |
| respiratory | 127 |
| digestive | 119 |
| sensory_organs | 43 |
| heart | 24 |
| reproductive | 12 |
| urinary | 6 |
| skin | 5 |
| **lainnya** | **12 (0.54%)** |
| **TOTAL** | **2234** |

## Keputusan saat aturan ambigu (terdokumentasi jujur)

1. **Otot tanpa kata "muscle"**: mayoritas nama otot BP3D memakai nama Latin
   (gluteus maximus, splenius capitis, extensor digitorum). Ditangkap via
   ~80 keyword Latin otot (longus/brevis/capitis/pollicis/digitorum/…).
2. **Arteri/vena didahulukan**: "coronary artery", "renal artery", "bronchial
   artery", "phrenic vein", "dorsal artery/vein of penis" masuk arteries/veins,
   bukan heart/respiratory/reproductive.
3. **"Coronary sinus"** → heart (vena jantung), bukan veins.
4. **Ventrikel otak vs jantung**: lateral/third/fourth ventricle → nervous;
   sisanya → heart. "Posterior vein of left ventricle" → veins.
5. **Papillary muscle** → heart (otot jantung), bukan muscles.
6. **Otot ekstraokular** (superior/inferior/lateral/medial rectus, oblique) →
   muscles, bukan sensory. "Check ligament of X rectus" ikut muscles.
7. **Optic chiasm / optic tract** → sensory_organs (jalur visual), bukan nervous.
8. **Lacrimal bone** → skeleton (kata "bone" eksplisit); lacrimal lainnya →
   sensory; lacrimal nerve → nervous.
9. **Kartilago hidung/laring** (nasal/alar/cricoid/thyroid/cuneiform/
   corniculate cartilage) → respiratory, bukan skeleton.
10. **"Major alar cartilage"** → respiratory (via "alar cartilage"), bukan
    muscles (via "major").
11. **Ligamen** → skeleton, KECUALI: vocal ligament → respiratory,
    suspensory ligament of lens → sensory, "check ligament of rectus" →
    muscles, tendinous arch of levator ani → muscles.
12. **Otot ber-"hyoid"** (geniohyoid, mylohyoid, sternohyoid, …) → muscles;
    "hyoid bone" → skeleton; "stylohyoid/thyrohyoid ligament" → skeleton.
13. **Pharyngeal constrictor** → digestive (fungsi menelan), bukan muscles.
14. **"Trunk of right apical segmental vein"** → veins (lookahead
    `(?!.*\bvein)` pada rule trunk).
15. **Tendon** → muscles (calcaneal, levator palpebrae).
16. **Gingiva, uvula** → digestive; **"Uvular muscle"** → muscles
    (`\buvula\b` tidak match "uvular").
17. **Nasal bone** → skeleton (bone didahulukan); nasal lainnya → respiratory.
18. **17 file nama kosong** → diklasifikasikan memakai nama M-pair
    (mirror sisi berlawanan), tercatat di classification.json.

## Isi `lainnya` (12 file, 0.54% — sah sebagai "lainnya")
- Jaringan ikat: iliotibial tract (2), linea alba (1), pterygomandibular
  raphe (2)
- Endokrin: pineal body, pituitary gland, adrenal gland (2), thymus (2)
- Limfatik: spleen (1)
