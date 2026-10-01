# Prompting patterns that survive a model swap

Applied to this repo. Not a general course.

1. Numbered constraints that a scanner can check. "Sound Sudanese" fails this. "هسع not دلوقتي" passes it.
2. Output contract. One JSONL object, fixed keys. Free prose is not a corpus row.
3. Few-shot from this corpus only. Two clean turns, two labeled fails. External textbook examples do not encode the house dialect.
4. Explicit negatives. Leak list in `skills/dialect-eval/SKILL.md`.
5. Fixed eval set replayed on every prompt or model change. Vibes are not a metric.

Brittle and not used here: "think step by step" as a quality substitute, tone adjectives, jailbreak-style role play, claiming the draft is a speech model.

Pass rule lives in `prompts/eval-rubric.md`.
