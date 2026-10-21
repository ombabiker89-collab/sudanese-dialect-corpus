---
name: dialect-eval
description: Score Sudanese dialect generations against a fixed rubric and a failing-test set. Use when the user wants a marketable AI skill, eval harness, prompt regression, leakage check, or a portfolio artifact beyond chat prompting. Do not use to claim a speech model.
metadata:
  type: workflow
  version: "1.0"
  pairs_with: sudanese-dialect
  default_github_owner: ombabiker89-collab
  default_repo: sudanese-dialect-corpus
---

# Dialect eval

The sellable unit is domain corpus + checkable constraints + a failing-test set. A prompt with no regression set is a chat transcript.

## When to run

- A new system prompt is proposed for Sudanese output.
- A model reply is a candidate corpus row.
- The user asks what AI skill to build next for a portfolio.

## Procedure

1. Read `prompts/eval-rubric.md` and `data/leak_failset.jsonl`. Do not edit `data/sample_conversations.jsonl` in place.
2. Scan the candidate for leak tokens: دلوقتي, إزيك, إيه, أوي, كدة, النهاردة, فين, ماذا, الآن. اشطة is a loan, not a leak.
3. Check gender agreement against the stated addressee.
4. Score lexicon, syntax, leakage, agreement, region honesty, each 0-5.
5. Reject if mean < 3.5, leakage score < 4, leak hits >= 2, or gender mismatch.
6. Emit the score as JSON. Do not append a failing row to the gold file.

## Portfolio framing

Title the artifact "dialect eval harness", not "prompt engineer". Pair it with:
- the static lab in `app/`
- the fail set
- one PR that fixes a labeled leak without rewriting contributor spelling elsewhere

Standalone prompt-engineer titles are not the market. Eval, tool use, and a domain corpus are.
