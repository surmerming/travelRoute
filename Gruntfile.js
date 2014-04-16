
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
            compile: {
                files:[{
                    expand:true,
                    cwd:'./dev/less/',
                    src: './*.less',
                    ext:'.css',
                    dest:'./master/css/'
                }]
            }
        },
        coffee: {
            compile: {
                files: {
                    'master/js/demo.js': 'dev/coffee/demo.coffee' // 1:1 compile
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerTask('default', ['watch','less','coffee']);

    grunt.registerTask('build', ['less', 'coffee']);

};