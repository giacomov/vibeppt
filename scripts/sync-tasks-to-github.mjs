#!/usr/bin/env node

/**
 * sync-tasks-to-github.mjs
 *
 * Mirrors a Claude Code task list to GitHub Issues:
 *   - One parent "epic" issue for the whole task list
 *   - One sub-issue per task, linked to the parent
 *   - "Blocked by" relationships for task dependencies
 *
 * Input JSON format:
 * {
 *   "title": "Parent issue title",
 *   "body": "Optional description",
 *   "tasks": [
 *     { "id": "1", "subject": "Do X", "description": "...", "status": "pending", "dependencies": [] },
 *     { "id": "2", "subject": "Do Y", "description": "...", "status": "pending", "dependencies": ["1"] }
 *   ]
 * }
 *
 * Usage:
 *   node scripts/sync-tasks-to-github.mjs --input=tasks.json
 *   cat tasks.json | node scripts/sync-tasks-to-github.mjs
 *   node scripts/sync-tasks-to-github.mjs --input=tasks.json --repo=owner/repo --dry-run
 *   node scripts/sync-tasks-to-github.mjs --input=tasks.json --project=5
 */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import process from "node:process";

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`Mirror a Claude Code task list to GitHub Issues.

Usage:
  node scripts/sync-tasks-to-github.mjs [options]

Options:
  --input=<file>       Path to task list JSON (default: read from stdin)
  --repo=<owner/repo>  Target repository (default: auto-detected via gh)
  --project=<name>     GitHub Projects v2 name to add all created issues to
  --dry-run            Print actions without making API calls
  --help               Show this help

Input JSON schema:
  {
    "title": "Parent issue title (required)",
    "body": "Optional parent issue description",
    "tasks": [
      {
        "id": "1",
        "subject": "Task title",
        "description": "Detailed description",
        "status": "pending | in_progress | completed",
        "dependencies": ["<other-task-id>", ...]
      }
    ]
  }
`);
}

function parseArgs(argv) {
  const opts = { input: null, repo: null, project: null, dryRun: false };
  for (const arg of argv.slice(2)) {
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg.startsWith("--input=")) {
      opts.input = arg.slice("--input=".length);
    } else if (arg.startsWith("--repo=")) {
      opts.repo = arg.slice("--repo=".length);
    } else if (arg.startsWith("--project=")) {
      opts.project = arg.slice("--project=".length);
    } else {
      console.error(`Unknown argument: ${arg}`);
      printHelp();
      process.exit(1);
    }
  }
  return opts;
}

// ---------------------------------------------------------------------------
// gh helpers
// ---------------------------------------------------------------------------

/**
 * @param {string[]} args
 * @param {{ dryRun?: boolean, dryLabel?: string }} opts
 * @returns {string}
 */
function gh(args, { dryRun = false, dryLabel = "" } = {}) {
  if (dryRun) {
    console.log(`  [dry-run] gh ${args.join(" ")}${dryLabel ? `  # ${dryLabel}` : ""}`);
    return "";
  }
  try {
    return execFileSync("gh", args, { encoding: "utf8" }).trim();
  } catch (err) {
    throw new Error(`gh ${args.join(" ")}\n${err.stderr ?? err.message}`);
  }
}

function resolveRepo(repoFlag, dryRun) {
  if (repoFlag) return repoFlag;
  const result = gh(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], { dryRun: false });
  if (dryRun && !result) return "<owner>/<repo>";
  return result;
}

/** Create a GitHub issue and return { number, url, databaseId }. */
function createIssue(repo, title, body, dryRun) {
  const url = gh(
    ["issue", "create", "--repo", repo, "--title", title, "--body", body],
    { dryRun, dryLabel: `create issue: ${title}` }
  );
  if (dryRun) return { number: 0, url: "", databaseId: 0 };
  // gh issue create prints the URL, e.g. https://github.com/owner/repo/issues/42
  const match = url.match(/\/issues\/(\d+)$/);
  if (!match) throw new Error(`Unexpected gh issue create output: ${url}`);
  const number = parseInt(match[1], 10);
  // The sub-issues API requires the internal database ID, not the issue number.
  const [owner, repoName] = repo.split("/");
  const databaseId = parseInt(
    gh(["api", `repos/${owner}/${repoName}/issues/${number}`, "-q", ".id"]),
    10
  );
  return { number, url, databaseId };
}

/**
 * Resolve a Projects v2 name to its number. Throws if not found.
 * @param {string} owner
 * @param {string} projectName
 * @returns {number}
 */
function resolveProject(owner, projectName) {
  const raw = gh(["project", "list", "--owner", owner, "--format", "json", "--limit", "500"]);
  const { projects } = JSON.parse(raw);
  const match = projects.find((p) => p.title === projectName);
  if (!match) {
    const names = projects.map((p) => `  • ${p.title}`).join("\n");
    throw new Error(
      `Project "${projectName}" not found for owner "${owner}".\nAvailable projects:\n${names || "  (none)"}`
    );
  }
  return match.number;
}

