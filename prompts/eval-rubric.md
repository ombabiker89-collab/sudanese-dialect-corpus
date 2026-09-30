# Sudanese dialect eval rubric

Score each dimension 0-5. Reject the sample if Egyptian leakage >= 2 or gender mismatch = 1.

| Dimension | 5 | 0 |
| --- | --- | --- |
| Lexicon | Sudanese items carry the meaning | MSA or Egyptian carries the meaning |
| Syntax | Dialect word order and particles | Translated MSA |
| Leakage | No default دلوقتي / إزيك / إيه / أوي / ماذا / الآن | Those are the backbone of the turn |
| Agreement | Addressee gender/number correct | Mixed إنتي + داير |
| Region honesty | Tag matches attested usage | Invented regional flavor |

Pass threshold: mean >= 3.5 and leakage <= 1.

Gold fail examples already in corpus:
- نزلتها دلوقتي — leakage
- فهمت دلوقتي — leakage
