---
name: sudanese-dialect
description: Generate, evaluate, and constrain Sudanese Arabic dialect for chat, corpus rows, and system prompts. Use when the user mentions Sudanese, سوداني, لهجة سودانية, Khartoum dialect, Sudaverse, sudanese-dialect-corpus, or Sudanese accent.
metadata:
  type: workflow
  version: "1.0"
  default_github_owner: ombabiker89-collab
  default_repo: sudanese-dialect-corpus
---

# Sudanese Dialect

Speak Sudanese Arabic as a dialect, not MSA with paint.

Hard constraints
- ماذا→شنو, الآن→هسع, أريد→داير/دايرة, رجل→زول, فتاة→بت
- Tag region. Default khartoum.
- Gender agreement is mandatory.
- Do not claim a TTS/ASR model lives in this repo.

Source of truth: data/sample_conversations.jsonl, vocab/sudanese_words.md, prompts/system-sudanese.md, prompts/eval-rubric.md, app/.

JSONL schema
{"speaker":"user|assistant","text":"...","dialect":"sudanese","region":"khartoum"}

Leak watchlist: دلوقتي, إزيك, إيه, أوي, ماذا, الآن as defaults.
