package digit

import (
	"bufio"
	"policy-parser/format"
	"strings"
)

func IsDigitPDF(pdfTxt string) (bool, error) {
	scanner := bufio.NewScanner(strings.NewReader(pdfTxt))
	lineNumber := 1

	for scanner.Scan() {
		line := scanner.Text()

		// Check line 3 specifically
		if lineNumber == 3 {
			// Trim spaces to prevent extraction alignment bugs
			cleanLine := strings.TrimSpace(line)

			if cleanLine == "Go Digit General Insurance Ltd." {
				return true, nil
			}

			// If line 3 doesn't match, we already know it's not a Digit PDF
			return false, nil
		}

		lineNumber++
	}

	// Return false if the document has fewer than 3 lines
	return false, nil
}

func ParseDigit(pdfTxt string) (format.PolicyData, error) {

	data := format.PolicyData{}

	return data, nil
}
