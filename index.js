const simpleGit = require("simple-git")();
const simpleGitPromise = require("simple-git/promise")();

simpleGitPromise.status().then(res => console.log(res));
