#!/bin/sh
# Design Inspect waiter. Blocks until the browser overlay queues a request, then takes the
# whole batch and exits. Claude Code runs it with Bash `run_in_background`, which re-invokes
# the session when the command exits and, unlike a Monitor, never expires. The session
# handles the batch and launches the waiter again (see .claude/skills/inspect/SKILL.md).
cd "$(dirname "$0")/../.." || exit 1
dir=.design-inspect
queue=$dir/queue.jsonl
mkdir -p "$dir"

while [ ! -s "$queue" ]; do
  # Heartbeat: the dev server treats a recently touched marker as "Claude is listening".
  : > "$dir/listening"
  sleep 1
done

# Take the batch in one atomic move; anything sent from here on starts a fresh queue.
batch="$dir/batch-$(date +%s).jsonl"
mv "$queue" "$batch"
echo "DESIGN_INSPECT_BATCH $batch"
cat "$batch"
