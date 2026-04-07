#!/usr/bin/env node

/**
 * find-epic-work.mjs
 *
 * Called by .github/workflows/epic-driver.yml. Finds the relevant epic and its
 * currently unblocked open sub-issues, then writes a Claude Code prompt to
 * $GITHUB_OUTPUT (or stdout when run locally for testing).
 *
 * Required environment variables:
 *   GH_TOKEN          GitHub token (set automatically in Actions)
 *   GITHUB_REPOSITORY owner/repo  (set automatically in Actions)
 *   EVENT_NAME        'issues' | 'pull_request' | 'workflow_dispatch'
 *   ISSUE_NUMBER      issue number (when EVENT_NAME=issues or workflow_dispatch)
 *   PR_BODY           PR body text (when EVENT_NAME=pull_request)
 *
 * Outputs (written to $GITHUB_OUTPUT, or printed to stdout for local testing):
 *   has_work          'true' | 'false'
 *   prompt            the prompt string (only when has_work=true)
 *
 * Local testing example:
 *   EVENT_NAME=issues ISSUE_NUMBER=14 GITHUB_REPOSITORY=owner/repo \
 *     node scripts/find-epic-work.mjs
 */

import { execFileSync, execSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import process from "node:process";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const REPO       = process.env.GITHUB_REPOSITORY;  // "owner/repo"
const EVENT      = process.env.EVENT_NAME;
const ISSUE_NUM  = process.env.ISSUE_NUMBER ? parseInt(process.env.ISSUE_NUMBER, 10) : null;
const PR_BODY    = process.env.PR_BODY ?? "";

if (!REPO)  fatal("GITHUB_REPOSITORY is not set.");
if (!EVENT) fatal("EVENT_NAME is not set.");

const [OWNER, REPO_NAME] = REPO.split("/");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fatal(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function info(msg) {
  console.log(msg);
}

/** Run a gh command and return trimmed stdout. Throws on non-zero exit. */
function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

/** gh api GET, returns parsed JSON. */
function ghGet(path) {
  return JSON.parse(gh(["api", path]));
}

/** gh graphql query, returns parsed JSON response.data. */
function ghGraphQL(query, variables = {}) {
  const varArgs = Object.entries(variables).flatMap(([k, v]) => ["-F", `${k}=${v}`]);
  const result = JSON.parse(
    gh(["api", "graphql", "-f", `query=${query}`, ...varArgs])
  );
  if (result.errors) throw new Error(result.errors.map(e => e.message).join("; "));
  return result.data;
}

/** Write a key=value pair to $GITHUB_OUTPUT, or print to stdout locally. */
function setOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    // Multiline values use the heredoc syntax required by GitHub Actions.
    const delimiter = "EOF_" + key.toUpperCase();
    appendFileSync(outputFile, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
  } else {
    console.log(`\n[output] ${key}=\n${value}`);
  }
}

// ---------------------------------------------------------------------------
// Step 1: Resolve the epic issue number
// ---------------------------------------------------------------------------

async function resolveEpicNumber() {
  if (EVENT === "issues") {
    if (!ISSUE_NUM) fatal("ISSUE_NUMBER is required for the 'issues' event.");
    return ISSUE_NUM;
  }

  if (EVENT === "pull_request") {
    // Parse "closes/fixes/resolves #N" from the PR body.
    const closingRe = /(?:closes?|fixes?|resolves?)\s+#(\d+)/gi;
    const closedNumbers = [];
    let m;
    while ((m = closingRe.exec(PR_BODY)) !== null) {
      closedNumbers.push(parseInt(m[1], 10));
    }

    if (closedNumbers.length === 0) {
      info("PR body contains no closing references — nothing to do.");
      return null;
    }

    info(`PR closes: ${closedNumbers.map(n => "#" + n).join(", ")}`);

    // Try GraphQL parent lookup for each closed issue.
    const parentQuery = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $number) {
            parent {
              number
              labels(first: 20) { nodes { name } }
            }
          }
        }
      }
    `;

    for (const n of closedNumbers) {
      try {
        const data = ghGraphQL(parentQuery, { owner: OWNER, repo: REPO_NAME, number: n });
        const parent = data.repository.issue.parent;
        if (parent && parent.labels.nodes.some(l => l.name === "in-progress")) {
          info(`Found epic #${parent.number} via GraphQL parent of #${n}.`);
          return parent.number;
        }
      } catch (e) {
        info(`GraphQL parent lookup failed for #${n}: ${e.message}`);
      }
    }

    // Fallback: search open issues labeled "in-progress" and check their sub-issues.
    info("GraphQL parent lookup found nothing — falling back to label search.");
    const candidates = JSON.parse(
      gh(["issue", "list", "--repo", REPO, "--state", "open",
          "--label", "in-progress", "--json", "number", "--limit", "50"])
    );

    for (const { number } of candidates) {
      const subs = ghGet(`repos/${REPO}/issues/${number}/sub_issues`);
      const subNumbers = subs.map(s => s.number);
      if (closedNumbers.some(n => subNumbers.includes(n))) {
        info(`Found epic #${number} via sub-issue membership.`);
        return number;
      }
    }

    info("Could not find an in-progress epic for this PR — nothing to do.");
    return null;
  }

  if (EVENT === "workflow_dispatch") {
    if (!ISSUE_NUM) fatal("issue_number input is required for workflow_dispatch.");
    return ISSUE_NUM;
  }

  fatal(`Unknown EVENT_NAME: "${EVENT}"`);
}

