<#
fetch_all_branches.ps1
PowerShell helper to fetch all remote branches and optionally create local tracking branches for them.

Usage examples:
  # Fetch remote refs only (safe)
  .\scripts\fetch_all_branches.ps1 -FetchOnly

  # Fetch and create local branches for all origin/* branches
  .\scripts\fetch_all_branches.ps1

  # Fetch and create local branches only for feature/* branches
  .\scripts\fetch_all_branches.ps1 -Pattern 'feature/*'

    # Fetch and create local branches for all remotes, skip prompt and force
    .\scripts\fetch_all_branches.ps1 -AllRemotes -SkipPrompt -Force

#>

# Parameters
param(
    [switch]$AllRemotes = $false,      # If set, iterate over all configured remotes; otherwise just 'origin'
    [string]$Pattern = '*',            # Pattern to match branch names (glob-style, e.g. "feature/*")
    [switch]$FetchOnly = $false,       # If set, only perform 'git fetch --all --prune' and exit
    [switch]$Prune = $true,            # Pass --prune to fetch (default true)
    [switch]$SkipPrompt = $false,      # Skip interactive confirmation
    [switch]$Force = $false            # Force update or overwrite when needed (be careful!)
)

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Check if we're inside a git repository
$gitStatus = & git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Err "Текущая папка не является git-репозиторием. Выполните 'git clone' или перейдите в директорию репозитория."
    exit 1
}

# Build fetch args
$fetchArgs = @('--all')
if ($Prune) { $fetchArgs += '--prune' }

Write-Info "Running: git fetch $($fetchArgs -join ' ')"
& git fetch $fetchArgs
if ($LASTEXITCODE -ne 0) {
    Write-Err "git fetch завершился с ошибкой"
    exit 1
}

if ($FetchOnly) { Write-Info "Fetch complete; exiting (FetchOnly set)."; exit 0 }

# Determine remotes to iterate
$remotes = if ($AllRemotes) { (& git remote) } else { @('origin') }

foreach ($remote in $remotes) {
    Write-Info "Processing remote: $remote"
    # get list of remote branches, exclude HEAD refs
    $rawRemoteBranches = & git branch -r --format "%(refname:short)" | Where-Object { $_ -match "^$remote/" -and $_ -notmatch '->' }
    if (-not $rawRemoteBranches) { Write-Warn "No branches found for remote $remote"; continue }

    foreach ($remoteBranch in $rawRemoteBranches) {
        # remoteBranch looks like 'origin/feature/foo'
        $localBranch = $remoteBranch -replace "^$remote/", ''

        # check pattern matching (glob-like): convert pattern to regex
        # escape regex special characters except *
        $regex = [Regex]::Escape($Pattern) -replace "\\\*", "[\\w\-\/]*"
        if (-not [Regex]::IsMatch($localBranch, "^$regex`$")) { continue }

        # check if local branch exists
        & git show-ref --verify --quiet "refs/heads/$localBranch"
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Local branch '$localBranch' already exists, skipping."
            continue
        }

        if (-not $SkipPrompt) {
            $answer = Read-Host "Create local branch '$localBranch' from '$remoteBranch'? (y/n)"
            if ($answer -ne 'y') { Write-Warn "Skipped $localBranch"; continue }
        }

        # create local branch tracking remote
        Write-Info "Creating local branch '$localBranch' to track '$remoteBranch'"
        & git branch --track $localBranch $remoteBranch
        if ($LASTEXITCODE -ne 0) {
            if ($Force) {
                Write-Warn "Branch creation failed, attempting 'git branch -f' (force)"
                & git branch -f $localBranch $remoteBranch
                if ($LASTEXITCODE -ne 0) { Write-Err "Failed to force-create branch $localBranch" }
            } else {
                Write-Err "Failed to create local branch $localBranch. Use -Force to overwrite existing refs."
            }
        }
    }
}

Write-Info "Done. Use 'git branch' to list local branches or 'git branch -r' to list remote branches." 
