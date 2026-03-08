import fitz  # PyMuPDF
import os

pdf_path = r"e:\Services Images\AI Football Website Frontend\Frontend UIUX.pdf"
output_dir = r"e:\Services Images\AI Football Website Frontend\design_images"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)  # High resolution for UI review
    image_path = os.path.join(output_dir, f"page_{i+1}.png")
    pix.save(image_path)
    print(f"Saved {image_path}")
