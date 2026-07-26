#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="${ROOT}/dist"
STACK_NAME="${STACK_NAME:-imprintid-apps}"
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}"
PROJECT_NAME="${PROJECT_NAME:-imprintid-apps}"

usage() {
  cat <<EOF
Usage:
  ./scripts/deploy.sh bootstrap   # Create S3 + CloudFront stack
  ./scripts/deploy.sh sync        # Upload public/ and invalidate CDN
  ./scripts/deploy.sh all         # bootstrap + sync

Env:
  STACK_NAME      CloudFormation stack (default: imprintid-apps)
  AWS_REGION      Region for the stack (default: us-east-1)
  PROJECT_NAME    Resource name prefix (default: imprintid-apps)
  DOMAIN_NAME     Optional custom domain
  ACM_CERT_ARN    ACM cert ARN in us-east-1 (required with DOMAIN_NAME)
EOF
}

require_aws() {
  command -v aws >/dev/null 2>&1 || {
    echo "AWS CLI is required. Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
  }
  aws sts get-caller-identity >/dev/null
}

stack_output() {
  local key="$1"
  aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue" \
    --output text
}

bootstrap() {
  require_aws
  local params=(
    "ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME}"
  )
  if [[ -n "${DOMAIN_NAME:-}" ]]; then
    params+=(
      "ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME}"
      "ParameterKey=AcmCertificateArn,ParameterValue=${ACM_CERT_ARN:?ACM_CERT_ARN required when DOMAIN_NAME is set}"
    )
  fi

  echo "Deploying CloudFormation stack: ${STACK_NAME}"
  aws cloudformation deploy \
    --stack-name "${STACK_NAME}" \
    --template-file "${ROOT}/infra/cloudformation.yaml" \
    --parameter-overrides "${params[@]}" \
    --region "${REGION}"

  echo
  echo "Bucket:       $(stack_output BucketName)"
  echo "Distribution: $(stack_output DistributionId)"
  echo "URL:          $(stack_output WebsiteURL)"
}

sync() {
  require_aws
  local bucket distribution
  bucket="$(stack_output BucketName)"
  distribution="$(stack_output DistributionId)"

  if [[ -z "${bucket}" || "${bucket}" == "None" ]]; then
    echo "Stack outputs missing. Run: ./scripts/deploy.sh bootstrap"
    exit 1
  fi

  echo "Building React app…"
  (cd "${ROOT}" && npm run build)

  if [[ ! -d "${PUBLIC_DIR}" ]]; then
    echo "Build output missing: ${PUBLIC_DIR}"
    exit 1
  fi

  echo "Syncing ${PUBLIC_DIR} → s3://${bucket}"
  aws s3 sync "${PUBLIC_DIR}" "s3://${bucket}" \
    --delete \
    --region "${REGION}" \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "index.html"

  aws s3 cp "${PUBLIC_DIR}/index.html" "s3://${bucket}/index.html" \
    --region "${REGION}" \
    --cache-control "public,max-age=60,must-revalidate" \
    --content-type "text/html; charset=utf-8"

  echo "Invalidating CloudFront: ${distribution}"
  aws cloudfront create-invalidation \
    --distribution-id "${distribution}" \
    --paths "/*" >/dev/null

  echo "Live at: $(stack_output WebsiteURL)"
}

cmd="${1:-}"
case "${cmd}" in
  bootstrap) bootstrap ;;
  sync) sync ;;
  all) bootstrap; sync ;;
  *) usage; exit 1 ;;
esac
