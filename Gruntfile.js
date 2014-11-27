module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-tslint');

  var pkg = grunt.file.readJSON('package.json');
  console.log('pkg.name', pkg.name);

  grunt.initConfig({
    pkg: pkg,

    ts: {
      options: {
        sourceMap: false,
        declaration: true,
        baseDir: '.',
        comments: true,
      },

      lib: {
        src: [
          'refs/common.d.ts',
          'src/*.ts'
        ],
        out: 'dist/<%= pkg.name %>.js'
      },

      tests: {
        src: [
          'refs/tests.d.ts',
          'test/*.ts',
          'test/**/*.ts'
        ],
        out: 'build/tests.js',
        options: {
          declaration: false
        }
      }
    },

    karma: {
      options: {
        basePath: '.',
        frameworks: ['jasmine'],
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage'],
        preprocessors: {
          'build/lib.js': 'coverage',
        },
        coverageReporter: {
          type: 'text',
          dir: 'coverage'
        },
        files: [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/jquery-bracket/dist/jquery.bracket.js',
          'build/tests.js'
        ]
      },
      lib: {
        options: {
          coverageReporter: {
            type: 'html',
            dir: 'coverage'
          },
          frameworks: ['jasmine']
        }
      },
      server: {
        options: {
          coverageReporter: {},
          preprocessors: {},
          reporters: ['progress']
        },
        autoWatch: true,
        singleRun: false,
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: true,
        wrap: true
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },

    tslint: {
      options: {
        configuration: grunt.file.readJSON('tslint.json')
      },
      files: {
        src: ['src/**/*.ts', 'src/**/**/*.ts']
      }
    }
  });


  grunt.registerTask('default', ['ts:lib']);
  grunt.registerTask('lib', ['ts:lib']);
  grunt.registerTask('tests', ['ts:tests']);
  grunt.registerTask('test', ['karma:lib']);
  grunt.registerTask('dist', [
    'default',
    'uglify:dist',
  ]);
  grunt.registerTask('all', ['ts', 'dist']);
};
