#!/bin/bash

# Directory containing Kubernetes manifest files
# cd ./manifests
MANIFESTS_DIR="`pwd`/manifests"
# KUBECONFIG=/var/jenkins_home/jobs/network_web_app/workspace/.kube/config
# Check if the directory exists
if [ ! -d "$MANIFESTS_DIR" ]; then
  echo "Error: Directory $MANIFESTS_DIR not found."
  exit 1
fi
# Validate the mode argument
if [ "$1" != "apply" ] && [ "$1" != "delete" ]; then
  echo "Usage: $0 <apply|delete>"
  exit 1
fi

MODE=$1
# Apply all YAML files in the directory
for FILE in "$MANIFESTS_DIR"/*.yaml "$MANIFESTS_DIR"/*.yml; do
  if [ -f "$FILE" ]; then
    echo "Applying manifest: $FILE"
    kubectl "$MODE" -f "$FILE"  --kubeconfig=${KUBECONFIG}
    if [ $? -ne 0 ]; then
      echo "Error: Failed to $MODE $FILE"
      exit 1
    fi
#   else
#     echo "No YAML files found in $MANIFESTS_DIR"
#     exit 1
  fi
done

echo "All manifests $MODE ed successfully."
