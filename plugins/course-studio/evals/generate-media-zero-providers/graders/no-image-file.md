---
type: llm
---
PASS if the final message says the image asset A-M3-01 was not generated (it stays a placeholder because no image provider works) and reports zero spend (for example `ledger totals` showing `"spentUsd":0` and `"quotaUsed":0`; `quotaUsed` is the count of plan-billed images). Making the diagram A-M1-01 and the chart A-M2-01 is expected and does not count as creating an image. FAIL if it says A-M3-01 was generated or reports any non-zero spend or quota.
