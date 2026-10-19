import os
import subprocess

RELATORIOS_DIR = r"C:\Users\Usuario\.gemini\antigravity\scratch\portal-gestao-integrada\relatorios"
PUBLIC_DIR = r"C:\Users\Usuario\.gemini\antigravity\scratch\portal-gestao-integrada\public"
BRAIN_DIR = r"C:\Users\Usuario\.gemini\antigravity\brain\8d5b92f5-e49a-49ec-b987-2bfe249d6d1b"

HTML_PATH = os.path.join(RELATORIOS_DIR, "apf_celepar_template.html")
PDF_RELATORIOS = os.path.join(RELATORIOS_DIR, "Relatorio_Tecnico_Pontos_de_Funcao_Celepar_SEJU.pdf")
PDF_PUBLIC = os.path.join(PUBLIC_DIR, "Relatorio_Tecnico_Pontos_de_Funcao_Celepar_SEJU.pdf")
PDF_BRAIN = os.path.join(BRAIN_DIR, "Relatorio_Tecnico_Pontos_de_Funcao_Celepar_SEJU.pdf")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome_path,
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    "--print-to-pdf-no-header",
    f"--print-to-pdf={PDF_RELATORIOS}",
    HTML_PATH
]

print("Compilando Relatório Técnico de Pontos de Função via Chrome headless...")
res = subprocess.run(cmd, capture_output=True, text=True)

if res.returncode == 0:
    print(f"PDF gerado com sucesso: {PDF_RELATORIOS}")
    # Copiar para public/
    with open(PDF_RELATORIOS, "rb") as src, open(PDF_PUBLIC, "wb") as dst:
        dst.write(src.read())
    # Copiar para brain/
    with open(PDF_RELATORIOS, "rb") as src, open(PDF_BRAIN, "wb") as dst:
        dst.write(src.read())
    print("Cópias realizadas com sucesso em public/ e no diretório de artefatos!")
    print(f"Tamanho do PDF: {os.path.getsize(PDF_RELATORIOS) / 1024:.1f} KB")
else:
    print(f"Erro ao compilar: {res.stderr}")
