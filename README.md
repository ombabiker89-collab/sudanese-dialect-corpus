# Sudanese Dialect Corpus for AI

Open-source project to build a high-quality Sudanese Arabic dialect dataset and resources for training AI models to speak natural Sudanese.

## Goals
- Collect authentic conversational Sudanese Arabic
- Build vocabulary, phrases, and examples
- Create instruction-tuning data for LLMs
- Normalize spelling and regional variations (Khartoum, Darfur, etc.)

## Structure
- `data/`: Raw and cleaned datasets (JSONL)
- `vocab/`: Sudanese-specific words and expressions
- `examples/`: Sample conversations
- `prompts/`: System prompt + eval rubric (the actual product surface for LLMs)
- `app/`: Static prompt-lab UI over the corpus. Open `app/index.html` locally. Not a speech model.
- `skills/sudanese-dialect/`: Agent skill for Grok/Claude-style workflows

## App
Branch `feat/sudanese-accent-app`.
1. Clone the repo
2. Open `app/index.html` in a browser
3. Copy the system prompt into Grok/Claude/GPT
4. Score output with `prompts/eval-rubric.md`
5. Append passing turns to `data/sample_conversations.jsonl`

Current corpus size is 12 JSONL lines. That is a seed, not a training set.

Known leaks in the seed (`دلوقتي`) are labeled in the app. Fix them in a separate PR. Do not pretend they are gold.

## How to contribute
1. Fork the repo
2. Add Sudanese phrases or conversations as JSONL
3. Open a PR

Inspired by projects like Sudaverse and AnwarCS/Sudanese-Arabic-LLM.

License: MIT
