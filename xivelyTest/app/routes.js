var Xively = require('./models/xively');


module.exports = function (app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    // frontend routes =========================================================
    // route to handle all angular requests


    // sample api route
    app.post('/api/xively', function (req, res) {

        var xively = new Xively(); // create a new instance of the Bear model
        xively.xivelyPostData = req.body; // set the bears name (comes from the request)

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

        Xively.find(function (err, xively) {
            if (err)
                res.send(err);

            res.json(xively);
        });
    });



    // route to handle creating (app.post)
    // route to handle delete (app.delete)


    app.get('*', function (req, res) {
        res.sendfile('./public/index.html');
    });

};