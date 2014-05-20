var serverAddress = 'local';

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$(function () {

    $('#inputForm').submit(function (e) {
        e.preventDefault();

        var form = $(this);
        
        var serverUrl = '';
        if(serverAddress === 'heroku') serverUrl = 'http://xxx.herokuapp.com/foo';
        if(serverAddress === 'localhost') serverUrl = 'http://localhost:5000/foo';

        /*
        var query = $.trim(form.find('input[name="textinputLine"]').val());

                if (!query) {
                    return;
                }
        */
        
        var formData = form.serializeObject();
                
        console.log(formData);
    
        var err = function (req, status, err) {
            var htmlList = $('#target').html();
            htmlList = '<li class="list-group-item">' + 'something went wrong' + '</li>' + htmlList;
            $('#target').html(htmlList);
            $('#submitButton').toggleClass('active');
        };

        var success = function (resp) {
            var htmlList = $('#target').html();
            htmlList = '<li class="list-group-item">'+ JSON.stringify(resp) + '</li>' + htmlList;
            $('#target').html(htmlList);
            $('#submitButton').toggleClass('active');
        };

        if (!serverUrl) {
            var htmlList = $('#target').html();
            htmlList = '<li class="list-group-item">'+ JSON.stringify(formData) + '</li>' + htmlList;
            $('#target').html(htmlList);
            $('#submitButton').toggleClass('active');
            return;
        }
        
        var req = $.ajax({
            url: serverUrl,
            data: 'data=' + JSON.stringify(formData),
            dataType: 'jsonp'
        });

        req.then(success, err);

    });
    
    
    $('a, button').click(function() {
        $(this).toggleClass('active');
    });


})