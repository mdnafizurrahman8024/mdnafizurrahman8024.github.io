import os
import io
import json
from PIL import Image, ImageOps

def get_referenced_images(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    projects_imgs = set()
    for p in data.get('softwareProjects', []) + data.get('projects', []):
        for k in ['coverImage', 'thumbnail']:
            if p.get(k): projects_imgs.add(p[k].replace('\\', '/'))
        for img in p.get('images', []):
            if img: projects_imgs.add(img.replace('\\', '/'))

    cert_imgs = set()
    for c in data.get('certificates', []) + data.get('trainings', []):
        for k in ['image', 'practicalImage']:
            if c.get(k): cert_imgs.add(c[k].replace('\\', '/'))
        for img in c.get('practicalImages', []):
            if img: cert_imgs.add(img.replace('\\', '/'))

    return projects_imgs, cert_imgs

def optimize_file(filepath):
    """
    Optimizes a single image file in place if and only if:
    1. It can be opened and processed safely.
    2. ImageOps.exif_transpose is applied.
    3. Lanczos proportionally downscales if max(w, h) > 1600.
    4. For .jpg/.jpeg -> progressive JPEG, quality=82, optimize=True.
       For .png -> optimize=True, preserve transparency (RGBA) if present, RGB if opaque.
    5. The new file size is strictly less than original size.
    6. Verified with Image.open().verify() before completing.
    """
    if not os.path.exists(filepath):
        print(f"  [MISSING] {filepath}")
        return 0, 0, False

    orig_sz = os.path.getsize(filepath)
    ext = os.path.splitext(filepath)[1].lower()

    if ext not in ['.png', '.jpg', '.jpeg']:
        return orig_sz, orig_sz, False

    try:
        with Image.open(filepath) as img:
            img = ImageOps.exif_transpose(img)
            w, h = img.size
            max_dim = max(w, h)
            if max_dim > 1600:
                scale = 1600.0 / max_dim
                new_w = int(round(w * scale))
                new_h = int(round(h * scale))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

            buf = io.BytesIO()
            if ext in ['.jpg', '.jpeg']:
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                img.save(buf, format='JPEG', quality=82, optimize=True, progressive=True)
            elif ext == '.png':
                # Check for transparency
                if img.mode == 'RGBA':
                    extrema = img.getextrema()
                    # extrema[3] is alpha channel min, max
                    if extrema[3][0] == 255 and extrema[3][1] == 255:
                        img = img.convert('RGB')
                img.save(buf, format='PNG', optimize=True)

            new_bytes = buf.getvalue()
            new_sz = len(new_bytes)

            if new_sz < orig_sz:
                # Verify buffer first
                with Image.open(io.BytesIO(new_bytes)) as v:
                    v.verify()
                
                # Write in-place atomically
                with open(filepath, 'wb') as out_f:
                    out_f.write(new_bytes)
                
                # Verify file on disk
                with Image.open(filepath) as v_disk:
                    v_disk.verify()

                return orig_sz, new_sz, True
            else:
                return orig_sz, orig_sz, False

    except Exception as e:
        print(f"  [ERROR] {filepath}: {e}")
        return orig_sz, orig_sz, False

def process_section(name, img_paths):
    print(f"\n==========================================")
    print(f" Processing: {name}")
    print(f"==========================================")
    total_orig = 0
    total_new = 0
    optimized_count = 0

    for p in sorted(img_paths):
        # Normalize path
        norm_p = os.path.normpath(p)
        orig_s, new_s, optimized = optimize_file(norm_p)
        total_orig += orig_s
        total_new += new_s
        if optimized:
            optimized_count += 1
            print(f"  [SAVED] {norm_p}: {orig_s/1024:.1f} KB -> {new_s/1024:.1f} KB (-{((orig_s-new_s)/orig_s)*100:.1f}%)")
        else:
            print(f"  [KEPT]  {norm_p}: {orig_s/1024:.1f} KB (already optimal)")

    orig_mb = total_orig / (1024 * 1024)
    new_mb = total_new / (1024 * 1024)
    saved_mb = (total_orig - total_new) / (1024 * 1024)
    pct = ((total_orig - total_new) / total_orig * 100) if total_orig > 0 else 0

    print(f"\n--- {name} Summary ---")
    print(f"  Total Files: {len(img_paths)}")
    print(f"  Files Reduced: {optimized_count}")
    print(f"  Original Size: {orig_mb:.2f} MB")
    print(f"  Optimized Size: {new_mb:.2f} MB")
    print(f"  Net Reduction: -{saved_mb:.2f} MB (-{pct:.1f}%)")
    return orig_mb, new_mb

if __name__ == '__main__':
    json_path = 'data/portfolio-data.json'
    proj_imgs, cert_imgs = get_referenced_images(json_path)

    p_orig, p_new = process_section("Projects & Digital Platforms (Github image/)", proj_imgs)
    c_orig, c_new = process_section("Training & Certifications (Certificate/)", cert_imgs)

    print("\n==========================================")
    print(" OVERALL SUMMARY")
    print("==========================================")
    tot_orig = p_orig + c_orig
    tot_new = p_new + c_new
    print(f"Projects & Certifications Combined:")
    print(f"  Before: {tot_orig:.2f} MB")
    print(f"  After:  {tot_new:.2f} MB")
    print(f"  Total Saved: -{tot_orig - tot_new:.2f} MB (-{((tot_orig - tot_new) / tot_orig)*100:.1f}%)")
