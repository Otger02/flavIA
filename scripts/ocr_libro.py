"""
OCR script para libros escaneados de Flavia
Uso: python ocr_libro.py <ruta_al_pdf>

Procesa un PDF escaneado y extrae el texto a un archivo .txt
Optimizado para libros en español. Tarda aprox. 15 segundos por página.

Requisitos:
  - Python 3.8+
  - Tesseract OCR con paquete de español
  - pip install pdf2image pytesseract
  - Poppler (para pdf2image)

Instalación rápida en Windows:
  1. Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
     - Durante la instalación marca "Spanish" en languages
     - Anota la ruta de instalación (normalmente C:\\Program Files\\Tesseract-OCR)
  2. Poppler: https://github.com/oschwartz10612/poppler-windows/releases
     - Descarga el zip, extrae, anota la ruta del bin/
  3. pip install pdf2image pytesseract
"""

import sys
import os
import time
from pathlib import Path

# ============ CONFIGURACIÓN — AJUSTA ESTAS RUTAS EN WINDOWS ============
# Si estás en Windows, descomenta y ajusta:
# TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# POPPLER_PATH = r"C:\poppler\poppler-XX.XX.X\Library\bin"

# En Mac/Linux normalmente no hace falta tocar nada
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\Users\otger\OneDrive\Escritorio\Release-25.12.0-0\poppler-25.12.0\Library\bin"
# =====================================================================

try:
    from pdf2image import convert_from_path
    import pytesseract
except ImportError:
    print("ERROR: Faltan dependencias. Ejecuta:")
    print("  pip install pdf2image pytesseract")
    sys.exit(1)

if TESSERACT_PATH:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def ocr_pdf(pdf_path: str, batch_size: int = 20, dpi: int = 200):
    """
    OCR un PDF entero, procesando en batches para no agotar memoria.
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        print(f"ERROR: No encuentro el archivo {pdf_path}")
        sys.exit(1)

    output_path = pdf_path.with_suffix(".txt")
    
    # Detectar número de páginas
    try:
        from pdf2image.pdf2image import pdfinfo_from_path
        info_kwargs = {"poppler_path": POPPLER_PATH} if POPPLER_PATH else {}
        info = pdfinfo_from_path(str(pdf_path), **info_kwargs)
        total_pages = info["Pages"]
    except Exception as e:
        print(f"ERROR detectando páginas: {e}")
        print("¿Tienes Poppler instalado y en el PATH (o configurado arriba)?")
        sys.exit(1)
    
    print(f"PDF: {pdf_path.name}")
    print(f"Páginas: {total_pages}")
    print(f"Tiempo estimado: {total_pages * 15 // 60} min")
    print(f"Salida: {output_path}")
    print()
    
    t_total = time.time()
    pages_processed = 0
    
    with open(output_path, "w", encoding="utf-8") as out:
        out.write(f"# OCR de {pdf_path.name}\n")
        out.write(f"# Procesado: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        for batch_start in range(1, total_pages + 1, batch_size):
            batch_end = min(batch_start + batch_size - 1, total_pages)
            t0 = time.time()
            
            convert_kwargs = {
                "first_page": batch_start,
                "last_page": batch_end,
                "dpi": dpi,
            }
            if POPPLER_PATH:
                convert_kwargs["poppler_path"] = POPPLER_PATH
            
            try:
                images = convert_from_path(str(pdf_path), **convert_kwargs)
            except Exception as e:
                print(f"ERROR convirtiendo páginas {batch_start}-{batch_end}: {e}")
                continue
            
            for i, image in enumerate(images):
                page_num = batch_start + i
                try:
                    text = pytesseract.image_to_string(image, lang="spa")
                except Exception as e:
                    text = f"[ERROR OCR: {e}]"
                
                out.write(f"\n=== PÁGINA {page_num} ===\n")
                out.write(text)
                out.write("\n")
                pages_processed += 1
            
            out.flush()
            
            t_batch = time.time() - t0
            t_elapsed = time.time() - t_total
            t_remaining = (t_elapsed / pages_processed) * (total_pages - pages_processed)
            
            print(
                f"Páginas {batch_start:3}-{batch_end:3}  "
                f"({pages_processed}/{total_pages})  "
                f"batch {t_batch:.0f}s  "
                f"resto ~{t_remaining/60:.1f} min"
            )
    
    t_total_done = time.time() - t_total
    print()
    print(f"Listo. {pages_processed} páginas procesadas en {t_total_done/60:.1f} min")
    print(f"Texto guardado en: {output_path}")
    print(f"Tamaño: {output_path.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python ocr_libro.py <ruta_al_pdf>")
        print()
        print("Ejemplo: python ocr_libro.py libro_sexo_sin_misterios.pdf")
        sys.exit(1)
    
    ocr_pdf(sys.argv[1])
