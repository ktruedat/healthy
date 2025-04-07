package common

type ApplicationEnvironment string

const (
	ProductionEnvironment  ApplicationEnvironment = "production"
	DevelopmentEnvironment ApplicationEnvironment = "development"
)
