const gulp = require('gulp')
const i18next = require('../dist/index').gulp

gulp.task('i18next', function () {
  return gulp
    .src(['templating/*'])
    .pipe(
      new i18next({
        locales: ['en', 'fr'],
        output: 'gulp/locales/$LOCALE/$NAMESPACE.json',
      })
    )
    .pipe(gulp.dest('./'))
})
