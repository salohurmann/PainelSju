import os
import base64
import subprocess

BRAIN_DIR = r"C:\Users\Usuario\.gemini\antigravity\brain\8d5b92f5-e49a-49ec-b987-2bfe249d6d1b"
OUTPUT_DIR = r"C:\Users\Usuario\.gemini\antigravity\scratch\portal-gestao-integrada\relatorios"
TEMPLATE_PATH = os.path.join(OUTPUT_DIR, "dossie_template.html")
HTML_PATH = os.path.join(OUTPUT_DIR, "dossie_executivo_justica_2_0.html")
PDF_PATH = os.path.join(OUTPUT_DIR, "Dossie_Executivo_Justica_2_0_SEJU_PR.pdf")
BRAIN_PDF_PATH = os.path.join(BRAIN_DIR, "Dossie_Executivo_Justica_2_0_SEJU_PR.pdf")

def img_to_b64(filename):
    path = os.path.join(BRAIN_DIR, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

print("Lendo template HTML...")
with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

print("Carregando e codificando capturas de tela...")
content = content.replace("{{IMG_HOME}}", img_to_b64("print_home.png"))
content = content.replace("{{IMG_FROTA}}", img_to_b64("print_frota.png"))
content = content.replace("{{IMG_CENSE}}", img_to_b64("print_cense.png"))
content = content.replace("{{IMG_DIARIAS}}", img_to_b64("print_diarias.png"))
content = content.replace("{{IMG_CHAMADOS}}", img_to_b64("print_chamados.png"))
content = content.replace("{{IMG_SALAS}}", img_to_b64("print_salas.png"))
content = content.replace("{{IMG_AUDITORIA}}", img_to_b64("print_auditoria.png"))

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print(f"HTML final gerado: {HTML_PATH}")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome_path,
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    "--print-to-pdf-no-header",
    f"--print-to-pdf={PDF_PATH}",
    HTML_PATH
]

print("Invocando Chrome para compilação do PDF...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f"PDF gerado com sucesso: {PDF_PATH}")
    with open(PDF_PATH, "rb") as src, open(BRAIN_PDF_PATH, "wb") as dst:
        dst.write(src.read())
    print(f"Cópia no diretório de artefatos salva: {BRAIN_PDF_PATH}")
    pdf_size = os.path.getsize(PDF_PATH)
    print(f"Tamanho do PDF: {pdf_size / 1024:.1f} KB")
else:
    print(f"Erro na execução do Chrome: {res.stderr}")
