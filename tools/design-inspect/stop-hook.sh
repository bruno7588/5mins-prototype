#!/bin/sh
# Claude Code Stop hook: once /inspect has armed the waiter, never let a turn end with it
# down. The marker only exists after /inspect (and is removed by /inspect stop); a heartbeat
# older than 15s means the waiter exited (a batch was taken, or it was killed) and was not
# relaunched. Blocks once per stop (stop_hook_active guards the retry) with the fix.
cd "$(dirname "$0")/../.." || exit 0
marker=.design-inspect/listening
[ -f "$marker" ] || exit 0
grep -q '"stop_hook_active": *true' && exit 0
age=$(( $(date +%s) - $(stat -f %m "$marker" 2>/dev/null || stat -c %Y "$marker") ))
[ "$age" -gt 15 ] || exit 0
printf '{"decision":"block","reason":"Design Inspect is armed but its waiter is not running (heartbeat %ss old). Handle any .design-inspect/batch-*.jsonl or queue.jsonl requests, then relaunch it: Bash run_in_background with `sh tools/design-inspect/wait.sh`. If Bruno ran /inspect stop, remove .design-inspect/listening instead."}\n' "$age"
