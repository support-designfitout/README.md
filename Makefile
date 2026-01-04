# Makefile for Designfitout-Github
# 
# CBPR (Comprehensive Business Process Review) targets

# Makefile for Designfitout-Github
# 
# CBPR (Comprehensive Business Process Review) targets

.PHONY: help cbpr\:report cbpr\:pdf cbpr\:clean

# Default target
help:
	@echo "Available targets:"
	@echo "  make cbpr:report    - Generate CBPR readiness report"
	@echo "  make cbpr:pdf       - Generate CBPR PDF with emerald-bar cover"
	@echo "  make cbpr:clean     - Clean generated CBPR reports"

# Generate CBPR readiness report
cbpr\:report:
	@echo "==> Generating CBPR Readiness Report"
	@mkdir -p reports
	@echo "Report generated at: $$(date)" > reports/cbpr_report_$$(date +%Y%m%d_%H%M%S).txt
	@echo "✓ Report saved to reports/"
	@ls -lh reports/cbpr_report_*.txt | tail -1

# Generate CBPR PDF with emerald-bar cover, checksum, and stitched board-ready PDF
cbpr\:pdf:
	@echo "==> Generating CBPR Emerald-Bar PDF"
	@if [ ! -f .github/scripts/make_cbpr_pdf.sh ]; then \
		echo "Error: make_cbpr_pdf.sh not found!"; \
		exit 1; \
	fi
	@chmod +x .github/scripts/make_cbpr_pdf.sh
	@.github/scripts/make_cbpr_pdf.sh reports
	@echo "✓ PDF generation complete"
	@echo ""
	@echo "Generated files:"
	@ls -lh reports/*.pdf 2>/dev/null || echo "  No PDFs found"
	@ls -lh reports/*checksums*.txt 2>/dev/null || echo "  No checksums found"

# Clean generated reports
cbpr\:clean:
	@echo "==> Cleaning CBPR reports"
	@rm -rf reports/cbpr_*.pdf reports/cbpr_*.txt
	@echo "✓ Cleaned"
