#!/bin/bash
# This is a student test

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}
DIFF_PERCENT=${DIFF_PERCENT:-0}
STUDENT_DATA="t/ts/d"

cat /dev/null > "$STUDENT_DATA"/global-index.txt

files=("$STUDENT_DATA"/m{1..3}.txt)

for file in "${files[@]}"
do
    cat "$file" | c/merge.js "$STUDENT_DATA"/global-index.txt > "$STUDENT_DATA"/temp-global-index.txt
    mv "$STUDENT_DATA"/temp-global-index.txt "$STUDENT_DATA"/global-index.txt
done


if DIFF_PERCENT=$DIFF_PERCENT t/gi-diff.js <(sort "$STUDENT_DATA"/global-index.txt) <(sort "$STUDENT_DATA"/m4.txt) >&2;
then
    echo "$0 success: global indexes are identical"
    exit 0
else
    echo "$0 failure: global indexes are not identical"
    exit 1
<<<<<<< HEAD
fi
=======
fi
>>>>>>> b0b5e3b (testing)
