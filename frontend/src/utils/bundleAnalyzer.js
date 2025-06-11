// Bundle Analysis Script for DentalERP
// Analyzes bundle size, performance metrics, and optimization opportunities

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import fs from 'fs';
import path from 'path';
import gzipSize from 'gzip-size';

class BundleAnalyzer {
  constructor(buildDir = 'dist') {
    this.buildDir = buildDir;
    this.reportData = {
      timestamp: new Date().toISOString(),
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      assets: [],
      performance: {},
      recommendations: []
    };
  }

  async analyzeBuild() {
    console.log('🔍 Starting bundle analysis...');
    
    try {
      await this.scanAssets();
      await this.analyzeChunks();
      await this.generatePerformanceReport();
      await this.generateRecommendations();
      await this.saveReport();
      
      console.log('✅ Bundle analysis completed');
      return this.reportData;
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      throw error;
    }
  }

  async scanAssets() {
    const buildPath = path.resolve(this.buildDir);
    
    if (!fs.existsSync(buildPath)) {
      throw new Error(`Build directory not found: ${buildPath}`);
    }

    const assets = await this.getAllFiles(buildPath);
    
    for (const asset of assets) {
      const filePath = path.join(buildPath, asset);
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const gzipped = await gzipSize(content);

      const assetInfo = {
        name: asset,
        size: stat.size,
        gzippedSize: gzipped,
        type: this.getAssetType(asset),
        ratio: (gzipped / stat.size * 100).toFixed(2)
      };

      this.reportData.assets.push(assetInfo);
      this.reportData.totalSize += stat.size;
      this.reportData.gzippedSize += gzipped;
    }

    console.log(`📦 Analyzed ${assets.length} assets`);
  }

