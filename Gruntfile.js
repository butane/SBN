module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      all: ['Gruntfile.js', 'src/*.js']
    },
    clean: {
      dist: {
        src: ['dist']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */' + "\n"
      },
      dist: {
        files: {
          'dist/js/SBN.js': ['src/js/SBN.js']
        }
      },
    },
    cssmin: {
      dist: {
        files: {
          'dist/css/style.css': ['src/css/style.css']
        }
      }
    },
    htmlmin: {
      dist: {
        files: {
          'dist/index.html': 'src/index.html'
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'src/js/lib',
            src: ['**'],
            dest: 'dist/js/lib'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');


  grunt.registerTask('default', ['jshint', 'clean', 'uglify', 'cssmin', 'htmlmin', 'copy']);

};
