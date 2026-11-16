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

## ✨ Architectural Layout & Motion Design

### 1. Two-Column Split Academic Architecture
- **Sticky Left Profile Card**:
  - Circular avatar using `ZUN.png` with subtle glowing teal borders.
  - Active status pills (`DVM Student (L-4, S-2)`, `One Health & AMR Researcher`, `Computational Biologist`).
  - Large serif/modern title **`Md. Nafizur Rahman`**, academic affiliation, and click-to-copy email.
  - 2-Column interactive grid of clickable profile buttons (**View CV**, **Google Scholar**, **ORCID**, **LinkedIn**, **OSF**, **ResearchGate**, **GitHub**, **WhatsApp**, **Google Sites**).
  - Floating quick-access PDF/CV button anchored at the bottom-right corner linking directly to Google Drive CV.
- **Right Scrollable Feed**:
  - **Auto-Scrolling "Recent Updates" Vertical Ticker**: Continuous smooth upward loop of recent research milestones, publication acceptances, and software releases (pauses on hover).
  - **About & Verbatim Google Sites Bio**: Complete verbatim text preserved from Google Sites and `CV_Nafiz.pdf`.
  - **Research Experience & Software Timeline**: Detailed milestone cards with expandable `"See all"` toggle, paired with a **4-Column KPI Metrics Bar** (`4+ Research Papers`, `6+ Software & Web Apps`, `10+ Certifications`, `2+ Yrs Field & Clinical Exp.`).
  - **Technical Capabilities (2-Column Split Cards)**:
    - *Left Card (Blue top accent)*: Veterinary Clinical, Wet-Lab & Field Epidemiology.
    - *Right Card (Teal top accent)*: Computational, Bioinformatics & Software Development.
  - **Publications & Manuscripts**:
    - Real-time search bar (`Search title, topic, author, or DOI...`).
    - Filter tabs (`All`, `OSF Registered`, `Accepted / Published`, `Ongoing`).
    - Clickable DOI & Google Scholar badges.
  - **Training & Certification**: 3-Column card grid featuring **`...more`** detail modals and **`Credentials`** Lightbox viewers.
  - **Fieldwork & Media Gallery**: Filter tabs paired with a **smooth horizontal auto-scrolling marquee/carousel** (pauses on hover and opens full-screen Lightbox).
  - **Leadership & Affiliations**: Cards with blue accent borders (RUAWA, SWAN, ZSA, RUHERF, RURS).
  - **Academic References & Contact Badges**: Supervisory references and verified contact pills.

---

## 🔒 Security Architecture & No-Code GitHub Auto-Sync CMS

This portfolio features a built-in, client-side **Admin Content Manager Drawer** accessible via the subtle lock icon (`🔒 Admin Portal`) in the footer.

### Security Principles:
1. **Zero Secret Exposure**: No GitHub Personal Access Tokens (PATs), passwords, or API keys are hardcoded in `index.html`, `js/app.js`, `data/portfolio-data.json`, or Git history.
2. **Web Crypto SHA-256 Authentication**:
   - The user configures a personal admin passcode on first launch.
   - The passcode is hashed via `crypto.subtle.digest('SHA-256', ...)` and stored in browser `localStorage`.
   - Subsequent logins verify the SHA-256 hash at runtime; plaintext passcodes are never retained.
3. **Isolated GitHub Token Storage**:
   - The user's GitHub Fine-Grained Personal Access Token (PAT) is entered into a masked `type="password"` field.
   - It is stored strictly in the user's browser `localStorage` and used exclusively to communicate with the official `https://api.github.com` endpoint.
   - A single-click **"Logout"** button wipes all credentials from browser memory.

### No-Code Auto-Sync Workflow:
- **Full Data-Driven Core**: Everything on the website is read dynamically from [`data/portfolio-data.json`](./data/portfolio-data.json).
- **Direct File Uploads**: Upload images, certificates, or PDFs directly from device. The CMS automatically base64-encodes them and stages them for `assets/images/` or `assets/docs/`.
- **Automatic GitHub Commit**: Clicking **"Save & Publish"** uses the **GitHub REST Contents API** (`PUT /repos/mdnafizurrahman8024/mdnafizurrahman8024.github.io/contents/...`) to commit the uploaded files and updated JSON straight to the `main` branch. GitHub Pages builds and updates the live site in 1–2 minutes!

---

## 📂 Repository File Structure

```text
mdnafizurrahman8024.github.io/
├── index.html                   # Two-column split layout SPA structure
├── Banner.png                   # University of Rajshahi collage hero banner
├── ZUN.png                      # Primary circular portrait avatar
├── CV_Nafiz.pdf                 # Local official curriculum vitae
├── css/
│   └── style.css                # Deep Teal & Slate academic design system, tickers & marquee
├── js/
│   └── app.js                   # Dynamic renderer, live search, marquee, lightbox & GitHub CMS
├── data/
│   └── portfolio-data.json      # Structured data driving all portfolio sections
├── assets/
│   ├── images/
│   │   ├── ZUN.png              # Portrait photo
│   │   ├── profile-nafiz.png    # High-resolution circular profile photo
│   │   ├── poultrymedix-logo.png
│   │   ├── zunsync-logo.png
│   │   ├── zsa-logo.png
│   │   └── professors-vet-logo.png
│   └── docs/
│       └── CV_Nafiz.pdf         # Local copy of academic CV
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

*Engineered with precision for Md. Nafizur Rahman — Advancing Veterinary Medicine & One Health.*
