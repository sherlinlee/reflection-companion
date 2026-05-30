# Configures Supabase Auth for a deployed Vercel URL (run once after deploy).
# Get a token: https://supabase.com/dashboard/account/tokens

param(
  [Parameter(Mandatory = $true)]
  [string]$SiteUrl,
  [string]$ProjectRef = "xrqyfiirymicgkqwxyky",
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

if (-not $AccessToken) {
  Write-Host "Set SUPABASE_ACCESS_TOKEN (Supabase Account > Access Tokens) then run again."
  exit 1
}

$callback = "$($SiteUrl.TrimEnd('/'))/auth/callback"
$body = @{
  site_url = $SiteUrl.TrimEnd('/')
  uri_allow_list = "$callback,http://localhost:3000/auth/callback"
  mailer_autoconfirm = $true
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $AccessToken"
  "Content-Type" = "application/json"
}

Write-Host "Updating Supabase auth for $SiteUrl ..."
Invoke-RestMethod `
  -Method PATCH `
  -Uri "https://api.supabase.com/v1/projects/$ProjectRef/config/auth" `
  -Headers $headers `
  -Body $body

Write-Host "Done. Site URL, redirect URLs, and instant sign-up (no email confirm) are set."
