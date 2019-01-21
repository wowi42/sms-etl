const gulp = require('gulp');
const shelljs = require('shelljs');
const chalk = require('chalk');
const del = require('del');

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
        './dist/**'
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

gulp.task('run', done => {
    const pm2Start = shelljs.exec(commands.start, {windowsHide: true});
    if (pm2Start.stderr) {
        console.log(`${consoleColor.red('ERROR!')} ${pm2Start.stderr}`);
    } else {
        console.log(`${consoleColor.blue('Log Info')} ${pm2Start.stdout}`);
    }

    done();
});

gulp.task('build', done => {
    console.log(`${consoleColor.blue('Starting build process')}: This will build the project into a tarball`);

    const cleanProject = shelljs.exec(commands.clean, {windowsHide: true});
    if (cleanProject.stderr) {
        console.log(`${consoleColor.red('ERROR!')} ${cleanProject.stderr}`);
    } else {
        console.log(`${consoleColor.blue('Log Info')} ${cleanProject.stdout}`);
    }

    const compileProject = shelljs.exec(commands.compile, {windowsHide: true});
    if (compileProject.stderr) {
        console.log(`${consoleColor.red('ERROR!')} ${compileProject.stderr}`);
    } else {
        console.log(`${consoleColor.blue('Log Info')} ${compileProject.stdout}`);
    }

    const compressBuild = shelljs.exec(commands.compress('build', 'out'), {windowsHide: true});
    if (compressBuild.stderr) {
        console.log(`${consoleColor.red('ERROR!')} ${compressBuild.stderr}`);
    } else {
        console.log(`${consoleColor.blue('Log Info')} ${compressBuild.stdout}`);
    }

    const copyProjectFiles = shelljs.exec(commands.copy('build.tar.gz'), {windowsHide: true});
    if (copyProjectFiles.stderr) {
        console.log(`${consoleColor.red('ERROR!')} ${copyProjectFiles.stderr}`);
    } else {
        console.log(`${consoleColor.blue('Log Info')} ${copyProjectFiles.stdout}`);
    }

    const setupProject = shelljs.exec(commands.install, {windowsHide: true});
    if (setupProject.stderr) {
        console.log(`${consoleColor.red('ERROR!')} ${setupProject.stderr}`);
    } else {
        console.log(`${consoleColor.blue('Log Info')} ${setupProject.stdout}`);
    }

    console.log(`${consoleColor.green('Finished')}`);
    console.log(`${consoleColor.blue('Ending build process')}`);

    done();
});
