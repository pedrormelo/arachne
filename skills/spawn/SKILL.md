---
name: spawn
description: Runs a CORTEX role (senior-engineer, tech-architect, qa-engineer, etc.) as a separate agent in its own git worktree of the project, delegated through an INVOKE block in the project MOC and reported back through a HANDOFF or BLOCKED block. Supports two backends, Orca sessions or native Claude Code subagents. Use when the orchestrator delegates work to a role, or when the user asks to spawn, check on, or clean up a role agent.
---

# Spawn a CORTEX role

Read `~/.config/arachne/config.json` for `vaultPath` and `spawnBackend`. If the file is missing, tell the user to run `/arachne:init` and stop.

## Preconditions

1. The project MOC `10-Projects/{slug}.md` exists, with `repo_root` set to the code repository.
2. The role file exists in `90-Agents/`.
3. The MOC's `🔁 Coordination` section ends with a `📋 INVOKE` block addressed to that role, with goal, context, constraints, deliverable and done-when. Write it first if it is missing: the agent reads its task from there, not from your prompt.

Pick a short task slug for names, for example `auth-refresh`. Every spawn needs these four absolute paths for the agent prompt:

```
Vault: {vaultPath}
MOC: {vaultPath}/10-Projects/{slug}.md
Role file: {vaultPath}/90-Agents/{NN}-{role}.md
Worktree: {worktree path}
```

## Choose the backend

- `spawnBackend: "orca"`: run `orca status --json`. If the command fails or the runtime is not reachable, tell the user that Orca is not available and use the native backend for this spawn.
- `spawnBackend: "native"`: use the native backend.

## Native backend

1. Create the worktree from the project repository. This works from any session directory:

   ```
   git -C {repo_root} worktree add {repo_root}/.arachne/worktrees/{role}-{task} -b arachne/{role}-{task}
   ```

   If `.arachne/` is not yet listed in `{repo_root}/.git/info/exclude`, add it there, so the worktree folder never shows up as untracked.
2. Call the Agent tool with `subagent_type: "arachne:agent"`. Do not set `isolation`: Claude Code would branch the repository of the current session, which may be the vault. Pass the four paths as the prompt. Run independent roles in parallel with `run_in_background`.
3. When the agent returns, continue at "After the agent finishes".

## Orca backend

1. Make sure Orca knows the repository: if `orca repo list --json` does not include `{repo_root}`, run `orca repo add --path {repo_root}`. Then create the worktree. `--no-parent` keeps Orca from filing it under the session you are running in:

   ```
   orca worktree create --name {role}-{task} --repo path:{repo_root} --no-parent --json
   ```

   Keep the worktree path from the JSON output.
2. Open a session running the worker agent:

   ```
   orca terminal create --worktree path:{worktree} --title {role}-{task} --command "claude --agent arachne:agent" --json
   ```

   Keep the terminal handle.
3. Wait until the session is ready for input. Read it with `orca terminal read --terminal {handle} --limit 30` every few seconds. `orca terminal wait --for tui-idle` is not enough, because it also returns while a dialog is open.
   - **Folder trust prompt** ("Is this a project you created or one you trust?"): the worktree is a fresh checkout of the project the user asked you to work on. Tell the user you are accepting it, then send a down arrow (`--text $'\e[B'`) followed by an Enter (`--text "" --enter`).
   - **Any other dialog:** show its text to the user and ask what to choose. Never pick an option that grants new permissions on your own.
   - The session is ready when the input prompt `❯` shows with `arachne:agent` in the status line.
4. Count the closing blocks already in the MOC, then send the four paths:

   ```
   node <plugin-root>/scripts/wait-block.mjs {moc}
   orca terminal send --terminal {handle} --text "<the four paths, on one line>" --enter
   ```

   `<plugin-root>` is two levels above this skill's base directory.
5. Monitor the MOC, not the terminal. Run the wait script in the background, with the count from step 4:

   ```
   node <plugin-root>/scripts/wait-block.mjs {moc} {count} 1800
   ```

   It prints the first new `📤 HANDOFF`, `⚠️ BLOCKED` or `✅ DONE` block, or exits with status 1 after the timeout in seconds. Use it instead of grep: emoji matching is unreliable in some shells. While waiting, read the terminal now and then to catch permission prompts, and relay them to the user. Report only state changes. The user can open the terminal in Orca and talk to the role directly.
6. After the block appears, close the session: `orca terminal close --terminal {handle}`.

## After the agent finishes

1. Read the newest block the agent appended to the MOC.
   - `⚠️ BLOCKED`: relay the question to the user, mirror it in `⚠️ Active blockers`, and stop.
   - `📤 HANDOFF`: review the changes with `git -C {worktree} status` and `git -C {worktree} diff`.
2. The worker does not commit. Summarize the changes for the user and commit in the worktree only after the user approves. Merging the branch is the user's call.
3. When the branch is merged or discarded, remove the worktree: `git -C {repo_root} worktree remove {worktree}` (native) or `orca worktree rm --worktree path:{worktree}` (Orca).
4. Log the result in the MOC and decide the next step: a new INVOKE, or a `✅ DONE` that closes the chain.

## Rules

- One orchestrator per project. To parallelize, spawn several roles, never a second orchestrator.
- Spawn roles in parallel only when neither needs the other's output.
- Messages and terminals are only transport. Decisions, handoffs and blockers count only once they are written in the MOC.
