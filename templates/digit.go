package digit

import (
	"fmt"
	"math"
	"policy-parser/format"
	"regexp"
	"strings"
	"time"
)

func IsDigitPDF(pdfTokens []format.PDFToken) (isDigit bool, isHueteMorgan bool, err error) {
	lineNumber := 1

	_isDigit := false
	_isHueteMorgan := false
	cleanLine := ""
	for _, pdfToken := range pdfTokens {
		cleanLine = strings.TrimSpace(pdfToken.Text)

		// Check line 3 specifically
		if cleanLine == "Schedule/CertificateGo Digit General Insurance Ltd." {
			_isDigit = true
		}

		if cleanLine == "HEUTE AND MORGEN INSURANCE" {
			_isHueteMorgan = true
		}

		lineNumber++
	}

	// Return false if the document has fewer than 3 lines
	return _isDigit, _isHueteMorgan, nil
}

func ParseDigit(pdfTokens []format.PDFToken, fileName string) (format.PolicyData, error) {

	data := format.PolicyData{
		Filename:         fileName,
		InsuranceCompany: "Go Digit",
	}

	lineNumber := 1
	prevLine := ""
	_isHueteMorgan := false

	for i, token := range pdfTokens {

		// fmt.Printf("X = %.2f Y = %.2f Line %d : %s \n", token.X, token.Y, lineNumber, token.Text)

		//Date
		if prevLine == "Policy Issue Date" {
			layout := "02-Jan-2006"
			parsedDate, err := time.Parse(layout, token.Text)
			if err == nil {
				data.Date = parsedDate
				fmt.Printf("Date %s", parsedDate)
			}

		}
		//Insurance Company (Go Digit)

		//Vertical
		if _isHueteMorgan == false {
			data.Vertical = "HEUTE AND MORGEN INSURANCE "
			_isHueteMorgan = true
		}

		//IMDCode
		if (i+5) < len(pdfTokens) && pdfTokens[i+5].Text == "Partner Code :" {
			data.IMDCode = token.Text
		}

		//LOB

		//Package/Liability

		//Fuel Type
		if prevLine == "Fuel Type" {
			data.FuelType = token.Text
		}

		//Renewal
		if (i+5) < len(pdfTokens) && pdfTokens[i+5].Text == "Name: " {
			data.CustomerName = token.Text
		}

		//Mobile Number
		if (i+4) < len(pdfTokens) && pdfTokens[i+4].Text == "Mobile Number:" {
			data.MobileNumber = token.Text
		}

		//Location
		if data.Location == "" && prevLine == "Address" {
			data.Location = token.Text
		}

		//Registration Number
		if (i+5) < len(pdfTokens) && pdfTokens[i+5].Text == "Registration Number:" {
			data.RegistrationNumber = token.Text
		}

		//RTO
		if prevLine == "RTO Location" {
			data.RTOCode = token.Text
		}

		//Vehicle Make
		if prevLine == "Make" {
			data.VehicleMake = token.Text
		}

		//Model
		if (i+1) < len(pdfTokens) && token.Text == "Model/Vehicle Variant (Sub-" && pdfTokens[i+1].Text == "Type)" {
			data.VehicleModel = pdfTokens[i+2].Text
		}

		//CC
		if prevLine == "Cubic Capacity" {
			data.CubicCapacity = token.Text
		}

		//GVW

		//Bike/Scooter

		//Year of Manufacture
		if prevLine == "Manufacturing" {
			data.YearOfManufacture = token.Text
		}

		//Engine Number
		if prevLine == "Engine No." {
			data.EngineNumber = token.Text
		}

		//Chassis
		if prevLine == "Chassis No." {
			data.ChassisNumber = token.Text
		}

		//Policy Number
		if strings.HasPrefix(token.Text, "Policy No") {
			re := regexp.MustCompile(`[A-Z0-9]+$`)
			data.PolicyNumber = re.FindString(token.Text)
		}

		//Issue Office Code

		//Previous Policy Number
		if (i+10) < len(pdfTokens) && pdfTokens[i+10].Text == "Previous Policy No.Previous Policy Expiry Date" {
			data.PrePolicyNo = token.Text
		}

		//Sum Insured

		//NCB %
		if data.NCB == "" && prevLine == "NCB % (Current Policy)" {
			data.NCB = token.Text
		}

		//Risk Start Date

		//Renewal Date

		//OD Premium
		if (i+20) < len(pdfTokens) && pdfTokens[i+20].Text == "Own Damage Premium " && pdfTokens[i+20].X-token.X < 1 {
			data.ODPremium = token.Text
		}

		//Total Act Premium
		if (i+9) < len(pdfTokens) && pdfTokens[i+9].Text == "Total OD Premium Total Act Premium " && pdfTokens[i+9].Y-token.Y < 1 {
			data.TPOnlyPremium = token.Text
		}

		//Add On Premium

		//Net Premium
		if (i+5) < len(pdfTokens) && pdfTokens[i+5].Text == "Net Premium " && math.Abs(token.Y-pdfTokens[i+5].Y) < 1 {
			data.NetPremium = token.Text
		}

		//Total Amount
		if (i+9) < len(pdfTokens) && pdfTokens[i+9].Text == "Final Premium" && math.Abs(token.Y-pdfTokens[i+9].Y) < 1 {
			data.TotalAmount = token.Text
		}

		//Mode of Payment
		if (i+9) < len(pdfTokens) && pdfTokens[i+9].Text == "Payment Mode" && math.Abs(token.Y-pdfTokens[i+9].Y) < 1 {
			data.ModeOfPayment = token.Text
		}

		lineNumber++
		prevLine = token.Text
	}

	return data, nil
}

