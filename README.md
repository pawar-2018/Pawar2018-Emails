# Pawar 2018 Email Stack
## Based on Foundation for Emails Template

### If you have questions you can ask Mica on Slack. She is on Slack literally all the time.

This is the official starter project for Pawar 2018's email stack. It's based on [Foundation for Emails](http://foundation.zurb.com/emails), a framework for creating responsive HTML devices that work in any email client. It has a Gulp-powered build system with these features:

- Handlebars HTML templates with [Panini](http://github.com/zurb/panini)
- Simplified HTML email syntax with [Inky](http://github.com/zurb/inky)
- Sass compilation
- Image compression
- Built-in BrowserSync server
- Full email inlining process

## Installation

To use this template, your computer needs [Node.js](https://nodejs.org/en/) 4.0 or greater (I believe this is what Yarn needs).

Open a terminal window and type `node -v` to see what version you're on. If it's less then 4.0, visit the site above for installation instructions for your OS.

Secondly install [Yarn](https://yarnpkg.com/en/docs/install).

Please use Yarn. Some of us use an NPM caching server (Sinopia, usually) at work which seems not to support scoping and therefore recent versions of dependencies for this project error out at install. So either we use Yarn or NPM shrinkwrap. I chose Yarn.

## Git Setup

Unlike the main Pawar repo, we'll be all working on/from this one, not individual forks. There are fewer people and moving parts involved in this one. This will also help us maintain changes that propogate through each template and keep up with new templates as they're added. The `master` branch is protected and all work should be done on branches and through pull requests.

Branches should be your github name or your name (stay consistent) and what the branch is. Such as `<micada-cta-template>` or `<malaniz-fixing-gulp>`, so we know who to ask when we inevitably need to clean up branches. Once your pull request is merged, please delete your branch remotely. You can keep it locally, and even push again to it to create a new Pull Request. Note that your local will likely get all overloaded with branches and you should just mind that for your sanity.

To start your local repo:

```bash
git clone https://github.com/pawar-2018/pawar2018-emails.git
```

Then open the folder in your command line, and install the needed dependencies:

```bash
cd pawar2018-emails
yarn
```

## Build Commands

Run `npm start` to kick off the build process. A new browser tab will open with a server pointing to your project files.

Run `npm run build` to inline your CSS into your HTML along with the rest of the build process.

Run `npm run zip` to build as above, then zip HTML and images for easy deployment to email marketing services.

We will add litmus and mailing tasks later, we don't have those services set up yet to use the way we want.