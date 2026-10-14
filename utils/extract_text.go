package utils

import (
	"bytes"
	"fmt"
	"policy-parser/format"

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

func ExtractPDFviaPosition(path string) ([]format.PDFToken, error) {
	f, reader, err := pdf.Open(path)
	if err != nil {
		return []format.PDFToken{}, fmt.Errorf("failed to open PDF: %w", err)
	}
	defer f.Close()

	texts, err := reader.GetStyledTexts()
	if err != nil {
		return []format.PDFToken{}, fmt.Errorf("failed to extract styled text: %w", err)
	}

	tokens := []format.PDFToken{}

	for _, text := range texts {

		tokens = append(tokens, format.PDFToken{
			X:    text.X,
			Y:    text.Y,
			Text: text.S,
		})
		// fmt.Printf(
		// 	"[%d] X=%8.2f Y=%8.2f Font=%q Size=%8.2f Text=%q\n",
		// 	i,
		// 	text.X,
		// 	text.Y,
		// 	text.Font,
		// 	text.FontSize,
		// 	text.S,
		// )
	}

	return tokens, nil
}

func debugFonts(page pdf.Page) {
	for _, fontName := range page.Fonts() {
		font := page.Font(fontName)

		DebugPrint(
			"FONT %s: BaseFont=%s FirstChar=%d LastChar=%d Widths=%d\n",
			fontName,
			font.BaseFont(),
			font.FirstChar(),
			font.LastChar(),
			len(font.Widths()),
		)
	}
}

func ExtractPDFviaLayout(path string) ([]format.PDFToken, error) {
	f, reader, err := pdf.Open(path)
	if err != nil {
		return []format.PDFToken{}, fmt.Errorf("failed to open PDF: %w", err)
	}
	defer f.Close()

	// page, err := reader.Page()
	// if err != nil {
	// 	return []format.PDFToken{}, fmt.Errorf("failed to extract styled text: %w", err)
	// }

	// pageLen := reader.NumPage()
	tokens := []format.PDFToken{}

	for pageNo := 1; pageNo <= 1; pageNo++ {
		page := reader.Page(pageNo)
		font := page.Font("F2")

		DebugPrint("BaseFont: 	%s\n", font.BaseFont())
		DebugPrint("FirstChar: 	%d\n", font.FirstChar())
		DebugPrint("LastChar: 	%d\n", font.LastChar())
		DebugPrint("Widths: 	%v\n", font.Widths())
		DebugPrint("Encoder: 	%v\n", font.Encoder())

		content := page.Content()
		_texts := []Text{}

		for _, text := range content.Text {
			_texts = append(_texts, Text{
				X: text.X,
				Y: text.Y,
				S: text.S,
				W: text.W,
			})

			tokens = append(tokens, format.PDFToken{
				X:    text.X,
				Y:    text.Y,
				Text: text.S,
			})
		}

		DebugPrint("========== PAGE %d ==========\n", pageNo)

		groupTextsByLines(_texts)

	}

	return tokens, nil
}

type Text struct {
	X float64
	Y float64
	S string
	W float64
}

type Page struct {
	Page_No int
	Texts   []Text
}

type Line struct {
	texts []Text
}

func groupTextsByLines(texts []Text) (lines []Line) {

	for i, line := range texts {
		DebugPrint(
			"Texts [%d] : X = %f Y = %f W = %f Text = %s\n\n",
			i,
			line.X,
			line.Y,
			line.W,
			line.S,
		)
	}

	sortedTextsY := sortY(texts)

	for i, line := range sortedTextsY {
		DebugPrint(
			"Line [%d] : X = %f Y = %f W = %f Text = %s\n\n",
			i,
			line.X,
			line.Y,
			line.W,
			line.S,
		)
	}

	_lines := groupByY(sortedTextsY, 2.0)

	for i, _line := range _lines {
		for _, _text := range _line.texts {
			DebugPrint(
				"GroupedByY [%d] : X = %f Y = %f W =%f Text = %s\n\n",
				i,
				_text.X,
				_text.Y,
				_text.W,
				_text.S,
			)
		}
	}

	_lines = sortLinesByX(_lines)

	for i, _line := range _lines {
		for _, _text := range _line.texts {
			DebugPrint(
				"SortedByX [%d] : X = %f Y = %f W =%f Text = %s\n\n",
				i,
				_text.X,
				_text.Y,
				_text.W,
				_text.S,
			)
		}
	}

	return _lines
}

func sortY(texts []Text) (sortedTexts []Text) {

	if len(texts) <= 1 {
		return texts
	}

	mid := len(texts) / 2
	left := sortY(texts[:mid])
	right := sortY(texts[mid:])

	return mergeY(left, right)
}

func mergeY(left, right []Text) (sortedTexts []Text) {
	result := make([]Text, 0, len(left)+len(right))

	i := 0
	j := 0

	for i < len(left) && j < len(right) {
		if left[i].Y <= right[j].Y {
			result = append(result, left[i])
			i++
		} else {
			result = append(result, right[j])
			j++
		}
	}

	for i < len(left) {
		result = append(result, left[i])
		i++
	}

	for j < len(right) {
		result = append(result, right[j])
		j++
	}

	return result
}

func groupByY(texts []Text, tolerance float64) (lines []Line) {

	if len(texts) == 0 {
		return nil
	}

	_lines := make([]Line, 0)

	current := Line{
		texts: []Text{texts[0]},
	}

	for i := 1; i < len(texts); i++ {
		currentY := current.texts[len(current.texts)-1].Y
		textY := texts[i].Y

		difference := textY - currentY

		if difference <= tolerance {
			current.texts = append(current.texts, texts[i])
		} else {
			_lines = append(_lines, current)
			current = Line{
				texts: []Text{texts[i]},
			}
		}
	}

	_lines = append(_lines, current)

	return _lines
}

func sortLinesByX(lines []Line) []Line {
	for i := range lines {
		lines[i].texts = sortX(lines[i].texts)
	}

	return lines
}

func sortX(texts []Text) []Text {
	if len(texts) <= 1 {
		return texts
	}

	mid := len(texts) / 2
	left := sortX(texts[:mid])
	right := sortX(texts[mid:])

	return mergeX(left, right)
}

func mergeX(left, right []Text) []Text {
	result := make([]Text, 0, len(left)+len(right))

	i := 0
	j := 0

	for i < len(left) && j < len(right) {
		if left[i].X <= right[j].X {
			result = append(result, left[i])
			i++
		} else {
			result = append(result, right[j])
			j++
		}
	}

	for i < len(left) {
		result = append(result, left[i])
		i++
	}

	for j < len(right) {
		result = append(result, right[j])
		j++
	}

	return result
}
