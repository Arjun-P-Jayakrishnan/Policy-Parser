package utils

import (
	"fmt"
	"os"
)

var debugFile *os.File

func InitDebugFile(path string) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}

	debugFile = file
	return nil
}

func CloseDebugFile() {
	if debugFile != nil {
		debugFile.Close()
		debugFile = nil
	}
}

func DebugPrint(format string, args ...any) {
	if debugFile == nil {
		return
	}

	fmt.Fprintf(debugFile, format, args...)
}