// func IsDigitPDF(pdfTxt string) (isDigit bool, isHueteMorgan bool, err error) {
// 	scanner := bufio.NewScanner(strings.NewReader(pdfTxt))
// 	lineNumber := 1

// 	_isDigit := false
// 	_isHueteMorgan := false

// 	for scanner.Scan() {
// 		line := scanner.Text()

// 		// Check line 3 specifically
// 		if lineNumber == 3 {
// 			// Trim spaces to prevent extraction alignment bugs
// 			cleanLine := strings.TrimSpace(line)

// 			if cleanLine == "Go Digit General Insurance Ltd." {
// 				_isDigit = true
// 			}

// 			// If line 3 doesn't match, we already know it's not a Digit PDF
// 			// _isDigit = false
// 		}

// 		if lineNumber == 68 {
// 			cleanLine := strings.TrimSpace(line)

// 			if cleanLine == "HEUTE AND MORGEN INSURANCE" {
// 				_isHueteMorgan = true
// 			}
// 		}

// 		if lineNumber > 68 {
// 			break
// 		}

// 		lineNumber++
// 	}

// 	// Return false if the document has fewer than 3 lines
// 	return _isDigit, _isHueteMorgan, nil
// }

// func ParseDigit(pdfTxt string, fileName string) (format.PolicyData, error) {

// 	data := format.PolicyData{
// 		Filename:         fileName,
// 		InsuranceCompany: "Go Digit",
// 	}

// 	scanner := bufio.NewScanner(strings.NewReader(pdfTxt))
// 	lineNumber := 1
// 	prevLine := ""

// 	for scanner.Scan() {
// 		line := scanner.Text()

// 		fmt.Printf("Line %d : %s \n", lineNumber, line)

// 		//Date
// 		if prevLine == "Policy Issue Date" && lineNumber == 86 {
// 			layout := "02-Jan-2006"
// 			parsedDate, err := time.Parse(layout, line)
// 			if err == nil {
// 				data.Date = parsedDate
// 				fmt.Printf("Date %s", line)
// 			}

// 		}
// 		//Insurance Company

// 		//Vertical
// 		if lineNumber == 68 {
// 			data.Vertical = line
// 		}

// 		//IMDCode
// 		if lineNumber == 67 {
// 			data.IMDCode = line
// 		}

// 		//LOB

// 		//Package/Liability

// 		//Fuel Type
// 		if prevLine == "Fuel Type" && lineNumber == 185 {
// 			data.FuelType = line
// 		}

// 		//Renewal
// 		if lineNumber == 78 {
// 			data.CustomerName = line
// 		}

// 		//Mobile Number
// 		if lineNumber == 76 {
// 			data.MobileNumber = line
// 		}

// 		//Location
// 		if lineNumber == 133 {
// 			data.Location = line
// 		}

// 		//Registration Number
// 		if lineNumber == 77 {
// 			data.RegistrationNumber = line
// 		}

// 		//RTO
// 		if lineNumber == 175 {
// 			data.RTOCode = line
// 		}

// 		//Vehicle Make
// 		if lineNumber == 177 {
// 			data.VehicleMake = line
// 		}

// 		//Model
// 		if lineNumber == 180 {
// 			data.VehicleModel = line
// 		}

// 		//CC
// 		if strings.TrimSpace(prevLine) == "Cubic Capacity" && lineNumber == 195 {
// 			data.CubicCapacity = line
// 		}

// 		//GVW

// 		//Bike/Scooter

// 		//Year of Manufacture
// 		if lineNumber == 188 {
// 			data.YearOfManufacture = line
// 		}

// 		//Engine Number
// 		if lineNumber == 189 && strings.TrimSpace(prevLine) == "Engine No." {
// 			data.EngineNumber = line
// 		}

// 		//Chassis
// 		if lineNumber == 191 && strings.TrimSpace(prevLine) == "Chassis No." {
// 			data.ChassisNumber = line
// 		}

// 		//Policy Number
// 		if lineNumber == 8 {
// 			data.PolicyNumber = line
// 		}

// 		//Issue Office Code

// 		//Previous Policy Number
// 		if lineNumber == 430 {
// 			data.PrePolicyNo = line
// 		}

// 		//Sum Insured

// 		//NCB %
// 		if lineNumber == 95 && strings.TrimSpace(prevLine) == "NCB % (Current Policy)" {
// 			data.NCB = line
// 		}

// 		//Risk Start Date

// 		//Renewal Date

// 		//OD Premium
// 		if lineNumber == 268 {
// 			data.ODPremium = line
// 		}

// 		//Total Act Premium
// 		if lineNumber == 279 {
// 			data.TPOnlyPremium = line
// 		}

// 		//Add On Premium

// 		//Net Premium
// 		if lineNumber == 278 {
// 			data.NetPremium = line
// 		}

// 		//Total Amount
// 		if lineNumber == 275 {
// 			data.TotalAmount = line
// 		}

// 		//Mode of Payment
// 		if lineNumber == 426 {
// 			data.ModeOfPayment = line
// 		}

// 		lineNumber++
// 		prevLine = line
// 	}

// 	return data, nil
// }