// ---------------------------------------------------------------------------
// Step 2: Find unblocked open sub-issues
// ---------------------------------------------------------------------------

function findUnblockedSubIssues(epicNumber) {
  const subs = ghGet(`repos/${REPO}/issues/${epicNumber}/sub_issues`);
  const openSubs = subs.filter(s => s.state === "open");

  if (openSubs.length === 0) return [];

  const unblocked = [];
  for (const sub of openSubs) {
    const blockers = ghGet(`repos/${REPO}/issues/${sub.number}/dependencies/blocked_by`);
    const openBlockers = blockers.filter(b => b.state === "open");
    if (openBlockers.length === 0) {
      unblocked.push(sub);
    }
  }
  return unblocked;
}

// ---------------------------------------------------------------------------
// Step 3: Build the Claude Code prompt
// ---------------------------------------------------------------------------

function buildPrompt(epic, unblocked) {
  const issueList = unblocked
    .map(u => `- #${u.number}: ${u.title}\n${(u.body ?? "").trim()}`)
    .join("\n\n");

  return `\
You are working on the GitHub repository ${REPO}.

EPIC #${epic.number}: ${epic.title}
${(epic.body ?? "").trim()}

The following sub-issues are ready to be implemented (all their blockers are resolved):

${issueList}

Instructions:
1. Implement the changes required to complete each issue listed above.
2. You may use parallel sub-agents if that helps complete the work faster.
3. When done, open a single pull request targeting the main branch.
4. The PR body MUST include "closes #<number>" for every issue you have addressed.
5. Do not work on issues that are not listed above.
6. After finishing your work on each issue (whether or not you made changes), post a comment on that issue summarizing what was done and why. If no changes were needed, explain why the issue was already resolved or did not require action.
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const epicNumber = await resolveEpicNumber();

if (!epicNumber) {
  setOutput("has_work", "false");
  process.exit(0);
}

info(`Epic: #${epicNumber}`);

const epic = ghGet(`repos/${REPO}/issues/${epicNumber}`);
const unblocked = findUnblockedSubIssues(epicNumber);

if (unblocked.length === 0) {
  info("No unblocked sub-issues — waiting for blockers to resolve.");
  setOutput("has_work", "false");
  process.exit(0);
}

info(`Unblocked: ${unblocked.map(u => "#" + u.number).join(", ")}`);

const prompt = buildPrompt(epic, unblocked);
setOutput("has_work", "true");
setOutput("prompt", prompt);
