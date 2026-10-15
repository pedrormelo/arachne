---
name: init
description: Creates a CORTEX vault (folders, templates, role registry) and writes the arachne config with the vault path and the spawn backend. Use when the user asks to set up arachne or a CORTEX vault, when ~/.config/arachne/config.json is missing, or to change the vault location or the spawn backend.
---

# Set up a CORTEX vault

1. Ask the user where the vault should live. Suggest `~/cortex-vault`. An existing folder is fine: init never overwrites files, it only adds what is missing.
2. Ask which spawn backend to use, unless the user already said:
   - `orca`: each role runs as a full, visible session in an Orca worktree. Requires the `orca` CLI.
   - `native`: each role runs as a Claude Code subagent in a git worktree. No extra install.
   - Omit `--backend` to pick `orca` when the `orca` CLI is installed and `native` otherwise.
3. Run the init script. It lives in this plugin's `scripts/` folder, two levels above this skill's base directory:

   ```
   node <plugin-root>/scripts/init.mjs --vault <path> [--backend orca|native]
   ```

4. Report the vault path, the backend and the number of files created, from the script output.
5. Suggest next steps:
   - Open the vault in Obsidian (optional).
   - To link a code repository, create its MOC in `10-Projects/` from `99-Templates/project-moc.md` with `repo_root` set. Sessions opened in that repository then load the MOC automatically.
   - Make the vault a git repository, so its history is kept.
