var through = require('through2'),
    gutil = require('gulp-util'),
    BufferStreams = require('bufferstreams'),
    PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-requireToReqwire';


// plugin level function (dealing with files)
function gulpRequireToReqwire() {

    // creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, cb) {
        if (file.isBuffer()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
            return cb();
        }

        if (file.isStream()) {
            // start the transformation

            file.contents = file.contents.pipe(new BufferStreams(function(err, buf, cb) {

                // err will be filled with an error if the piped in stream emits one. 
                if (err) {
                    throw err;
                }

                // buf will contain the whole piped in stream contents 
                buf = Buffer(buf.toString('utf-8').replace('require', 'reqwire'));

                // cb is a callback to pass the result back to the piped out stream 
                // first argument is an error that will be emitted if any 
                // the second argument is the modified buffer 
                cb(null, buf);

            }));
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);
        // tell the stream engine that we are done with this file
        cb();
    });

    // returning the file stream
    return stream;
}

// exporting the plugin main function
module.exports = gulpRequireToReqwire;