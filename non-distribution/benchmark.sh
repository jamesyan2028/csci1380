#!/bin/bash
CORPUS_URL="https://cs.brown.edu/courses/csci1380/sandbox/2"
NUM_URLS=4 
TEMP_DATA="d/bench_capture.txt"
INDEX_FILE="d/global-index.txt"

# Reset state
cat /dev/null > d/visited.txt
cat /dev/null > "$INDEX_FILE"
echo "$CORPUS_URL" > d/urls.txt

echo "Benchmarking Crawler"
start=$(date +%s%N)
./crawl.sh "$CORPUS_URL" > "$TEMP_DATA"
end=$(date +%s%N)

crawl_sec=$(echo "scale=3; ($end - $start) / 1000000000" | bc)
throughput=$(echo "scale=2; $NUM_URLS / $crawl_sec" | bc)

echo "Crawler Time: $crawl_sec sec"
echo "Crawler Throughput: $throughput URLs/sec"

echo "Benchmarking Indexer"
start=$(date +%s%N)

./index.sh "$TEMP_DATA" > /dev/null

end=$(date +%s%N)
index_sec=$(echo "scale=3; ($end - $start) / 1000000000" | bc)

latency_per_page=$(echo "scale=3; $index_sec / $NUM_URLS" | bc)

echo "Indexer Time: $index_sec sec"
echo "Indexer Latency: $latency_per_page sec/page"

echo "Benchmarking Query"
start=$(date +%s%N)
node ./query.js "check" > /dev/null
end=$(date +%s%N)

query_sec=$(echo "scale=3; ($end - $start) / 1000000000" | bc)
echo "Query Latency: $query_sec sec/query"

rm -f "$TEMP_DATA"