#!/bin/bash
# This is a student test
#!/bin/bash
T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}
STUDENT_DATA="t/ts/d"


if $DIFF <(cat "$STUDENT_DATA"/d9.txt | c/process.sh | sort) <(sort "$STUDENT_DATA"/d10.txt) >&2;
then
    echo "$0 success: texts are identical"
    exit 0
else
    echo "$0 failure: texts are not identical"
    exit 1
fi
