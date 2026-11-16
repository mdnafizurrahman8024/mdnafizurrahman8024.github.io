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

### 1. Right-Column Top Cover Banner (`Banner.png` — Zero Cropping)
- Placed directly at the top of the right scrollable content column, seamlessly aligning width with feed cards.
- Displays every word from `"University of Rajshahi, Bangladesh"` down to `"Knowledge. Investigation. Practice. Impact."` with 100% full visibility and zero cropping across desktop and mobile.

### 2. Two-Column Split Academic Architecture (Reference Aligned)
- **Left Sticky Profile Card (`position: sticky; top: 82px; width: 310px;`)**:
  - Compact height engineered to fit completely inside a standard 720p laptop screen without clipping.
  - Rich dark navy-to-deep-teal gradient (`linear-gradient(165deg, #07192f 0%, #0b3948 55%, #0e4f55 100%)`) with rounded corners (`20px`).
  - Rounded-square portrait avatar using `ZUN.png` (`width: 175px; height: 190px; border-radius: 16px; border: 2px solid #38bdf8;`).
  - Compact status pills: `DVM Student (L-4, S-2)` and `One Health & AMR`.
  - Serif name: **`Md. Nafizur Rahman`**.
  - Role & Affiliation: *Undergraduate Student, Dept. of Veterinary and Animal Sciences, University of Rajshahi, Rajshahi-6205, Bangladesh*.
  - Clickable email: `mdnafizurrahman8024@gmail.com`.
  - Compact 3-row micro-badges grid (`padding: 5px 9px; font-size: 11px; border-radius: 6px;`) for all 11 verified links:
    - **View CV** (Google Drive Direct Link)
    - **Google Scholar**
    - **ORCID**
    - **LinkedIn**
    - **OSF**
    - **ResearchGate**
    - **GitHub**
    - **Google Sites**
    - **WhatsApp**
    - **Facebook**
    - **Instagram**
  - Floating quick-access PDF/CV button anchored at the bottom-right corner.

- **Right Scrollable Content Column (Exact Sequence)**:
  1. **Top Cover Banner (`Banner.png`)**: Full width of the right column with zero cropping.
  2. **"Hi, This is Nafiz"**: Serif heading with divider line and verbatim Google Sites & CV bio.
  3. **Academic Credentials & Education**: Timeline dots covering DVM, HSC, and SSC.
  4. **Research Experience & Software Projects**: Timeline cards + `"See all"` toggle + **4-Column KPI Bar** (`4+ Research Papers`, `6+ Software & Apps`, `10+ Certifications`, `2+ Yrs Field & Clinical Exp.`).
  5. **Technical Capabilities (2-Column Split)**:
     - Left: Veterinary Clinical, Wet-Lab & Field Epidemiology.
     - Right: Computational, Bioinformatics & Software Development.
  6. **Publications & Manuscripts**: Real-time live search bar + status filter pills (`All Manuscripts`, `OSF Registered`, `Published / Accepted`, `Ongoing`) + clickable DOI badges ([DOI: 10.17605/OSF.IO/9AQS3](https://doi.org/10.17605/OSF.IO/9AQS3)).
  7. **Training & Certification (26 Verified Certificate Cards)**:
     - 3-Column grid with gold/amber top accents.
     - Auto-imports all 26 certificate images from `Certificate/` (WHO, WOAH, United Nations, AMMnet, NVDC/FAO, etc.).
     - Clickable **`...more`** button: opens full modal with detailed syllabus and context.
     - Clickable **`Credentials`** button: opens full-resolution certificate image in Lightbox viewer with zoom and download.
  8. **Fieldwork & Media Gallery**: Filter pills + smooth horizontal auto-moving marquee with Lightbox viewer.
  9. **Recent Updates**: Smooth vertical auto-scrolling ticker card.
  10. **Extra-Curricular Activities & Leadership**: Co-curricular initiatives with blue accent borders.
  11. **Academic References**: Mentors and supervisors in 2-column cards.
  12. **Contact Me**: Form card with 3px solid royal-blue top border, light-gray inputs, Send Message mailto pre-fill, direct email, and compact social/academic pills.

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
- **Direct File Uploads**: Upload images, certificates, or PDFs directly from device. The CMS automatically base64-encodes them and stages them for `Certificate/`, `assets/images/`, or `assets/docs/`.
- **Automatic GitHub Commit**: Clicking **"Save & Publish"** uses the **GitHub REST Contents API** (`PUT /repos/mdnafizurrahman8024/mdnafizurrahman8024.github.io/contents/...`) to commit the uploaded files and updated JSON straight to the `main` branch. GitHub Pages builds and updates the live site in 1–2 minutes!

---

## 📂 Repository File Structure

```text
mdnafizurrahman8024.github.io/
├── index.html                   # Reference-aligned split layout SPA structure
├── Banner.png                   # Framed University of Rajshahi collage hero banner
├── ZUN.png                      # Primary portrait avatar
├── CV_Nafiz.pdf                 # Local official curriculum vitae
├── Certificate/                 # 26 Verified credential images from WHO, WOAH, UN, RU
├── css/
│   └── style.css                # Reference design system, gradient card, tickers & marquee
├── js/
│   └── app.js                   # Dynamic renderer, live search, certificate modals & GitHub CMS
├── data/
│   └── portfolio-data.json      # Structured database driving all portfolio sections
├── assets/
│   ├── images/                  # Profile & software logos
│   └── docs/                    # Local documents backup
└── README.md                    # Technical documentation & architecture guide
```

---

*Engineered with precision for Md. Nafizur Rahman — Advancing Veterinary Medicine & One Health.*
