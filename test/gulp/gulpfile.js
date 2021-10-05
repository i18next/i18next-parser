const path = require('path')
const gulp = require('gulp')
const i18next = require('../../src/index').gulp

gulp.task('i18next', function () {
  return gulp
    .src([path.resolve(__dirname, '../templating/*')])
    .pipe(
      new i18next({
        locales: ['en', 'fr'],
        output: path.resolve(__dirname, 'locales/$LOCALE/$NAMESPACE.json'),
        sort: true,
      })
    )
    .pipe(gulp.dest('./'))
})