/** Add an issue to a GitHub Projects v2 board by project number. */
function addToProject(owner, projectNumber, issueUrl, dryRun) {
  gh(
    ["project", "item-add", String(projectNumber), "--owner", owner, "--url", issueUrl],
    { dryRun, dryLabel: `add ${issueUrl} to project #${projectNumber} (${owner})` }
  );
}

/** Ensure the "in-progress" label exists in the repo, then apply it to an issue. */
function addInProgressLabel(repo, issueNumber, dryRun) {
  if (!dryRun) {
    // gh label list returns all labels; check if "in-progress" is already there.
    const labelList = gh(["label", "list", "--repo", repo, "--json", "name", "--jq", ".[].name"]);
    const labelExists = labelList.split("\n").map((s) => s.trim()).includes("in-progress");
    if (!labelExists) {
      gh([
        "label", "create", "in-progress", "--repo", repo,
        "--color", "0075ca",
        "--description", "Work is actively being driven by the epic driver",
      ]);
    }
  }
  gh(
    ["issue", "edit", String(issueNumber), "--repo", repo, "--add-label", "in-progress"],
    { dryRun, dryLabel: `add in-progress label to #${issueNumber}` }
  );
}

/** Add a sub-issue to parentNumber. childDatabaseId is the issue's internal database ID. */
function addSubIssue(repo, parentNumber, childDatabaseId, childNumber, dryRun) {
  const [owner, repoName] = repo.split("/");
  gh(
    [
      "api",
      "--preview", "issues",
      `repos/${owner}/${repoName}/issues/${parentNumber}/sub_issues`,
      "--method", "POST",
      "-F", `sub_issue_id=${childDatabaseId}`,
    ],
    { dryRun, dryLabel: `add #${childNumber} (id ${childDatabaseId}) as sub-issue of #${parentNumber}` }
  );
}

/** Mark blockedIssueNumber as blocked by blockingIssueNumber.
 *  Both *DatabaseId params are internal database IDs, not issue numbers. */
function addBlockedBy(repo, blockedIssueNumber, blockedDatabaseId, blockingIssueNumber, blockingDatabaseId, dryRun) {
  const [owner, repoName] = repo.split("/");
  gh(
    [
      "api",
      `repos/${owner}/${repoName}/issues/${blockedIssueNumber}/dependencies/blocked_by`,
      "--method", "POST",
      "-F", `issue_id=${blockingDatabaseId}`,
    ],
    { dryRun, dryLabel: `mark #${blockedIssueNumber} blocked by #${blockingIssueNumber}` }
  );
}

// ---------------------------------------------------------------------------
// Input reading & validation
// ---------------------------------------------------------------------------

function readInput(inputPath) {
  let raw;
  if (inputPath) {
    raw = readFileSync(inputPath, "utf8");
  } else {
    if (process.stdin.isTTY) {
      console.error("No --input file specified and stdin is a TTY. Provide a file or pipe JSON.");
      process.exit(1);
    }
    raw = readFileSync("/dev/stdin", "utf8");
  }
  return JSON.parse(raw);
}

