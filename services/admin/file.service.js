const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");


module.exports = {
    name: 'image',
    mixins: [DbService],

    actions: {
        uploadFile: {
            rest: {
				method: "GET",
				path: "/uploadFile"
            },
            async handler(ctx){
                const file = ctx.options.parentCtx.params.req.file;
                const filename = file.filename;
                const imageurl = "upload/image/"+filename;
                var path ="http://3.22.3.82:4000/"

                    const successMessage = {
                    success: true,
                    message: 'Image uploaded',
                    path: path,
                    imageurl:imageurl,
                    Url:path+''+imageurl
                }
                return successMessage
                
 
                // INPUT_path_to_your_images = 'upload/image/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}';
                // OUTPUT_path = 'upload/image/';
                
                // compress_images(INPUT_path_to_your_images, OUTPUT_path, {compress_force: false, statistic: true, autoupdate: true}, false,
                //     {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
                //     {png: {engine: 'pngquant', command: ['--quality=20-50']}},
                //     {svg: {engine: 'svgo', command: '--multipass'}},
                //     {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(error, completed, statistic){
                //         console.log('-------------');
                //         console.log(error);
                //         console.log(completed);
                //         console.log(statistic);
                //         console.log('-------------');                                   
                // });
              
            }
        }
     },


}
