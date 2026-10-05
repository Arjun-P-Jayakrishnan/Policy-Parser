package utils

import (
	"encoding/csv"
	"os"
	"policy-parser/format"
	"strconv"
)

func ExportToCSV(policies []format.PolicyData, filepath string) error {
	file, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// 1. Write the Header Row
	headers := []string{
		"Filename", "Status", "Date", "InsuranceCompany", "Vertical", "IMDCode",
		"LOB", "Package", "FuelType", "Renewal", "CustomerName", "MobileNumber",
		"Location", "RegistrationNumber", "RTOCode", "VehicleMake", "VehicleModel",
		"CubicCapacity", "GVW", "Bike_Scooter", "YearOfManufacture", "EngineNumber",
		"ChassisNumber", "PolicyNumber", "IssueOfficeCode", "PrePolicyNo", "IDV",
		"NCB", "RiskStartDate", "RenewalDate", "ODPremium", "TPOnlyPremium",
		"AddOnPremium", "NetPremium", "TotalAmount", "ModeOfPayment",
	}
	if err := writer.Write(headers); err != nil {
		return err
	}

	// 2. Iterate and convert records to []string
	for _, p := range policies {
		row := []string{
			p.Filename,
			strconv.FormatBool(p.Status), // Convert bool to "true"/"false"
			p.Date.Format("2006-01-02"),  // Format time.Time to string
			p.InsuranceCompany,
			p.Vertical,
			p.IMDCode,
			p.LOB,
			p.Package,
			p.FuelType,
			p.Renewal,
			p.CustomerName,
			p.MobileNumber,
			p.Location,
			p.RegistrationNumber,
			p.RTOCode,
			p.VehicleMake,
			p.VehicleModel,
			p.CubicCapacity,
			p.GVW,
			p.Bike_Scooter,
			p.YearOfManufacture,
			p.EngineNumber,
			p.ChassisNumber,
			p.PolicyNumber,
			p.IssueOfficeCode,
			p.PrePolicyNo,
			p.IDV,
			p.NCB,
			p.RiskStartDate,
			p.RenewalDate,
			p.ODPremium,
			p.TPOnlyPremium,
			p.AddOnPremium,
			p.NetPremium,
			p.TotalAmount,
			p.ModeOfPayment,
		}
		if err := writer.Write(row); err != nil {
			return err
		}
	}

	return nil
}
