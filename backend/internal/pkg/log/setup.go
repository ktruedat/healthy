package log

import (
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/pkgerrors"
)

func setupDevLogger() *zerolog.Logger {
	zerolog.ErrorStackMarshaler = pkgerrors.MarshalStack

	writer := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: "15:04:05",
		NoColor:    false,
	}

	logger := zerolog.New(writer).
		Level(zerolog.TraceLevel).
		With().
		Timestamp().
		CallerWithSkipFrameCount(callersToSkip).
		Logger()

	return &logger
}

func setupProdLogger() *zerolog.Logger {
	logger := zerolog.New(os.Stdout).
		Level(zerolog.InfoLevel).
		With().
		Timestamp().
		Logger()

	return &logger
}
