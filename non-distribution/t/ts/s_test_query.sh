#!/bin/bash
# This is a student test

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

<<<<<<< HEAD
cd "$(dirname "$0")/..$R_FOLDER" || exit 1
=======
cd "$(dirname "$0")/../..$R_FOLDER" || exit 1
>>>>>>> b0b5e3b (testing)

DIFF=${DIFF:-diff}
STUDENT_DATA="t/ts/d"

<<<<<<< HEAD
term="stuff"

cat "$STUDENT_DATA"/d11.txt > "$STUDENT_DATA"/global-index.txt


if $DIFF <(./query.js "$term") <(cat "$STUDENT_DATA"/d12.txt) >&2;
then
    echo "$0 success: search results are identical"
    exit 0
else
    echo "$0 failure: search results are not identical"
    exit 1
fi
=======

if $DIFF <(cat "$STUDENT_DATA"/d13.txt | c/stem.js | sort) <(sort "$STUDENT_DATA"/d14.txt) >&2;
then
    echo "$0 success: stemmed words are identical"
    exit 0
else
    echo "$0 failure: stemmed words are not identical"
    exit 1
fi
>>>>>>> b0b5e3b (testing)
