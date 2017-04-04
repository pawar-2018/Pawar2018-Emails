import gulp     from 'gulp';
import plugins  from 'gulp-load-plugins';
import browser  from 'browser-sync';
import rimraf   from 'rimraf';
import panini   from 'panini';
import yargs    from 'yargs';
import lazypipe from 'lazypipe';
import inky     from 'inky';
import fs       from 'fs';
import siphon   from 'siphon-media-query';
import path     from 'path';
import merge    from 'merge-stream';
import beep     from 'beepbeep';
import colors   from 'colors';

const $ = plugins();

// Look for the --production flag
const PRODUCTION = !!(yargs.argv.production);

// Build the "dist" folder by running all of the above tasks
gulp.task('build',
  gulp.series(clean, pages, sass, images, inline));

// Build emails, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', server, watch));

// Build emails, then zip
gulp.task('zip',
  gulp.series('build', zip));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf('dist', done);
}

// Compile layouts, pages, and partials into flat HTML files
// Then parse using Inky templates
function pages() {
  return gulp.src('src/pages/**/*.html')
    .pipe(panini({
      root: 'src/pages',
      layouts: 'src/layouts',
      partials: 'src/partials',
      helpers: 'src/helpers'
    }))
    .pipe(inky())
    .pipe(gulp.dest('dist'));
}

// Reset Panini's cache of layouts and partials
function resetPages(done) {
  panini.refresh();
  done();
}

// Compile Sass into CSS
function sass() {
  return gulp.src('src/assets/scss/**/*.scss')
    .pipe($.if(!PRODUCTION, $.sourcemaps.init()))
    .pipe($.sass({
      includePaths: ['node_modules/foundation-emails/scss']
    }).on('error', $.sass.logError))
    .pipe($.if(PRODUCTION, $.uncss(
      {
        html: ['dist/**/*.html']
      })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest('dist/css'));
}

// Copy and compress images
function images() {
  return gulp.src('src/assets/img/**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest('./dist/assets/img'));
}

// Inline CSS and minify HTML
function inline() {
  return gulp.src('dist/**/*.html')
    .pipe($.if(PRODUCTION, $.foreach(function(stream, file) {
      var name = path.parse(file.path).name;
      if (fs.existsSync('dist/css/' + name + '.css') === false) {
        fs.appendFile('dist/css/' + name + '.css', '', function(err) {
          if (err) {
            console.log(err);
          }
        })
      }
      return stream.pipe(inliner('dist/css/' + name + '.css'));
    })))
    .pipe(gulp.dest('dist'))
}

// Start a server with LiveReload to preview the site in
function server(done) {
  browser.init({
    server: "dist",
    startPath: "/index.html",
    reloadOnRestart: true
  });
  done();
}

// Watch for file changes
function watch() {
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, inline, browser.reload));
  gulp.watch(['src/layouts/**/*', 'src/partials/**/*']).on('all', gulp.series(resetPages, pages, inline, browser.reload));
  gulp.watch(['../scss/**/*.scss', 'src/assets/scss/**/*.scss']).on('all', gulp.series(resetPages, sass, pages, inline, browser.reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
}

// Inlines CSS into HTML, adds media query CSS into the <style> tag of the email, and compresses the HTML
function inliner(css) {
  var newCss = fs.readFileSync(css).toString();
  var mqCss = siphon(newCss);

  var pipe = lazypipe()
    .pipe($.inlineCss, {
      applyStyleTags: false,
      removeStyleTags: true,
      preserveMediaQueries: true,
      removeLinkTags: false,
      applyTableAttributes: true,
    })
    .pipe($.replace, '<!-- <style> -->', `<style>${mqCss}</style>`)
    .pipe($.htmlmin, {
      collapseWhitespace: true,
      minifyCSS: true
    });

  return pipe();
}

// Copy and compress into Zip
function zip() {
  var dist = 'dist';
  var ext = '.html';

  function getHtmlFiles(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        var fileExt = path.join(dir, file);
        var isHtml = path.extname(fileExt) == ext;
        return fs.statSync(fileExt).isFile() && isHtml;
      });
  }

  var htmlFiles = getHtmlFiles(dist);

  var moveTasks = htmlFiles.map(function(file){
    var sourcePath = path.join(dist, file);
    var fileName = path.basename(sourcePath, ext);

    var moveHTML = gulp.src(sourcePath)
      .pipe($.rename(function(path) {
        path.dirname = fileName;
        return path;
      }));

    var moveImages = gulp.src(sourcePath)
      .pipe($.htmlSrc({ selector: 'img'}))
      .pipe($.rename(function(path) {
        path.dirname = fileName + '/' + path.dirname;
        return path;
      }));

    return merge(moveHTML, moveImages)
      .pipe($.zip(fileName+ '.zip'))
      .pipe(gulp.dest('dist'));
  });

  return merge(moveTasks);
}