  async getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        await this.getAllFiles(filePath, fileList);
      } else {
        fileList.push(path.relative(this.buildDir, filePath));
      }
    }
    
    return fileList;
  }

  getAssetType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    switch (ext) {
      case '.js': return 'javascript';
      case '.css': return 'stylesheet';
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.webp':
      case '.svg': return 'image';
      case '.woff':
      case '.woff2':
      case '.ttf':
      case '.eot': return 'font';
      case '.html': return 'html';
      case '.json': return 'json';
      default: return 'other';
    }
  }

  async analyzeChunks() {
    const jsAssets = this.reportData.assets.filter(asset => asset.type === 'javascript');
    
    // Group by chunk patterns
    const chunks = {
      vendor: jsAssets.filter(asset => asset.name.includes('vendor')),
      main: jsAssets.filter(asset => asset.name.includes('main') || asset.name.includes('index')),
      lazy: jsAssets.filter(asset => !asset.name.includes('vendor') && !asset.name.includes('main') && !asset.name.includes('index'))
    };

    for (const [chunkName, chunkAssets] of Object.entries(chunks)) {
      const totalSize = chunkAssets.reduce((sum, asset) => sum + asset.size, 0);
      const totalGzipped = chunkAssets.reduce((sum, asset) => sum + asset.gzippedSize, 0);

      this.reportData.chunks.push({
        name: chunkName,
        files: chunkAssets.length,
        size: totalSize,
        gzippedSize: totalGzipped,
        assets: chunkAssets.map(asset => asset.name)
      });
    }

    console.log(`📊 Analyzed ${Object.keys(chunks).length} chunk groups`);
  }

  async generatePerformanceReport() {
    const totalJS = this.reportData.assets
      .filter(asset => asset.type === 'javascript')
      .reduce((sum, asset) => sum + asset.gzippedSize, 0);

    const totalCSS = this.reportData.assets
      .filter(asset => asset.type === 'stylesheet')
      .reduce((sum, asset) => sum + asset.gzippedSize, 0);

    const totalImages = this.reportData.assets
      .filter(asset => asset.type === 'image')
      .reduce((sum, asset) => sum + asset.gzippedSize, 0);

    this.reportData.performance = {
      totalSizeKB: (this.reportData.gzippedSize / 1024).toFixed(2),
      javascriptKB: (totalJS / 1024).toFixed(2),
      stylesheetKB: (totalCSS / 1024).toFixed(2),
      imagesKB: (totalImages / 1024).toFixed(2),
      compressionRatio: ((this.reportData.gzippedSize / this.reportData.totalSize) * 100).toFixed(2),
      performanceScore: this.calculatePerformanceScore()
    };
  }

  calculatePerformanceScore() {
    let score = 100;
    const totalKB = this.reportData.gzippedSize / 1024;

    // Deduct points for large bundle size
    if (totalKB > 500) score -= 30;
    else if (totalKB > 300) score -= 20;
    else if (totalKB > 200) score -= 10;

    // Check for large individual files
    const largeFiles = this.reportData.assets.filter(asset => asset.gzippedSize > 100 * 1024);
    score -= largeFiles.length * 5;

    // Check compression ratio
    const compressionRatio = this.reportData.gzippedSize / this.reportData.totalSize;
    if (compressionRatio > 0.7) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  async generateRecommendations() {
    const recommendations = [];
    const totalKB = this.reportData.gzippedSize / 1024;

    // Bundle size recommendations
    if (totalKB > 300) {
      recommendations.push({
        type: 'size',
        severity: 'high',
        message: `Bundle size is ${totalKB.toFixed(2)}KB, consider code splitting`,
        action: 'Implement dynamic imports for non-critical routes'
      });
    }

    // Large file recommendations
    const largeFiles = this.reportData.assets.filter(asset => asset.gzippedSize > 100 * 1024);
    if (largeFiles.length > 0) {
      recommendations.push({
        type: 'files',
        severity: 'medium',
        message: `${largeFiles.length} files are larger than 100KB`,
        action: 'Consider splitting large files or lazy loading',
        files: largeFiles.map(f => f.name)
      });
    }

    // Compression recommendations
    const compressionRatio = this.reportData.gzippedSize / this.reportData.totalSize;
    if (compressionRatio > 0.7) {
      recommendations.push({
        type: 'compression',
        severity: 'medium',
        message: `Compression ratio is ${(compressionRatio * 100).toFixed(2)}%, could be better`,
        action: 'Enable better compression or minification'
      });
    }

    // Image optimization recommendations
    const imageAssets = this.reportData.assets.filter(asset => asset.type === 'image');
    const largeImages = imageAssets.filter(asset => asset.size > 50 * 1024);
    if (largeImages.length > 0) {
      recommendations.push({
        type: 'images',
        severity: 'low',
        message: `${largeImages.length} images could be optimized`,
        action: 'Convert to WebP or optimize image sizes',
        files: largeImages.map(f => f.name)
      });
    }

    this.reportData.recommendations = recommendations;
    console.log(`💡 Generated ${recommendations.length} recommendations`);
  }

  async saveReport() {
    const reportPath = path.join(this.buildDir, 'bundle-analysis.json');
    const htmlReportPath = path.join(this.buildDir, 'bundle-report.html');

    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.reportData, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`📄 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DentalERP Bundle Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { text-align: center; margin-bottom: 10px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #0066cc; }
        .metric-label { color: #64748b; font-size: 0.9em; }
        .recommendation { padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid; }
        .recommendation.high { background: #fef2f2; border-color: #ef4444; }
        .recommendation.medium { background: #fefbf2; border-color: #f59e0b; }
        .recommendation.low { background: #f0f9ff; border-color: #3b82f6; }
        .assets-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .assets-table th, .assets-table td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .assets-table th { background: #f8fafc; font-weight: 600; }
        .size-bar { height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin: 5px 0; }
        .size-fill { height: 100%; background: linear-gradient(90deg, #0066cc, #3b82f6); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🦷 DentalERP Bundle Analysis Report</h1>
            <p>Generated on ${this.reportData.timestamp}</p>
            <div style="text-align: center; font-size: 2em; color: ${this.getScoreColor(this.reportData.performance.performanceScore)};">
                Performance Score: ${this.reportData.performance.performanceScore}/100
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 Bundle Size Metrics</h3>
                <div class="metric">
                    <div class="metric-value">${this.reportData.performance.totalSizeKB} KB</div>
                    <div class="metric-label">Total Gzipped Size</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.reportData.performance.compressionRatio}%</div>
                    <div class="metric-label">Compression Ratio</div>
                </div>
            </div>

            <div class="card">
                <h3>🗂️ Asset Breakdown</h3>
                <div class="metric">
                    <div class="metric-value">${this.reportData.performance.javascriptKB} KB</div>
                    <div class="metric-label">JavaScript</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.reportData.performance.stylesheetKB} KB</div>
                    <div class="metric-label">CSS</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.reportData.performance.imagesKB} KB</div>
                    <div class="metric-label">Images</div>
                </div>
            </div>

            <div class="card">
                <h3>📦 Chunks</h3>
                ${this.reportData.chunks.map(chunk => `
                    <div style="margin-bottom: 15px;">
                        <strong>${chunk.name}</strong> (${chunk.files} files)
                        <div class="size-bar">
                            <div class="size-fill" style="width: ${(chunk.gzippedSize / this.reportData.gzippedSize * 100)}%"></div>
                        </div>
                        <small>${(chunk.gzippedSize / 1024).toFixed(2)} KB</small>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h3>💡 Recommendations</h3>
            ${this.reportData.recommendations.map(rec => `
                <div class="recommendation ${rec.severity}">
                    <strong>${rec.message}</strong><br>
                    <em>Action: ${rec.action}</em>
                    ${rec.files ? `<br><small>Files: ${rec.files.slice(0, 3).join(', ')}${rec.files.length > 3 ? '...' : ''}</small>` : ''}
                </div>
            `).join('')}
        </div>

        <div class="card" style="margin-top: 20px;">
            <h3>📄 All Assets</h3>
            <table class="assets-table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Gzipped</th>
                        <th>Ratio</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.reportData.assets
                      .sort((a, b) => b.gzippedSize - a.gzippedSize)
                      .slice(0, 50)
                      .map(asset => `
                        <tr>
                            <td>${asset.name}</td>
                            <td>${asset.type}</td>
                            <td>${(asset.size / 1024).toFixed(2)} KB</td>
                            <td>${(asset.gzippedSize / 1024).toFixed(2)} KB</td>
                            <td>${asset.ratio}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
  }

  getScoreColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }
}

// CLI usage
if (process.argv[2]) {
  const analyzer = new BundleAnalyzer(process.argv[2]);
  analyzer.analyzeBuild().catch(console.error);
}

export default BundleAnalyzer;
