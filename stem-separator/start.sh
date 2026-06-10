#!/usr/bin/env bash
cd "$(dirname "$0")"
PORT=8765
python3 -m http.server $PORT >/dev/null 2>&1 &
PID=$!
sleep 1
URL="http://localhost:$PORT/"
( command -v open >/dev/null && open "$URL" ) || ( command -v xdg-open >/dev/null && xdg-open "$URL" ) || echo "Open $URL in your browser."
echo "FreqFind Stems running at $URL (PID $PID). Ctrl+C to stop."
trap "kill $PID 2>/dev/null" INT TERM
wait $PID
