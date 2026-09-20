package main

import (
	"log"

	"fmt"
	digit "policy-parser/templates"
	"policy-parser/utils"
)

func main() {
	text, err := utils.ExtractPDFText("sample.pdf")
	if err != nil {
		log.Fatalf("failed to extract PDF text: %v", err)
	}
	isDigit, err := digit.IsDigitPDF(text)

	if err != nil {
		log.Fatalf("Couldn't check if it is Digit Insurance")
	}

	fmt.Printf("%s", isDigit)

	fmt.Println(text)
}
