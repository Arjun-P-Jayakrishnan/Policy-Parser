package utils

import (
	"fmt"
	"bytes"

	"github.com/ledongthuc/pdf"
)

func ExtractPDFText(path string) (string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return "", err
	}
	// Ensure the file close at end
	defer f.Close()

	var buf bytes.Buffer

	for pageNum := 1; pageNum <= r.NumPage(); pageNum++ {
		page := r.Page(pageNum)

		text, err := page.GetPlainText(nil)
		if err != nil {
			return "", fmt.Errorf("failed to read page %d: %w", pageNum, err)
		}

		buf.WriteString(text)
		buf.WriteString("\n\n")
	}

	return buf.String(), nil
}