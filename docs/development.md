# Contribute

Any contribution is welcome. Just follow those guidelines:

1. If you are unsure, open a ticket before working on anything.
2. Fork and clone the project
3. Create a branch `git checkout -b feature/my-feature` (or `hotfix`). If you want to work on multiple bugs or improvements, do so in multiple branches and PRs. It almost always complicated things to mix unrelated changes.
4. Push the code to your fork
5. **Write tests and documentation. I won't merge a PR without it!**
6. Make a pull request from your new branch
7. Wait, I am usually pretty fast to merge PRs :)

Thanks a lot to all the previous [contributors](https://github.com/i18next/i18next-parser/graphs/contributors).

## Setup

```
git clone git@github.com:<your-username>/i18next-parser.git
cd i18next-parser
yarn
```

## Development

The code is written using the latest ES6 features. For the cli to run on older node version, it is compiled with Babel. You can run the compiler in watch mode and let it in the background:

```
yarn watch
```

Don't forget to commit the compiled files.

## Tests

Make sure the tests pass:

```
yarn test
```

The CLI, the gulp plugin and the broccoli plugin are also tested but, as thoses tests are highly I/O dependent, you might encounter timeout issue depending on your configuration. You might want to raise the timeout allowed (search for `this.timeout(5000)`)

To test the CLI specifically:

```
yarn test:cli
yarn test:cli --fail-on-warnings
yarn test:cli "test/cli/**/*.{js,jsx}"
```

## Deploy

- update `package.json` version
- create commit and add version tag
- `npm publish`

## `0.x` vs `1.x`

`1.x` is a major release. It is not backward compatible. There are two separate branches:

- `master` for `1.x`
- `0.x.x` for the old version

I will not maintain the old version but will welcome bug fixes as PRs.
