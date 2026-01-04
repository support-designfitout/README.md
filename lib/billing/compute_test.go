package billing

import (
	"testing"
	"time"
)

// Helper function to create test billing rate
func createTestBillingRate(baseTime time.Time) BillingRate {
	return BillingRate{
		ID:          "rate-001",
		Name:        "Standard Design Rate",
		HourlyRate:  100.0,
		Currency:    "USD",
		ServiceType: "design",
		CreatedAt:   baseTime,
		UpdatedAt:   baseTime,
	}
}

// Helper function to validate billing computation success
func validateBillingSuccess(t *testing.T, result *BillingResult, expected *BillingResult) {
	t.Helper()

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

	if result.Breakdown == nil {
		t.Errorf("Expected breakdown but got nil")
	}
}

// Helper function to validate billing computation error
func validateBillingError(t *testing.T, err error, errorMsg string) {
	t.Helper()

	if err == nil {
		t.Errorf("Expected error but got none")

		return
	}

	if errorMsg != "" && err.Error() != "invalid computation: "+errorMsg {
		t.Errorf("Expected error message '%s' but got '%s'", errorMsg, err.Error())
	}
}

// getBillingTestCases returns test cases for TestComputeBilling
//
//nolint:funlen // Test data table
func getBillingTestCases(baseTime time.Time, standardRate BillingRate) []struct {
	name        string
	computation BillingComputation
	expected    *BillingResult
	expectError bool
	errorMsg    string
} {
	return []struct {
		name        string
		computation BillingComputation
		expected    *BillingResult
		expectError bool
		errorMsg    string
	}{
		{
			name: "Basic billing without discounts or taxes",
			computation: BillingComputation{
				ProjectID:  "proj-001",
				Hours:      10.0,
				Rate:       standardRate,
				Discounts:  nil,
				Taxes:      nil,
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
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
				Taxes:      nil,
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
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
				Taxes:      nil,
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
		},
		{
			name: "Billing with percentage tax",
			computation: BillingComputation{
				ProjectID: "proj-004",
				Hours:     8.0,
				Rate:      standardRate,
				Discounts: nil,
				Taxes: []Tax{
					{
						Type:   "percentage",
						Value:  8.25,
						Name:   "Sales Tax",
						Region: "CA",
					},
				},
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
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
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
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
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
		},
		{
			name: "Zero hours billing",
			computation: BillingComputation{
				ProjectID:  "proj-007",
				Hours:      0.0,
				Rate:       standardRate,
				Discounts:  nil,
				Taxes:      nil,
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
		},
		{
			name: "Fractional hours billing",
			computation: BillingComputation{
				ProjectID:  "proj-008",
				Hours:      2.5,
				Rate:       standardRate,
				Discounts:  nil,
				Taxes:      nil,
				Metadata:   nil,
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
				Breakdown:      nil,
			},
			expectError: false,
			errorMsg:    "",
		},
		// Error cases
		{
			name: "Missing project ID",
			computation: BillingComputation{
				ProjectID:  "",
				Hours:      10.0,
				Rate:       standardRate,
				Discounts:  nil,
				Taxes:      nil,
				Metadata:   nil,
				ComputedAt: baseTime,
			},
			expected:    nil,
			expectError: true,
			errorMsg:    "project_id is required",
		},
		{
			name: "Negative hours",
			computation: BillingComputation{
				ProjectID:  "proj-error-001",
				Hours:      -5.0,
				Rate:       standardRate,
				Discounts:  nil,
				Taxes:      nil,
				Metadata:   nil,
				ComputedAt: baseTime,
			},
			expected:    nil,
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
					CreatedAt:   time.Time{},
					UpdatedAt:   time.Time{},
				},
				Discounts:  nil,
				Taxes:      nil,
				Metadata:   nil,
				ComputedAt: baseTime,
			},
			expected:    nil,
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
					CreatedAt:   time.Time{},
					UpdatedAt:   time.Time{},
				},
				Discounts:  nil,
				Taxes:      nil,
				Metadata:   nil,
				ComputedAt: baseTime,
			},
			expected:    nil,
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
						Type:      "percentage",
						Value:     150.0,
						Reason:    "",
						AppliedBy: "",
						AppliedAt: time.Time{},
					},
				},
				Taxes:      nil,
				Metadata:   nil,
				ComputedAt: baseTime,
			},
			expected:    nil,
			expectError: true,
			errorMsg:    "discount[0]: percentage discount must be between 0 and 100",
		},
		{
			name: "Invalid tax type",
			computation: BillingComputation{
				ProjectID: "proj-error-005",
				Hours:     10.0,
				Rate:      standardRate,
				Discounts: nil,
				Taxes: []Tax{
					{
						Type:   "invalid",
						Value:  10.0,
						Name:   "",
						Region: "",
					},
				},
				Metadata:   nil,
				ComputedAt: baseTime,
			},
			expected:    nil,
			expectError: true,
			errorMsg:    "tax[0]: type must be 'percentage' or 'fixed'",
		},
	}
}

func TestComputeBilling(t *testing.T) {
	t.Parallel()

	baseTime := time.Date(2023, 12, 1, 12, 0, 0, 0, time.UTC)
	standardRate := createTestBillingRate(baseTime)
	tests := getBillingTestCases(baseTime, standardRate)

	for _, tt := range tests {
		tc := tt
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			result, err := ComputeBilling(tc.computation)

			if tc.expectError {
				validateBillingError(t, err, tc.errorMsg)

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

			validateBillingSuccess(t, result, tc.expected)
		})
	}
}

