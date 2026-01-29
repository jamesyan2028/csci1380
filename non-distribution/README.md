# non-distribution

This milestone aims (among others) to refresh (and confirm) everyone's
background on developing systems in the languages and libraries used in this
course.

By the end of this assignment you will be familiar with the basics of
JavaScript, shell scripting, stream processing, Docker containers, deployment
to AWS, and performance characterization—all of which will be useful for the
rest of the project.

Your task is to implement a simple search engine that crawls a set of web
pages, indexes them, and allows users to query the index. All the components
will run on a single machine.

## Getting Started

To get started with this milestone, run `npm install` inside this folder. To
execute the (initially unimplemented) crawler run `./engine.sh`. Use
`./query.js` to query the produced index. To run tests, do `npm run test`.
Initially, these will fail.

### Overview

The code inside `non-distribution` is organized as follows:

```
.
├── c            # The components of your search engine
├── d            # Data files like seed urls and the produced index
├── s            # Utility scripts for linting your solutions
├── t            # Tests for your search engine
├── README.md    # This file
├── crawl.sh     # The crawler
├── index.sh     # The indexer
├── engine.sh    # The orchestrator script that runs the crawler and the indexer
├── package.json # The npm package file that holds information like JavaScript dependencies
└── query.js     # The script you can use to query the produced global index
```

### Submitting

To submit your solution, run `./scripts/submit.sh` from the root of the stencil. This will create a
`submission.zip` file which you can upload to the autograder.

# M0: Setup & Centralized Computing

> Add your contact information below and in `package.json`.

* name: James Yan

* email: james_yan2@brown.edu

* cslogin: jyan84


## Summary

> Summarize your implementation, including the most challenging aspects; remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete M0 (`hours`), the total number of JavaScript lines you added, including tests (`jsloc`), the total number of shell lines you added, including for deployment and testing (`sloc`).


My implementation consists of 6 components addressing T1--8. My implementation follows the structure outlined in the handout, utilizing a crawler to extract additional links and text, text preprocessing by converting to ascii, making words lowercase, and removing stopwords, converting words to their stems, and aggregating frequencies. Querying also follows the same text preprocessing and uses exact Regex matching to find exact matches, as well bigrams and tregrams with exact matches. The most challenging aspect was removing added carriage returns from the end of file names due to windows because there was not much documentation regarding this issue in the handout and I had to go to office hours and post on ed to get it fixed.


## Correctness & Performance Characterization


> Describe how you characterized the correctness and performance of your implementation.
I wrote a new script, benchmark.sh that records the time it takes to crawl, index, and then query https://cs.brown.edu/courses/csci1380/sandbox/2. By dividing by the number of urls/words/queries, I could then calculate the latency and take the reciprical of that to get the throughput.

To characterize correctness, we developed 9 that test the following cases: empty input (such as websites with no additional links) as well as websites with multiple links to the same page.


*Performance*: The throughput of various subsystems is described in the `"throughput"` portion of package.json. The characteristics of my development machines are summarized in the `"dev"` portion of package.json.


## Wild Guess

> How many lines of code do you think it will take to build the fully distributed, scalable version of your search engine? Add that number to the `"dloc"` portion of package.json, and justify your answer below.

I estimated that the remainder of the project will take 3600 lines of code. This is because M0 took approximately 600 lines of code, and there are an additional parts M1-M6 to fill in afterwards.
