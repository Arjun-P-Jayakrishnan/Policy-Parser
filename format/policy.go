package format

import (
	"time"
)

type PolicyData struct {
	Filename           string
	Status             bool      // Note: Parse text "Done" into a boolean in your extractor
	Date               time.Time // Note: Parse text "09-09-2026" using time.Parse()
	InsuranceCompany   string
	Vertical           string
	IMDCode            string
	LOB                string
	Package            string
	FuelType           string
	Renewal            string
	CustomerName       string
	MobileNumber       string
	Location           string
	RegistrationNumber string
	RTOCode            string
	VehicleMake        string
	VehicleModel       string // Fixed: Renamed from VehicleMode to match 'VEHICLE MODEL'
	CubicCapacity      string
	GVW                string
	Bike_Scooter       string
	YearOfManufacture  string
	EngineNumber       string
	ChassisNumber      string
	PolicyNumber       string
	IssueOfficeCode    string
	PrePolicyNo        string
	IDV                string
	NCB                string
	RiskStartDate      string // Note: Kept as string, but consider time.Time if doing date logic
	RenewalDate        string // Note: Kept as string, but consider time.Time if doing date logic
	ODPremium          string
	TPOnlyPremium      string
	AddOnPremium       string
	NetPremium         string
	TotalAmount        string
	ModeOfPayment      string
}
