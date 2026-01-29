#!/bin/bash
# This is a student test
T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}

STUDENT_DATA="t/ts/d"


if $DIFF <(cat "$STUDENT_DATA"/d1.txt | c/combine.sh | sed 's/\t*$//' | sed 's/\s/ /g' | sort | uniq) \
         <(cat "$STUDENT_DATA"/d2.txt | sed 's/\t*$//' | sed 's/\s/ /g' | sort | uniq) >&2; then
    echo "$0 success: ngrams are identical"
    exit 0
else
    echo "$0 failure: ngrams are not identical"
    exit 1
fi
