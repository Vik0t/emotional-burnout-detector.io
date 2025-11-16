# fetch_all_branches.ps1

PowerShell helper script to fetch all remote branches and optionally create local branches for them. Use this script in your repository root.

## Recommended workflows

- I recommend using this script when you want a quick, safe way to download all remote refs and selectively create local branches for work.
- For backups or mirrors (server-side), use `git clone --mirror`.

## Quick examples

1) Just fetch all remote refs (safe, doesn't create local branches):

```powershell
.\scripts\fetch_all_branches.ps1 -FetchOnly
```

2) Create local tracking branches for all `origin/*` branches (interactive):

```powershell
.\scripts\fetch_all_branches.ps1
```

3) Create local branches only for `feature/*` branches with no interactive prompts:

```powershell
.\scripts\fetch_all_branches.ps1 -Pattern 'feature/*' -SkipPrompt
```

4) Create local branches from all remotes and force overwrite existing branches (dangerous):

```powershell
.\scripts\fetch_all_branches.ps1 -AllRemotes -SkipPrompt -Force
```

## Safety notes

- The script avoids overwriting local branches by default. Use `-Force` to force creation/overwrite.
- If you don't want local branches created for everything, use `-Pattern` or `-FetchOnly` and create local branches manually when needed.

## PowerShell note

- Run the script in PowerShell (as a normal user). If PowerShell prevents execution due to policy, you can run it with `powershell -ExecutionPolicy RemoteSigned -File .\scripts\fetch_all_branches.ps1` (use caution and follow your organization's policy).
