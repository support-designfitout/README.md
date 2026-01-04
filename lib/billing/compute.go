// Package billing provides core billing logic for the Designfitout platform.
// This package implements cloud-agnostic billing calculations and operations.
package billing

import (
	"errors"
	"fmt"
	"math"
	"time"
)

// BillingRate represents a billing rate with associated metadata
type BillingRate struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	HourlyRate  float64   `json:"hourly_rate"`
	Currency    string    `json:"currency"`
	ServiceType string    `json:"service_type"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// BillingComputation represents a billing computation request
type BillingComputation struct {
	ProjectID    string                 `json:"project_id"`
	Hours        float64                `json:"hours"`
	Rate         BillingRate            `json:"rate"`
	Discounts    []Discount             `json:"discounts,omitempty"`
	Taxes        []Tax                  `json:"taxes,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
	ComputedAt   time.Time              `json:"computed_at"`
}

// Discount represents a billing discount
type Discount struct {
	Type       string  `json:"type"`       // "percentage" or "fixed"
	Value      float64 `json:"value"`      // percentage (0-100) or fixed amount
	Reason     string  `json:"reason"`     // reason for discount
	AppliedBy  string  `json:"applied_by"` // who applied the discount
	AppliedAt  time.Time `json:"applied_at"`
}

// Tax represents a billing tax
type Tax struct {
	Type     string  `json:"type"`     // "percentage" or "fixed" 
	Value    float64 `json:"value"`    // percentage (0-100) or fixed amount
	Name     string  `json:"name"`     // tax name (e.g., "VAT", "Sales Tax")
	Region   string  `json:"region"`   // tax region/jurisdiction
}

// BillingResult represents the result of a billing computation
type BillingResult struct {
	ProjectID       string    `json:"project_id"`
	BaseAmount      float64   `json:"base_amount"`
	DiscountAmount  float64   `json:"discount_amount"`
	TaxAmount       float64   `json:"tax_amount"`
	TotalAmount     float64   `json:"total_amount"`
	Currency        string    `json:"currency"`
	ComputationID   string    `json:"computation_id"`
	ComputedAt      time.Time `json:"computed_at"`
	Breakdown       *BillingBreakdown `json:"breakdown,omitempty"`
}

// BillingBreakdown provides detailed breakdown of billing computation
type BillingBreakdown struct {
	Hours           float64     `json:"hours"`
	HourlyRate      float64     `json:"hourly_rate"`
	AppliedDiscounts []Discount  `json:"applied_discounts,omitempty"`
	AppliedTaxes    []Tax       `json:"applied_taxes,omitempty"`
	ServiceType     string      `json:"service_type"`
}

// ComputeBilling performs the core billing calculation
func ComputeBilling(computation BillingComputation) (*BillingResult, error) {
	// Validate input
	if err := validateComputation(computation); err != nil {
		return nil, fmt.Errorf("invalid computation: %w", err)
	}

	// Calculate base amount
	baseAmount := computation.Hours * computation.Rate.HourlyRate

	// Apply discounts
	discountAmount := calculateDiscounts(baseAmount, computation.Discounts)
	amountAfterDiscount := baseAmount - discountAmount

	// Apply taxes
	taxAmount := calculateTaxes(amountAfterDiscount, computation.Taxes)
	totalAmount := amountAfterDiscount + taxAmount

	// Generate computation ID
	computationID := generateComputationID(computation.ProjectID, computation.ComputedAt)

	// Create result
	result := &BillingResult{
		ProjectID:      computation.ProjectID,
		BaseAmount:     roundToTwoDecimals(baseAmount),
		DiscountAmount: roundToTwoDecimals(discountAmount),
		TaxAmount:      roundToTwoDecimals(taxAmount),
		TotalAmount:    roundToTwoDecimals(totalAmount),
		Currency:       computation.Rate.Currency,
		ComputationID:  computationID,
		ComputedAt:     computation.ComputedAt,
		Breakdown: &BillingBreakdown{
			Hours:            computation.Hours,
			HourlyRate:       computation.Rate.HourlyRate,
			AppliedDiscounts: computation.Discounts,
			AppliedTaxes:     computation.Taxes,
			ServiceType:      computation.Rate.ServiceType,
		},
	}

	return result, nil
}

// validateComputation validates the billing computation input
func validateComputation(computation BillingComputation) error {
	if computation.ProjectID == "" {
		return errors.New("project_id is required")
	}

	if computation.Hours < 0 {
		return errors.New("hours must be non-negative")
	}

	if computation.Rate.HourlyRate < 0 {
		return errors.New("hourly_rate must be non-negative")
	}

	if computation.Rate.Currency == "" {
		return errors.New("currency is required")
	}

	// Validate discounts
	for i, discount := range computation.Discounts {
		if err := validateDiscount(discount); err != nil {
			return fmt.Errorf("discount[%d]: %w", i, err)
		}
	}

	// Validate taxes
	for i, tax := range computation.Taxes {
		if err := validateTax(tax); err != nil {
			return fmt.Errorf("tax[%d]: %w", i, err)
		}
	}

	return nil
}

// validateDiscount validates a discount
func validateDiscount(discount Discount) error {
	if discount.Type != "percentage" && discount.Type != "fixed" {
		return errors.New("type must be 'percentage' or 'fixed'")
	}

	if discount.Type == "percentage" && (discount.Value < 0 || discount.Value > 100) {
		return errors.New("percentage discount must be between 0 and 100")
	}

	if discount.Type == "fixed" && discount.Value < 0 {
		return errors.New("fixed discount must be non-negative")
	}

	return nil
}

// validateTax validates a tax
func validateTax(tax Tax) error {
	if tax.Type != "percentage" && tax.Type != "fixed" {
		return errors.New("type must be 'percentage' or 'fixed'")
	}

	if tax.Type == "percentage" && (tax.Value < 0 || tax.Value > 100) {
		return errors.New("percentage tax must be between 0 and 100")
	}

	if tax.Type == "fixed" && tax.Value < 0 {
		return errors.New("fixed tax must be non-negative")
	}

	return nil
}

// calculateDiscounts calculates the total discount amount
func calculateDiscounts(baseAmount float64, discounts []Discount) float64 {
	totalDiscount := 0.0

	for _, discount := range discounts {
		var discountAmount float64
		switch discount.Type {
		case "percentage":
			discountAmount = baseAmount * (discount.Value / 100)
		case "fixed":
			discountAmount = discount.Value
		}
		totalDiscount += discountAmount
	}

	// Ensure discount doesn't exceed base amount
	if totalDiscount > baseAmount {
		totalDiscount = baseAmount
	}

	return totalDiscount
}

// calculateTaxes calculates the total tax amount
func calculateTaxes(amountAfterDiscount float64, taxes []Tax) float64 {
	totalTax := 0.0

	for _, tax := range taxes {
		var taxAmount float64
		switch tax.Type {
		case "percentage":
			taxAmount = amountAfterDiscount * (tax.Value / 100)
		case "fixed":
			taxAmount = tax.Value
		}
		totalTax += taxAmount
	}

	return totalTax
}

// generateComputationID generates a unique computation ID
func generateComputationID(projectID string, computedAt time.Time) string {
	return fmt.Sprintf("%s_%d", projectID, computedAt.Unix())
}

// roundToTwoDecimals rounds a float64 to two decimal places
func roundToTwoDecimals(value float64) float64 {
	return math.Round(value*100) / 100
}