#!/bin/bash

# Location of the data directory
DATA_DIR=$(realpath ../data)

# Current directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Script directory: $SCRIPT_DIR"
echo "Data directory: $DATA_DIR"
echo "Files in data directory:"
ls -la "$DATA_DIR"

# Build the import tool
echo "Building import tool..."
go build -o data_import data_import.go

# Run the import tool with the specified data directory
echo "Running import tool..."
./data_import -data="$DATA_DIR" -host="localhost" -port="9000" -db="healthisis"
