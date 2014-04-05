
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            css: {
                files: [
                    'dev/less/*.less',
                    'master/css/*.css'
                ],
                tasks: ['less']
            },
            js: {
                files: [
                    'dev/coffee/*.coffee',
                    'master/js/*.js'
                ],
                tasks: ['coffee']
            }
        },
        copy: {
            //复制 assets, theme 到 src 目录
            main: {
                files: [
                    {src: ['dev/coffee/**'], dest: '/master/js/'}
                ]
            }
        },
        less: {
            development: {
                options: {
                    paths: []
                },
                files: {
                    "master/css/result.css": "dev/less/source.less"
                }
            }
        },
        coffee: {
            compile: {
                files: {
                    'master/js/result.js': 'dev/coffee/source.coffee' // 1:1 compile
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerTask('build', ['build', 'less']);

};