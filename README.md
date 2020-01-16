# git-timelapse


## What's git-timelapse?

git-timelapse is an npm package that constructs timelapses of how pages in your project have evolved over time.

Currently git-timelapse only works for basic web pages or simple react apps. I intend to expand it further to offer some sort of support for more complex applications but there's some issues I'd need to address such as changes to the projects back-end or database schema.


## Usage

```sh
# install git-timelapse
npm i git-timelapse

# run it 
npx git-timelapse -g ./full/path/to/git/repo -p ./full/path/to/page 
```

## Options

- `-g /path/to/git/repo` - Full Path to folder for the git repo.
- `-p /path/to/page` - Full Path To The Page Or URL i.e https://localhost:3000
