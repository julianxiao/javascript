var Xively = require('./models/xively');


module.exports = function (app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    // frontend routes =========================================================
    // route to handle all angular requests


    // sample api route
    app.post('/api/xively', function (req, res) {

        var xively = new Xively(); 
        xively.xivelyPostData = req.body; 

        xively.save(function (err) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json({
                message: 'xively data recorded!'
            });
        });
    });

    app.get('/api/xively', function (req, res) {

        Xively.find(function (err, xivelies) {
            if (err)
                res.send(err);

            res.json(xivelies);
        });
    });



    // route to handle creating (app.post)
    // route to handle delete (app.delete)


    app.get('*', function (req, res) {
        res.sendfile('./public/index.html');
    });

};