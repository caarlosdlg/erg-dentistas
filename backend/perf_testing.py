"""
Script para realizar pruebas automatizadas de rendimiento en archivos estáticos.
Utiliza Google Lighthouse para analizar el rendimiento de las páginas.
"""
import os
import sys
import json
import subprocess
from datetime import datetime
from urllib.parse import urlparse

# Verificar si se proporciona una URL
if len(sys.argv) < 2:
    print("Uso: python perf_testing.py <url>")
    sys.exit(1)

url = sys.argv[1]

# Validar la URL
parsed_url = urlparse(url)
if not parsed_url.scheme or not parsed_url.netloc:
    print("Error: URL inválida. Asegúrate de incluir el protocolo (http:// o https://)")
    sys.exit(1)

# Directorio para reportes
REPORTS_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'performance_reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

# Timestamp para el nombre del archivo
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_file = os.path.join(REPORTS_DIR, f"lighthouse_{timestamp}.json")
html_output = os.path.join(REPORTS_DIR, f"lighthouse_{timestamp}.html")

print(f"Ejecutando Lighthouse para {url}...")

try:
    # Verificar que Lighthouse está instalado
    try:
        subprocess.run(['lighthouse', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Lighthouse no está instalado. Instálalo con 'npm install -g lighthouse'")
        sys.exit(1)
    
    # Ejecutar Lighthouse con configuración para optimización de estáticos
    lighthouse_cmd = [
        'lighthouse',
        url,
        '--output=json,html',
        '--output-path=' + os.path.join(REPORTS_DIR, f"lighthouse_{timestamp}"),
        '--emulated-form-factor=desktop',  # Puedes cambiarlo a 'mobile'
        '--throttling.cpuSlowdownMultiplier=4',
        '--throttling-method=simulate',
        '--only-categories=performance,best-practices',
        '--chrome-flags="--headless --no-sandbox --disable-gpu"'
    ]
    
    subprocess.run(' '.join(lighthouse_cmd), shell=True, check=True)
    
    print(f"\n✅ Análisis completado. Reportes guardados en:")
    print(f"JSON: {output_file}")
    print(f"HTML: {html_output}")
    
    # Cargar los resultados para mostrar un resumen
    with open(output_file, 'r') as f:
        data = json.load(f)
        
        perf_score = data['categories']['performance']['score'] * 100
        bp_score = data['categories']['best-practices']['score'] * 100
        
        print(f"\n📊 Resumen de Rendimiento:")
        print(f"Puntuación de Rendimiento: {perf_score:.1f}/100")
        print(f"Puntuación de Mejores Prácticas: {bp_score:.1f}/100")
        
        # Métricas específicas para estáticos
        print("\n📈 Métricas de Archivos Estáticos:")
        
        # Tiempo de Primer Byte (TTFB)
        ttfb = data['audits']['server-response-time']['numericValue']
        print(f"Tiempo de Primer Byte (TTFB): {ttfb:.0f}ms")
        
        # Recursos bloqueantes
        render_blocking = data['audits']['render-blocking-resources']['numericValue']
        print(f"Recursos Bloqueantes: {render_blocking:.0f}")
        
        # Compresión de texto
        text_compression = data['audits']['uses-text-compression']['details']['items']
        uncompressed_size = sum(item.get('wastedBytes', 0) for item in text_compression)
        print(f"Bytes sin comprimir: {uncompressed_size/1024:.1f}KB")
        
        # Caché eficiente
        cache_policy = data['audits']['uses-long-cache-ttl']['details']['items']
        uncached_size = sum(item.get('wastedBytes', 0) for item in cache_policy)
        print(f"Bytes sin cachear adecuadamente: {uncached_size/1024:.1f}KB")
        
        # Recomendaciones
        print("\n🛠️ Recomendaciones:")
        
        if ttfb > 600:
            print("- Mejorar el tiempo de respuesta del servidor")
            
        if render_blocking > 0:
            print("- Eliminar recursos que bloquean el renderizado")
            
        if uncompressed_size > 0:
            print("- Habilitar compresión de texto")
            
        if uncached_size > 0:
            print("- Optimizar políticas de caché")
            
except Exception as e:
    print(f"Error al ejecutar Lighthouse: {e}")
    sys.exit(1)