// Helper function to validate discount test results
func validateDiscountTestResult(t *testing.T, err error, wantErr bool, errorMsg string) {
	t.Helper()

	if wantErr {
		if err == nil {
			t.Errorf("Expected error but got none")

			return
		}

		if errorMsg != "" && err.Error() != errorMsg {
			t.Errorf("Expected error message '%s' but got '%s'", errorMsg, err.Error())
		}
	} else if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
}

// getDiscountTestCases returns test cases for TestValidateDiscount
//
//nolint:funlen // Test data table
func getDiscountTestCases() []struct {
	name     string
	discount Discount
	wantErr  bool
	errorMsg string
} {
	return []struct {
		name     string
		discount Discount
		wantErr  bool
		errorMsg string
	}{
		{
			name: "Valid percentage discount",
			discount: Discount{
				Type:      "percentage",
				Value:     10.0,
				Reason:    "",
				AppliedBy: "",
				AppliedAt: time.Time{},
			},
			wantErr:  false,
			errorMsg: "",
		},
		{
			name: "Valid fixed discount",
			discount: Discount{
				Type:      "fixed",
				Value:     50.0,
				Reason:    "",
				AppliedBy: "",
				AppliedAt: time.Time{},
			},
			wantErr:  false,
			errorMsg: "",
		},
		{
			name: "Invalid discount type",
			discount: Discount{
				Type:      "invalid",
				Value:     10.0,
				Reason:    "",
				AppliedBy: "",
				AppliedAt: time.Time{},
			},
			wantErr:  true,
			errorMsg: "type must be 'percentage' or 'fixed'",
		},
		{
			name: "Invalid percentage value - too high",
			discount: Discount{
				Type:      "percentage",
				Value:     150.0,
				Reason:    "",
				AppliedBy: "",
				AppliedAt: time.Time{},
			},
			wantErr:  true,
			errorMsg: "percentage discount must be between 0 and 100",
		},
		{
			name: "Invalid percentage value - negative",
			discount: Discount{
				Type:      "percentage",
				Value:     -5.0,
				Reason:    "",
				AppliedBy: "",
				AppliedAt: time.Time{},
			},
			wantErr:  true,
			errorMsg: "percentage discount must be between 0 and 100",
		},
		{
			name: "Invalid fixed value - negative",
			discount: Discount{
				Type:      "fixed",
				Value:     -25.0,
				Reason:    "",
				AppliedBy: "",
				AppliedAt: time.Time{},
			},
			wantErr:  true,
			errorMsg: "fixed discount must be non-negative",
		},
	}
}

func TestValidateDiscount(t *testing.T) {
	t.Parallel()

	tests := getDiscountTestCases()

	for _, tt := range tests {
		tc := tt
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			err := validateDiscount(tc.discount)
			validateDiscountTestResult(t, err, tc.wantErr, tc.errorMsg)
		})
	}
}

// Helper function to validate tax test results
func validateTaxTestResult(t *testing.T, err error, wantErr bool, errorMsg string) {
	t.Helper()

	if wantErr {
		if err == nil {
			t.Errorf("Expected error but got none")

			return
		}

		if errorMsg != "" && err.Error() != errorMsg {
			t.Errorf("Expected error message '%s' but got '%s'", errorMsg, err.Error())
		}
	} else if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
}

// getTaxTestCases returns test cases for TestValidateTax
//
//nolint:funlen // Test data table
func getTaxTestCases() []struct {
	name     string
	tax      Tax
	wantErr  bool
	errorMsg string
} {
	return []struct {
		name     string
		tax      Tax
		wantErr  bool
		errorMsg string
	}{
		{
			name: "Valid percentage tax",
			tax: Tax{
				Type:   "percentage",
				Value:  8.25,
				Name:   "",
				Region: "",
			},
			wantErr:  false,
			errorMsg: "",
		},
		{
			name: "Valid fixed tax",
			tax: Tax{
				Type:   "fixed",
				Value:  15.0,
				Name:   "",
				Region: "",
			},
			wantErr:  false,
			errorMsg: "",
		},
		{
			name: "Invalid tax type",
			tax: Tax{
				Type:   "compound",
				Value:  5.0,
				Name:   "",
				Region: "",
			},
			wantErr:  true,
			errorMsg: "type must be 'percentage' or 'fixed'",
		},
		{
			name: "Invalid percentage value - too high",
			tax: Tax{
				Type:   "percentage",
				Value:  120.0,
				Name:   "",
				Region: "",
			},
			wantErr:  true,
			errorMsg: "percentage tax must be between 0 and 100",
		},
		{
			name: "Invalid fixed value - negative",
			tax: Tax{
				Type:   "fixed",
				Value:  -10.0,
				Name:   "",
				Region: "",
			},
			wantErr:  true,
			errorMsg: "fixed tax must be non-negative",
		},
	}
}

func TestValidateTax(t *testing.T) {
	t.Parallel()

	tests := getTaxTestCases()

	for _, tt := range tests {
		tc := tt
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			err := validateTax(tc.tax)
			validateTaxTestResult(t, err, tc.wantErr, tc.errorMsg)
		})
	}
}

func TestRoundToTwoDecimals(t *testing.T) {
	t.Parallel()

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

	for _, tt := range tests {
		tc := tt
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
			CreatedAt:   baseTime,
			UpdatedAt:   baseTime,
		},
		Discounts: []Discount{
			{
				Type:      "percentage",
				Value:     10.0,
				Reason:    "Benchmark discount",
				AppliedBy: "system",
				AppliedAt: baseTime,
			},
		},
		Taxes: []Tax{
			{
				Type:   "percentage",
				Value:  8.25,
				Name:   "Sales Tax",
				Region: "US",
			},
		},
		Metadata:   nil,
		ComputedAt: baseTime,
	}

	for i := 0; i < b.N; i++ {
		_, err := ComputeBilling(computation)
		if err != nil {
			b.Fatal(err)
		}
	}
}
