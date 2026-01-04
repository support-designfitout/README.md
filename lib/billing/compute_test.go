package billing

import (
	"testing"
	"time"
)

func TestComputeBilling(t *testing.T) { //nolint:funlen // Test table is intentionally long for comprehensive coverage
	// Common test data
	baseTime := time.Date(2023, 12, 1, 12, 0, 0, 0, time.UTC)
	standardRate := BillingRate{
		ID:          "rate-001",
		Name:        "Standard Design Rate",
		HourlyRate:  100.0,
		Currency:    "USD",
		ServiceType: "design",
		CreatedAt:   baseTime,
		UpdatedAt:   baseTime,
	}

	tests := []struct {
		name        string
		computation BillingComputation
		expected    *BillingResult
		expectError bool
		errorMsg    string
	}{ //nolint:exhaustruct // Test cases intentionally omit optional fields
		{
			name: "Basic billing without discounts or taxes",
			computation: BillingComputation{
				ProjectID:  "proj-001",
				Hours:      10.0,
				Rate:       standardRate,
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-001",
				BaseAmount:     1000.0,
				DiscountAmount: 0.0,
				TaxAmount:      0.0,
				TotalAmount:    1000.0,
				Currency:       "USD",
				ComputationID:  "proj-001_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		{
			name: "Billing with percentage discount",
			computation: BillingComputation{
				ProjectID: "proj-002",
				Hours:     20.0,
				Rate:      standardRate,
				Discounts: []Discount{
					{
						Type:      "percentage",
						Value:     10.0,
						Reason:    "Early payment discount",
						AppliedBy: "system",
						AppliedAt: baseTime,
					},
				},
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-002",
				BaseAmount:     2000.0,
				DiscountAmount: 200.0,
				TaxAmount:      0.0,
				TotalAmount:    1800.0,
				Currency:       "USD",
				ComputationID:  "proj-002_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		{
			name: "Billing with fixed discount",
			computation: BillingComputation{
				ProjectID: "proj-003",
				Hours:     5.0,
				Rate:      standardRate,
				Discounts: []Discount{
					{
						Type:      "fixed",
						Value:     50.0,
						Reason:    "Volume discount",
						AppliedBy: "admin",
						AppliedAt: baseTime,
					},
				},
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-003",
				BaseAmount:     500.0,
				DiscountAmount: 50.0,
				TaxAmount:      0.0,
				TotalAmount:    450.0,
				Currency:       "USD",
				ComputationID:  "proj-003_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		{
			name: "Billing with percentage tax",
			computation: BillingComputation{
				ProjectID: "proj-004",
				Hours:     8.0,
				Rate:      standardRate,
				Taxes: []Tax{
					{
						Type:   "percentage",
						Value:  8.25,
						Name:   "Sales Tax",
						Region: "CA",
					},
				},
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-004",
				BaseAmount:     800.0,
				DiscountAmount: 0.0,
				TaxAmount:      66.0,
				TotalAmount:    866.0,
				Currency:       "USD",
				ComputationID:  "proj-004_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		{
			name: "Billing with both discount and tax",
			computation: BillingComputation{
				ProjectID: "proj-005",
				Hours:     15.0,
				Rate:      standardRate,
				Discounts: []Discount{
					{
						Type:      "percentage",
						Value:     5.0,
						Reason:    "Loyalty discount",
						AppliedBy: "system",
						AppliedAt: baseTime,
					},
				},
				Taxes: []Tax{
					{
						Type:   "percentage",
						Value:  10.0,
						Name:   "VAT",
						Region: "EU",
					},
				},
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-005",
				BaseAmount:     1500.0,
				DiscountAmount: 75.0,
				TaxAmount:      142.5,
				TotalAmount:    1567.5,
				Currency:       "USD",
				ComputationID:  "proj-005_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		{
			name: "Multiple discounts and taxes",
			computation: BillingComputation{
				ProjectID: "proj-006",
				Hours:     12.0,
				Rate:      standardRate,
				Discounts: []Discount{
					{
						Type:      "percentage",
						Value:     10.0,
						Reason:    "Volume discount",
						AppliedBy: "admin",
						AppliedAt: baseTime,
					},
					{
						Type:      "fixed",
						Value:     25.0,
						Reason:    "Promotional discount",
						AppliedBy: "system",
						AppliedAt: baseTime,
					},
				},
				Taxes: []Tax{
					{
						Type:   "percentage",
						Value:  5.0,
						Name:   "State Tax",
						Region: "NY",
					},
					{
						Type:   "fixed",
						Value:  10.0,
						Name:   "Service Fee",
						Region: "Local",
					},
				},
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-006",
				BaseAmount:     1200.0,
				DiscountAmount: 145.0,
				TaxAmount:      62.75,
				TotalAmount:    1117.75,
				Currency:       "USD",
				ComputationID:  "proj-006_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		{
			name: "Zero hours billing",
			computation: BillingComputation{
				ProjectID:  "proj-007",
				Hours:      0.0,
				Rate:       standardRate,
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-007",
				BaseAmount:     0.0,
				DiscountAmount: 0.0,
				TaxAmount:      0.0,
				TotalAmount:    0.0,
				Currency:       "USD",
				ComputationID:  "proj-007_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		{
			name: "Fractional hours billing",
			computation: BillingComputation{
				ProjectID:  "proj-008",
				Hours:      2.5,
				Rate:       standardRate,
				ComputedAt: baseTime,
			},
			expected: &BillingResult{
				ProjectID:      "proj-008",
				BaseAmount:     250.0,
				DiscountAmount: 0.0,
				TaxAmount:      0.0,
				TotalAmount:    250.0,
				Currency:       "USD",
				ComputationID:  "proj-008_1701432000",
				ComputedAt:     baseTime,
			},
			expectError: false,
		},
		// Error cases
		{
			name: "Missing project ID",
			computation: BillingComputation{
				ProjectID:  "",
				Hours:      10.0,
				Rate:       standardRate,
				ComputedAt: baseTime,
			},
			expectError: true,
			errorMsg:    "project_id is required",
		},
		{
			name: "Negative hours",
			computation: BillingComputation{
				ProjectID:  "proj-error-001",
				Hours:      -5.0,
				Rate:       standardRate,
				ComputedAt: baseTime,
			},
			expectError: true,
			errorMsg:    "hours must be non-negative",
		},
		{
			name: "Negative hourly rate",
			computation: BillingComputation{
				ProjectID: "proj-error-002",
				Hours:     10.0,
				Rate: BillingRate{
					ID:          "rate-error-001",
					Name:        "Invalid Rate",
					HourlyRate:  -50.0,
					Currency:    "USD",
					ServiceType: "design",
				},
				ComputedAt: baseTime,
			},
			expectError: true,
			errorMsg:    "hourly_rate must be non-negative",
		},
		{
			name: "Missing currency",
			computation: BillingComputation{
				ProjectID: "proj-error-003",
				Hours:     10.0,
				Rate: BillingRate{
					ID:          "rate-error-002",
					Name:        "No Currency Rate",
					HourlyRate:  100.0,
					Currency:    "",
					ServiceType: "design",
				},
				ComputedAt: baseTime,
			},
			expectError: true,
			errorMsg:    "currency is required",
		},
		{
			name: "Invalid discount percentage",
			computation: BillingComputation{
				ProjectID: "proj-error-004",
				Hours:     10.0,
				Rate:      standardRate,
				Discounts: []Discount{
					{
						Type:  "percentage",
						Value: 150.0,
					},
				},
				ComputedAt: baseTime,
			},
			expectError: true,
			errorMsg:    "discount[0]: percentage discount must be between 0 and 100",
		},
		{
			name: "Invalid tax type",
			computation: BillingComputation{
				ProjectID: "proj-error-005",
				Hours:     10.0,
				Rate:      standardRate,
				Taxes: []Tax{
					{
						Type:  "invalid",
						Value: 10.0,
					},
				},
				ComputedAt: baseTime,
			},
			expectError: true,
			errorMsg:    "tax[0]: type must be 'percentage' or 'fixed'",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			result, err := ComputeBilling(tc.computation)

			if tc.expectError {
				if err == nil {
					t.Errorf("Expected error but got none")

					return
				}

				if tc.errorMsg != "" && err.Error() != "invalid computation: "+tc.errorMsg {
					t.Errorf("Expected error message '%s' but got '%s'", tc.errorMsg, err.Error())
				}

				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)

				return
			}

			if result == nil {
				t.Errorf("Expected result but got nil")

				return
			}

			verifyBillingResult(t, result, tc.expected)
		})
	}
}

// verifyBillingResult is a helper function to compare billing results
func verifyBillingResult(t *testing.T, result, expected *BillingResult) {
	t.Helper()

	// Compare key fields
	if result.ProjectID != expected.ProjectID {
		t.Errorf("ProjectID: expected %s, got %s", expected.ProjectID, result.ProjectID)
	}

	if result.BaseAmount != expected.BaseAmount {
		t.Errorf("BaseAmount: expected %f, got %f", expected.BaseAmount, result.BaseAmount)
	}

	if result.DiscountAmount != expected.DiscountAmount {
		t.Errorf("DiscountAmount: expected %f, got %f", expected.DiscountAmount, result.DiscountAmount)
	}

	if result.TaxAmount != expected.TaxAmount {
		t.Errorf("TaxAmount: expected %f, got %f", expected.TaxAmount, result.TaxAmount)
	}

	if result.TotalAmount != expected.TotalAmount {
		t.Errorf("TotalAmount: expected %f, got %f", expected.TotalAmount, result.TotalAmount)
	}

	if result.Currency != expected.Currency {
		t.Errorf("Currency: expected %s, got %s", expected.Currency, result.Currency)
	}

	if result.ComputationID != expected.ComputationID {
		t.Errorf("ComputationID: expected %s, got %s", expected.ComputationID, result.ComputationID)
	}

	// Verify breakdown is present for successful computations
	if result.Breakdown == nil {
		t.Errorf("Expected breakdown but got nil")
	}
}

func TestValidateDiscount(t *testing.T) { //nolint:funlen // Test table is intentionally long for comprehensive coverage
	tests := []struct {
		name     string
		discount Discount
		wantErr  bool
		errorMsg string
	}{
		{
			name: "Valid percentage discount",
			discount: Discount{
				Type:  "percentage",
				Value: 10.0,
			},
			wantErr: false,
		},
		{
			name: "Valid fixed discount",
			discount: Discount{
				Type:  "fixed",
				Value: 50.0,
			},
			wantErr: false,
		},
		{
			name: "Invalid discount type",
			discount: Discount{
				Type:  "invalid",
				Value: 10.0,
			},
			wantErr:  true,
			errorMsg: "type must be 'percentage' or 'fixed'",
		},
		{
			name: "Invalid percentage value - too high",
			discount: Discount{
				Type:  "percentage",
				Value: 150.0,
			},
			wantErr:  true,
			errorMsg: "percentage discount must be between 0 and 100",
		},
		{
			name: "Invalid percentage value - negative",
			discount: Discount{
				Type:  "percentage",
				Value: -5.0,
			},
			wantErr:  true,
			errorMsg: "percentage discount must be between 0 and 100",
		},
		{
			name: "Invalid fixed value - negative",
			discount: Discount{
				Type:  "fixed",
				Value: -25.0,
			},
			wantErr:  true,
			errorMsg: "fixed discount must be non-negative",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			err := validateDiscount(tc.discount)

			if tc.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")

					return
				}

				if tc.errorMsg != "" && err.Error() != tc.errorMsg {
					t.Errorf("Expected error message '%s' but got '%s'", tc.errorMsg, err.Error())
				}

				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestValidateTax(t *testing.T) { //nolint:funlen // Test table is intentionally long for comprehensive coverage
	tests := []struct {
		name     string
		tax      Tax
		wantErr  bool
		errorMsg string
	}{
		{
			name: "Valid percentage tax",
			tax: Tax{
				Type:  "percentage",
				Value: 8.25,
			},
			wantErr: false,
		},
		{
			name: "Valid fixed tax",
			tax: Tax{
				Type:  "fixed",
				Value: 15.0,
			},
			wantErr: false,
		},
		{
			name: "Invalid tax type",
			tax: Tax{
				Type:  "compound",
				Value: 5.0,
			},
			wantErr:  true,
			errorMsg: "type must be 'percentage' or 'fixed'",
		},
		{
			name: "Invalid percentage value - too high",
			tax: Tax{
				Type:  "percentage",
				Value: 120.0,
			},
			wantErr:  true,
			errorMsg: "percentage tax must be between 0 and 100",
		},
		{
			name: "Invalid fixed value - negative",
			tax: Tax{
				Type:  "fixed",
				Value: -10.0,
			},
			wantErr:  true,
			errorMsg: "fixed tax must be non-negative",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			err := validateTax(tc.tax)

			if tc.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")

					return
				}

				if tc.errorMsg != "" && err.Error() != tc.errorMsg {
					t.Errorf("Expected error message '%s' but got '%s'", tc.errorMsg, err.Error())
				}

				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestRoundToTwoDecimals(t *testing.T) {
	tests := []struct {
		name     string
		input    float64
		expected float64
	}{
		{"Exact two decimals", 123.45, 123.45},
		{"More than two decimals", 123.456789, 123.46},
		{"Round down", 123.454, 123.45},
		{"Round up", 123.456, 123.46},
		{"Zero", 0.0, 0.0},
		{"Negative number", -123.456, -123.46},
		{"Large number", 999999.999, 1000000.00},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			result := roundToTwoDecimals(tc.input)
			if result != tc.expected {
				t.Errorf("Expected %f, got %f", tc.expected, result)
			}
		})
	}
}

// Benchmark tests
func BenchmarkComputeBilling(b *testing.B) {
	baseTime := time.Now()
	computation := BillingComputation{
		ProjectID: "bench-proj-001",
		Hours:     10.0,
		Rate: BillingRate{
			ID:          "bench-rate-001",
			Name:        "Benchmark Rate",
			HourlyRate:  100.0,
			Currency:    "USD",
			ServiceType: "design",
		},
		Discounts: []Discount{
			{Type: "percentage", Value: 10.0},
		},
		Taxes: []Tax{
			{Type: "percentage", Value: 8.25},
		},
		ComputedAt: baseTime,
	}

	for i := 0; i < b.N; i++ {
		_, err := ComputeBilling(computation)
		if err != nil {
			b.Fatal(err)
		}
	}
}
