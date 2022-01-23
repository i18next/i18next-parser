import { fileURLToPath } from 'url'
import gulp from 'gulp'
import path from 'path'
// In a real use case, it should be:
// import { gulp as i18next } from 'i18next-parser'
import { gulp as i18next } from '../../src/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
