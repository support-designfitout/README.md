#!/usr/bin/env bash
#
# make_cbpr_pdf.sh - Generate CBPR emerald-bar PDF with cover, checksum, and stitching
#
# This script creates a board-ready PDF report by:
# 1. Generating the cover page from HTML template
# 2. Creating the main report content
# 3. Calculating checksums for verification
# 4. Stitching all pages together into a final PDF
#
# Requirements:
#   - wkhtmltopdf (for HTML to PDF conversion)
#   - pdftk or pdfunite (for PDF stitching)
#   - sha256sum (for checksum calculation)
#
# Usage:
#   ./make_cbpr_pdf.sh [output_dir]
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
OUTPUT_DIR="${1:-${REPO_ROOT}/reports}"
TEMPLATES_DIR="${REPO_ROOT}/templates/emerald_bar"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DATE=$(date +"%Y-%m-%d")

# Output files
COVER_HTML="${TEMPLATES_DIR}/cover.html"
COVER_PDF="${OUTPUT_DIR}/cbpr_cover_${TIMESTAMP}.pdf"
CONTENT_PDF="${OUTPUT_DIR}/cbpr_content_${TIMESTAMP}.pdf"
FINAL_PDF="${OUTPUT_DIR}/cbpr_emerald_bar_${TIMESTAMP}.pdf"
CHECKSUM_FILE="${OUTPUT_DIR}/cbpr_checksums_${TIMESTAMP}.txt"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[CBPR]${NC} $*"
}

success() {
    echo -e "${GREEN}[✓]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $*"
}

# Create output directory
mkdir -p "${OUTPUT_DIR}"

log "Starting CBPR PDF generation..."
log "Output directory: ${OUTPUT_DIR}"

# Step 1: Generate cover page
log "Generating cover page..."
if [ -f "${COVER_HTML}" ]; then
    # Replace template variables
    TEMP_COVER="/tmp/cbpr_cover_${TIMESTAMP}.html"
    sed -e "s/{{REPORT_DATE}}/${REPORT_DATE}/g" \
        -e "s/{{CHECKSUM}}/PENDING/g" \
        "${COVER_HTML}" > "${TEMP_COVER}"
    
    # Convert HTML to PDF using wkhtmltopdf if available
    if command -v wkhtmltopdf &> /dev/null; then
        wkhtmltopdf --page-size A4 --enable-local-file-access \
            "${TEMP_COVER}" "${COVER_PDF}" 2>/dev/null
        success "Cover page generated: ${COVER_PDF}"
    else
        warn "wkhtmltopdf not found, skipping cover PDF generation"
        warn "Install with: apt-get install wkhtmltopdf"
    fi
    
    rm -f "${TEMP_COVER}"
else
    warn "Cover template not found: ${COVER_HTML}"
fi

# Step 2: Generate content pages (placeholder - replace with actual report generation)
log "Generating report content..."
cat > "/tmp/cbpr_content_${TIMESTAMP}.html" <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CBPR Report Content</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2d8659; }
        .section { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>CBPR Quarterly Readiness Report</h1>
    <div class="section">
        <h2>Executive Summary</h2>
        <p>This report provides a comprehensive overview of business process readiness.</p>
    </div>
    <div class="section">
        <h2>Key Metrics</h2>
        <ul>
            <li>Process Compliance: 95%</li>
            <li>System Uptime: 99.9%</li>
            <li>Response Time: 150ms avg</li>
        </ul>
    </div>
    <div class="section">
        <h2>Recommendations</h2>
        <p>Continue monitoring and optimization of key processes.</p>
    </div>
</body>
</html>
EOF

if command -v wkhtmltopdf &> /dev/null; then
    wkhtmltopdf --page-size A4 --enable-local-file-access \
        "/tmp/cbpr_content_${TIMESTAMP}.html" "${CONTENT_PDF}" 2>/dev/null
    success "Content pages generated: ${CONTENT_PDF}"
    rm -f "/tmp/cbpr_content_${TIMESTAMP}.html"
else
    warn "wkhtmltopdf not found, skipping content PDF generation"
fi

# Step 3: Calculate checksums
log "Calculating checksums..."
if [ -f "${COVER_PDF}" ] && [ -f "${CONTENT_PDF}" ]; then
    {
        echo "CBPR Emerald-Bar Report Checksums"
        echo "Generated: ${REPORT_DATE} ${TIMESTAMP}"
        echo "---"
        echo "Cover PDF:"
        sha256sum "${COVER_PDF}"
        echo ""
        echo "Content PDF:"
        sha256sum "${CONTENT_PDF}"
    } > "${CHECKSUM_FILE}"
    success "Checksums saved: ${CHECKSUM_FILE}"
fi

# Step 4: Stitch PDFs together
log "Stitching PDFs together..."
if [ -f "${COVER_PDF}" ] && [ -f "${CONTENT_PDF}" ]; then
    if command -v pdfunite &> /dev/null; then
        pdfunite "${COVER_PDF}" "${CONTENT_PDF}" "${FINAL_PDF}"
        success "PDFs stitched with pdfunite: ${FINAL_PDF}"
    elif command -v pdftk &> /dev/null; then
        pdftk "${COVER_PDF}" "${CONTENT_PDF}" cat output "${FINAL_PDF}"
        success "PDFs stitched with pdftk: ${FINAL_PDF}"
    else
        warn "Neither pdfunite nor pdftk found for PDF stitching"
        warn "Install with: apt-get install poppler-utils (for pdfunite)"
        warn "or: apt-get install pdftk"
        # Copy content as final if stitching not available
        if [ -f "${CONTENT_PDF}" ]; then
            cp "${CONTENT_PDF}" "${FINAL_PDF}"
            warn "Using content PDF as final output (cover not stitched)"
        fi
    fi
    
    # Final checksum of stitched PDF
    if [ -f "${FINAL_PDF}" ]; then
        echo "" >> "${CHECKSUM_FILE}"
        echo "Final Stitched PDF:" >> "${CHECKSUM_FILE}"
        sha256sum "${FINAL_PDF}" >> "${CHECKSUM_FILE}"
        success "Final PDF checksum added"
    fi
fi

# Summary
log "CBPR PDF generation complete!"
log "---"
[ -f "${COVER_PDF}" ] && log "Cover PDF: ${COVER_PDF}"
[ -f "${CONTENT_PDF}" ] && log "Content PDF: ${CONTENT_PDF}"
[ -f "${FINAL_PDF}" ] && log "Final PDF: ${FINAL_PDF}"
[ -f "${CHECKSUM_FILE}" ] && log "Checksums: ${CHECKSUM_FILE}"
log "---"

exit 0