function validate(data) {
  if (!data.title || typeof data.title !== "string") {
    throw new Error('Input JSON must have a "title" string field.');
  }
  if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
    throw new Error('Input JSON must have a non-empty "tasks" array.');
  }
  const ids = new Set(data.tasks.map((t) => t.id));
  for (const task of data.tasks) {
    if (!task.id) throw new Error(`Task missing "id": ${JSON.stringify(task)}`);
    if (!task.subject) throw new Error(`Task ${task.id} missing "subject".`);
    for (const dep of task.dependencies ?? []) {
      if (!ids.has(dep)) {
        throw new Error(`Task ${task.id} has unknown dependency "${dep}".`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Status label for issue body
// ---------------------------------------------------------------------------

const STATUS_EMOJI = { pending: "⬜", in_progress: "🔄", completed: "✅" };

function taskBody(task) {
  const emoji = STATUS_EMOJI[task.status] ?? "⬜";
  const lines = [];
  if (task.description) lines.push(task.description, "");
  lines.push(`**Status:** ${emoji} \`${task.status ?? "pending"}\``);
  if (task.dependencies?.length) {
    lines.push(`**Depends on task IDs:** ${task.dependencies.join(", ")}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv);

  let data;
  try {
    data = readInput(opts.input);
    validate(data);
  } catch (err) {
    console.error(`Input error: ${err.message}`);
    process.exit(1);
  }

  const repo = resolveRepo(opts.repo, opts.dryRun);
  const owner = repo.split("/")[0];
  console.log(`\nRepository: ${repo}`);
  console.log(`Tasks: ${data.tasks.length}`);
  if (opts.dryRun) console.log("Mode: dry-run (no API calls)\n");

  // Resolve project name → number before touching any issues.
  let projectNumber = null;
  if (opts.project) {
    if (opts.dryRun) {
      console.log(`  [dry-run] resolve project name "${opts.project}" for owner "${owner}"`);
    } else {
      try {
        projectNumber = resolveProject(owner, opts.project);
        console.log(`Project: "${opts.project}" → #${projectNumber}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    }
  }

  const failures = [];

  // 1. Create parent issue
  console.log(`\n── Creating parent issue: "${data.title}"`);
  let parentNumber;
  try {
    const { number, url } = createIssue(
      repo,
      data.title,
      data.body ?? `Task list with ${data.tasks.length} items.`,
      opts.dryRun
    );
    parentNumber = number;
    if (!opts.dryRun) console.log(`   → #${parentNumber}`);
    if (projectNumber && url) {
      try {
        addToProject(owner, projectNumber, url, opts.dryRun);
      } catch (err) {
        console.warn(`   WARNING: could not add parent to project: ${err.message}`);
        failures.push({ step: "add parent issue to project", error: err.message });
      }
    }
  } catch (err) {
    console.error(`   FAILED: ${err.message}`);
    process.exit(1);
  }

  // 2. Create one issue per task; build id → { number, databaseId } map
  console.log("\n── Creating task issues");
  /** @type {Map<string, { number: number, databaseId: number }>} */
  const issueMap = new Map();

  for (const task of data.tasks) {
    console.log(`   [${task.id}] ${task.subject}`);
    try {
      const { number, url, databaseId } = createIssue(repo, task.subject, taskBody(task), opts.dryRun);
      issueMap.set(task.id, { number, databaseId });
      if (!opts.dryRun) console.log(`         → #${number}`);
      if (projectNumber && url) {
        try {
          addToProject(owner, projectNumber, url, opts.dryRun);
        } catch (err) {
          console.warn(`         WARNING: could not add to project: ${err.message}`);
          failures.push({ step: `add task ${task.id} to project`, error: err.message });
        }
      }
    } catch (err) {
      console.error(`         FAILED: ${err.message}`);
      failures.push({ step: `create issue for task ${task.id}`, error: err.message });
    }
  }

  // 3. Link each task issue as a sub-issue of the parent
  console.log("\n── Linking sub-issues to parent");
  for (const task of data.tasks) {
    const entry = issueMap.get(task.id);
    if (entry === undefined) continue; // creation failed earlier
    const { number: childNumber, databaseId: childDatabaseId } = entry;
    console.log(`   #${opts.dryRun ? "(new)" : childNumber} → sub-issue of #${opts.dryRun ? "(parent)" : parentNumber}`);
    try {
      addSubIssue(repo, parentNumber, childDatabaseId, childNumber, opts.dryRun);
    } catch (err) {
      console.error(`   FAILED: ${err.message}`);
      failures.push({ step: `sub-issue link for task ${task.id}`, error: err.message });
    }
  }

  // 4. Wire blocked-by edges
  const depEdges = data.tasks.flatMap((task) =>
    (task.dependencies ?? []).map((depId) => ({ blocked: task.id, blocking: depId }))
  );

  if (depEdges.length > 0) {
    console.log("\n── Adding blocked-by relationships");
    for (const { blocked, blocking } of depEdges) {
      const blockedEntry = issueMap.get(blocked);
      const blockingEntry = issueMap.get(blocking);
      if (!blockedEntry || !blockingEntry) continue;
      console.log(
        `   #${opts.dryRun ? `(${blocked})` : blockedEntry.number} blocked by #${opts.dryRun ? `(${blocking})` : blockingEntry.number}`
      );
      try {
        addBlockedBy(repo, blockedEntry.number, blockedEntry.databaseId, blockingEntry.number, blockingEntry.databaseId, opts.dryRun);
      } catch (err) {
        // The dependencies API may not be available on all plans/repos.
        const msg = err.message.includes("404") || err.message.includes("Not Found")
          ? `dependencies API not available for this repo (${err.message.split("\n")[0]})`
          : err.message;
        console.warn(`   WARNING: ${msg}`);
        failures.push({ step: `blocked-by task ${blocked} → task ${blocking}`, error: msg });
      }
    }
  }

  // 5. Add "in-progress" label to parent epic so the epic driver picks it up
  console.log("\n── Marking epic as in-progress");
  try {
    addInProgressLabel(repo, parentNumber, opts.dryRun);
    if (!opts.dryRun) console.log(`   → added "in-progress" label to #${parentNumber}`);
  } catch (err) {
    console.warn(`   WARNING: could not add in-progress label: ${err.message}`);
    failures.push({ step: "add in-progress label to parent", error: err.message });
  }

  // 6. Summary
  console.log("\n── Summary");
  if (!opts.dryRun) {
    console.log(`   Parent issue: https://github.com/${repo}/issues/${parentNumber}`);
    for (const task of data.tasks) {
      const entry = issueMap.get(task.id);
      if (entry !== undefined) {
        console.log(`   [${task.id}] ${task.subject.slice(0, 60)} → #${entry.number}`);
      }
    }
  }
  if (failures.length > 0) {
    console.log(`\n   ${failures.length} failure(s):`);
    for (const f of failures) console.log(`   • ${f.step}: ${f.error}`);
    process.exit(1);
  } else {
    console.log("   All steps completed successfully.");
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
