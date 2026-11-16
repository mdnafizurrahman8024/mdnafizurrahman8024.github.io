# 🧬 Md. Nafizur Rahman — Academic & Research Portfolio

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Active_Deployment-0d9488?style=for-the-badge&logo=github&logoColor=white)](https://mdnafizurrahman8024.github.io/)
[![Doctor of Veterinary Medicine](https://img.shields.io/badge/DVM-University_of_Rajshahi-14b8a6?style=for-the-badge&logo=academia&logoColor=white)](https://www.ru.ac.bd/)
[![One Health & AMR](https://img.shields.io/badge/One_Health-AMR_Surveillance-0284c7?style=for-the-badge&logo=shield&logoColor=white)](#)
[![OSF Registered Protocol](https://img.shields.io/badge/OSF_DOI-10.17605%2FOSF.IO%2F9AQS3-purple?style=for-the-badge&logo=open-access&logoColor=white)](https://doi.org/10.17605/OSF.IO/9AQS3)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](./LICENSE)

> **"Knowledge. Investigation. Practice. Impact."**  
> Official academic, clinical, and computational research portfolio of **Md. Nafizur Rahman**, Doctor of Veterinary Medicine (DVM) student at the Faculty of Veterinary and Animal Sciences, University of Rajshahi, Bangladesh.

🌐 **Live Website**: [https://mdnafizurrahman8024.github.io](https://mdnafizurrahman8024.github.io)

---

## 🏛️ Academic Profile & Designation

- **Name**: Md. Nafizur Rahman
- **Designation**: Undergraduate Student, Level-4 Semester-2, Doctor of Veterinary Medicine (DVM)
- **Institution**: Faculty of Veterinary and Animal Sciences, University of Rajshahi, Rajshahi-6205, Bangladesh
- **Core Research Domains**:
  - 🔬 **Antimicrobial Resistance (AMR) & Veterinary Prescribing Surveillance** (One Health Framework)
  - 🧬 **Nanomedicine & Reverse Vaccinology** (Preclinical Meta-Analysis of Rabies Nanovaccines)
  - 🦟 **Parasitology & Vector-Borne Epidemiology** (Barind Tract Ectoparasites, *Cimex spp.*, *Capillaria spp.*)
  - 💻 **HealthTech, Telemedicine & AI Diagnostics** (PoultryMedix, ZunSync, ZSA, Professor's Vet & Pet Care)

---

## ✨ Architectural Highlights & Features

### 1. Tailored Academic UI/UX & Glassmorphism
- **Design Tokens**: Refined Deep Teal (`#0d9488`, `#14b8a6`) & Midnight Slate academic palette evoking biological precision, sterile clinical environments, and computational rigor.
- **Theme Switcher**: Instant Dark/Light mode toggle with local preference persistence (`localStorage`) and zero flash-of-unstyled-content (FOUC).
- **Responsive & Accessible**: Semantic HTML5, CSS Grid/Flexbox, fluid typography (`Space Grotesk`, `Inter`, `JetBrains Mono`), and FontAwesome 6 icons.
- **Interactive Lightbox**: Full-screen preview modal supporting high-resolution macro photography, embedded videos (YouTube/Drive/HTML5), and direct PDF previews with download triggers.

### 2. Verified Research & Publications
- **Nanoparticle-Based Rabies Vaccines in Mice**: Systematic Review & Meta-Analysis registered on the Open Science Framework ([DOI: 10.17605/OSF.IO/9AQS3](https://doi.org/10.17605/OSF.IO/9AQS3)).
- **Companion Animal Antimicrobial Stewardship**: 12-month clinical prescribing surveillance, owner KAP, and self-medication study in Rajshahi.
- **Ectoparasites in Free-Roaming Dogs**: 310 dogs sampled, 2,908 ectoparasites classified, first records of *Ctenocephalides orientis* and *Heterodoxus spiniger* in Bangladesh, with COX1/18S rRNA sequencing.
- **Socio-Veterinary Determinants of Pet Healthcare**: Accepted for publication in the **Journal of Advanced Veterinary and Animal Research (JAVAR)**.
- **Bedbug (*Cimex spp.*) Infestation Dynamics**: 370-bed student residence survey at the University of Rajshahi.

### 3. Software & Digital Platforms
- **[PoultryMedix](https://github.com/mdnafizurrahman8024/PoultryMedix-Application)**: Autonomous multimodal AI for avian health, OCR prescription scanning, RAG-powered AMR withdrawal alerts, and GPS outbreak heatmaps.
- **[ZunSync (Evidentara)](https://github.com/mdnafizurrahman8024/ZunSync-Software)**: Reproducible AI research platform for veterinary medicine, epidemiology, and molecular analytics.
- **[Zun Synthesis Academy (ZSA)](https://github.com/mdnafizurrahman8024/Zun-Synthesis-Academy-Website)**: FastAPI ed-tech platform bridging life sciences and code.
- **[Professor's Vet & Pet Care](https://github.com/mdnafizurrahman8024/Professors-Vet-And-Pet-Care-Website)**: Production Django veterinary clinic platform supervised by Dr. Abdulla Al Mamun Bhuyan.
- **[Python Foundation 21 Days](https://github.com/mdnafizurrahman8024/Python-Foundation-21-Days)**: 21-day structured computational bootcamp covering Python OOP, automation, and data analytics.

---

## 🔒 Security Architecture & No-Code GitHub Auto-Sync CMS

This portfolio features a built-in, client-side **Admin Content Manager Drawer** accessible via the subtle lock icon (`🔒`) in the footer.

### Security Principles:
1. **Zero Secret Exposure**: No GitHub Personal Access Tokens (PATs), passwords, or API keys are hardcoded in `index.html`, `js/app.js`, `data/portfolio-data.json`, or Git history.
2. **Web Crypto SHA-256 Authentication**:
   - The user configures a personal admin passcode on first launch.
   - The passcode is hashed via `crypto.subtle.digest('SHA-256', ...)` and stored in browser `localStorage`.
   - Subsequent logins verify the SHA-256 hash at runtime; plaintext passcodes are never retained.
3. **Isolated GitHub Token Storage**:
   - The user's GitHub Fine-Grained Personal Access Token (PAT) is entered into a masked `type="password"` field.
   - It is stored strictly in the user's browser `localStorage` and used exclusively to communicate with the official `https://api.github.com` endpoint.
   - A single-click **"Logout & Clear Token"** button wipes all credentials from browser memory.

### No-Code Auto-Sync Workflow:
- **Full Data-Driven Core**: Everything on the website is read dynamically from [`data/portfolio-data.json`](./data/portfolio-data.json).
- **In-Browser Editing**: Update biography, research projects, publications, software cards, and links without touching code.
- **Direct File Uploads**: Upload images, certificates, or PDFs directly from device. The CMS automatically base64-encodes them and stages them for `assets/images/` or `assets/docs/`.
- **Automatic GitHub Commit**: Clicking **"Save & Publish"** uses the **GitHub REST Contents API** (`PUT /repos/mdnafizurrahman8024/mdnafizurrahman8024.github.io/contents/...`) to commit the uploaded files and updated JSON straight to the `main` branch. GitHub Pages builds and updates the live site in 1–2 minutes!

---

## 📂 Repository File Structure

```text
mdnafizurrahman8024.github.io/
├── index.html                   # Semantic HTML5 single-page application structure
├── Banner.png                   # University of Rajshahi collage hero banner
├── CV_Nafiz.pdf                 # Local official curriculum vitae
├── css/
│   └── style.css                # Deep Teal & Slate academic design system & glassmorphism
├── js/
│   └── app.js                   # Theme controller, dynamic renderer, lightbox & GitHub CMS
├── data/
│   └── portfolio-data.json      # Structured data driving all portfolio sections
├── assets/
│   ├── images/
│   │   ├── profile-nafiz.png    # High-resolution circular profile photo
│   │   ├── poultrymedix-logo.png
│   │   ├── zunsync-logo.png
│   │   ├── zsa-logo.png
│   │   └── professors-vet-logo.png
│   └── docs/
│       └── CV_Nafiz.pdf         # Local repository backup of academic CV
└── README.md                    # Technical documentation & architecture guide
```

---

## 🔗 Verified Academic & Professional Profiles

- **Online CV (Google Drive)**: [View / Download PDF](https://drive.google.com/file/d/1qGu8YABYXTTt2kRaoz-ByAeOz3GHP7-7/view?usp=drive_link)
- **Google Scholar**: [Md. Nafizur Rahman](https://scholar.google.com/citations?user=bImpEzMAAAAJ&hl=en)
- **ORCID**: [0009-0008-3918-187X](https://orcid.org/0009-0008-3918-187X)
- **ResearchGate**: [Md-Rahman-1097](https://www.researchgate.net/profile/Md-Rahman-1097)
- **Open Science Framework (OSF)**: [DOI: 10.17605/OSF.IO/9AQS3](https://doi.org/10.17605/OSF.IO/9AQS3)
- **GitHub**: [@mdnafizurrahman8024](https://github.com/mdnafizurrahman8024)
- **LinkedIn**: [md-nafizur-rahman-ru](http://www.linkedin.com/in/md-nafizur-rahman-ru)
- **Primary Email**: [mdnafizurrahman8024@gmail.com](mailto:mdnafizurrahman8024@gmail.com)
- **University Email**: [s2210968138@ru.ac.bd](mailto:s2210968138@ru.ac.bd)
- **Cell / WhatsApp**: [+8801849288024](https://wa.me/8801849288024)
- **Facebook**: [mdnafizurrahman8024](https://www.facebook.com/mdnafizurrahman8024/)
- **Instagram**: [@nafizun_8024](https://www.instagram.com/nafizun_8024?stkn=MWcyemViZThoNDU0bQ==)
- **Original Google Sites Portfolio**: [sites.google.com/view/md-nafizur-rahman/home](https://sites.google.com/view/md-nafizur-rahman/home)

---

## 💻 Local Preview & Verification

To run and preview the portfolio locally:

```bash
# Using Python built-in HTTP server
python -m http.server 8000

# Open in browser:
# http://localhost:8000
```

---

*Engineered with precision for Md. Nafizur Rahman — Advancing Veterinary Medicine & One Health.*
