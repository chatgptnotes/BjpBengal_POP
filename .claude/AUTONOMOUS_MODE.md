# Autonomous Mode Configuration

This directory contains configurations for running Claude Code in fully autonomous mode.

## Available Commands

### `/autonomous`
Activates full autonomous development mode. Claude will:
- Make all decisions independently
- Never ask for confirmation
- Proceed through entire feature development
- Build, test, and deploy without stopping
- Document changes automatically

**Usage:**
```
/autonomous
```

Then describe your feature or task.

### `/yes`
Quick auto-approve mode for immediate execution.
Pre-approves all operations for the current session.

**Usage:**
```
/yes
```

## Master Document

See `claude.md` in the project root for the complete autonomous operation guide.

## Key Principles

1. **No Confirmations** - All operations are pre-approved
2. **Independent Decisions** - Claude chooses the best path
3. **Verifiable Increments** - Test after each change
4. **Production Quality** - Always ship production-ready code
5. **Auto Documentation** - Changes are documented automatically

## Version Management

Every git push increments version:
- First push: 1.0
- Subsequent: 1.1, 1.2, 1.3...
- Footer shows: Version | Date | Repo Name

## Design Standards

- **No Emojis** - Use Google Material Icons pack
- **Footer Required** - Version, date, repo name (grayed out)
- **Testing Links** - Always provide localhost:PORT after completion

## Quality Gates

- Zero TypeScript/ESLint errors
- All tests passing
- No secrets in code
- Input validation
- Error handling
- Documentation complete

## Example Workflow

```bash
# User activates autonomous mode
/autonomous

# User describes feature
"Build a user dashboard with profile settings and activity feed"

# Claude proceeds autonomously:
# 1. Plans architecture
# 2. Creates components
# 3. Implements features
# 4. Writes tests
# 5. Builds project
# 6. Commits changes
# 7. Suggests testing: http://localhost:5173/dashboard
```

## Safety Notes

While autonomous mode bypasses confirmations:
- Code is still reviewed for security
- No destructive operations without explicit request
- Secrets are never committed
- Best practices are maintained
- Documentation is always provided

## Customization

Edit the commands in `.claude/commands/` to adjust behavior:
- `autonomous.md` - Full autonomous mode
- `yes.md` - Quick auto-approve

Add new commands as needed for your workflow.
