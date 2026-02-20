#!/bin/bash
# This is a student test
T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

<<<<<<< HEAD
T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

=======
>>>>>>> b0b5e3b (testing)
cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}
STUDENT_DATA="t/ts/d"
<<<<<<< HEAD


if $DIFF <(cat "$STUDENT_DATA"/d3.txt | c/getText.js | sort) <(sort "$STUDENT_DATA"/d4.txt) >&2;
then
    echo "$0 success: texts are identical"
    exit 0
else
    echo "$0 failure: texts are not identical"
    exit 1
fi
=======
url="https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/level_2a/index.html"


if ! $DIFF <(cat "$STUDENT_DATA"/d5.txt | c/getURLs.js "$url" | sort) <(sort "$STUDENT_DATA"/d6.txt) >&2;
then
    echo "$0 failure: URL sets are not identical (d5/d6)"
    exit 1
fi

echo "$0 success: URL sets are identical"
exit 0
>>>>>>> b0b5e3b (testing)
