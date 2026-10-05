package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"fmt"
	"policy-parser/format"
	digit "policy-parser/templates"
	"policy-parser/utils"
)

func main() {
	errDebug := utils.InitDebugFile("debug.txt")
	if errDebug != nil {
		log.Fatalf("Fatal error getting policies : %v", errDebug)
	}
	defer utils.CloseDebugFile()
	// Example Usage:
	// _, err := GetPoliciesFromFolder("./pdfs")
	// if err != nil {
	// 	log.Fatalf("Fatal error getting policies: %v", err)
	// }

	// if len(policies) > 0 {
	// 	err = utils.ExportToCSV(policies, "output_policies.csv")
	// 	if err != nil {
	// 		log.Fatalf("Could not export data: %v", err)
	// 	}
	// 	fmt.Printf("Successfully exported %d policies.\n", len(policies))
	// } else {
	// 	fmt.Println("No policies found to export.")
	// }

	_, err := ParseSinglePolicy("./pdfs/sample.pdf")
	if err != nil {
		log.Printf("[WARN] Skipping %s: text extraction failed: %v", err)

	}
}

func ParseSinglePolicy(dirPath string) (format.PolicyData, error) {
	policy := format.PolicyData{}
	tokens, err := utils.ExtractPDFviaLayout(dirPath)
	if err != nil {
		log.Printf("[WARN] Skipping %s: text extraction failed: %v", dirPath, err)
		return policy, err
	}

	isDigit, isHueteMorgan, err := digit.IsDigitPDF(tokens)
	if err != nil {
		log.Printf("[WARN] Skipping %s: type validation failed: %v", dirPath, err)
		return policy, nil
	}

	if isDigit || isHueteMorgan {
		_policy, err := digit.ParseDigit(tokens, dirPath)
		if err != nil {
			log.Printf("[WARN] Skipping %s: parsing failed: %v", dirPath, err)
			return policy, nil
		}
		policy = _policy
	}

	return policy, nil
}

func GetPoliciesFromFolder(dirPath string) ([]format.PolicyData, error) {
	files, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	var policies []format.PolicyData

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if !strings.HasSuffix(strings.ToLower(file.Name()), ".pdf") {
			continue
		}

		pdfPath := filepath.Join(dirPath, file.Name())

		tokens, err := utils.ExtractPDFviaLayout(pdfPath)
		if err != nil {
			log.Printf("[WARN] Skipping %s: text extraction failed: %v", file.Name(), err)
			continue
		}

		isDigit, isHueteMorgan, err := digit.IsDigitPDF(tokens)
		if err != nil {
			log.Printf("[WARN] Skipping %s: type validation failed: %v", file.Name(), err)
			continue
		}

		if isDigit || isHueteMorgan {
			policy, err := digit.ParseDigit(tokens, file.Name())
			if err != nil {
				log.Printf("[WARN] Skipping %s: parsing failed: %v", file.Name(), err)
				continue
			}
			policies = append(policies, policy)
		}
	}

	return policies, nil
}
