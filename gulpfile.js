const gulp = require('gulp');
const shelljs = require('shelljs');
const chalk = require('chalk');
const del = require('del');
const runSequence = require('run-sequence');

const consoleColor = {
    red: chalk.red.bold,
    blue: chalk.bgBlue.white.bold,
    green: chalk.bgGreen.white.bold,
};

const commands = {
    clean: 'gulp clean:project',
    compile: 'npm run compile',
    copy: filename => `gulp copy:project:files && mv ${filename} dist && rm -r out`,
    compress: (filename, dir) => `tar -zcf ${filename}.tar.gz ${dir}`,
    install: `cd dist && NODE_ENV=production npm i --production`,
    start: 'NODE_ENV=production pm2 start --attach ecosystem.config.js',
};

gulp.task('clean:project', done => {
    del([
        'out/**',
        '@types/**',
        './dist/**',
        '!./dist/logs',
        '!./dist/.pm2/',
    ])
    .then(files => {
        console.log(`${consoleColor.blue('INFO')} Number of files deleted: ${files.length}`);
        done();
    });
});

gulp.task('copy:project:files', _ => gulp.src([
    './.travis/**',
    './package.json',
    './Dockerfile',
    './cron.js',
    './server.js',
    './README.md',
    './.travis.yml',
    './.gitignore',
    './ecosystem.config.js',
    './.env',
    './.editorconfig'
]).pipe(gulp.dest('./dist')));
