var article = new Article();

(function () {

    var stopLoading = function (error) {
        if (error === null || error === undefined) {
            $('#public-loading span').addClass('success').html('Done.');
            setTimeout(function() { $('#public-loading').fadeOut(500); }, 500);
        } else {
            $('#public-loading span').addClass('error').html(error.status + ' ' + error.statusText);
        }
    };

    // try to load the article by secret
    if (location.search.length > 1) {
        var secret = location.search.substr(1);

        $.getJSON(BASE_URL + 'article/secret/' + secret)
            .done(function(data) {
                article.Id(data.Id);
                article.Slug(data.Slug);
                article.Secret(data.Secret);
                article.Shortened(data.Shortened);
                article.PublicUrl(data.PublicUrl);
                article.PrivateUrl(data.PrivateUrl);
                article.Title(data.Title);
                article.Markdown(data.Markdown);
                article.Name(data.Name);
                article.Email(data.Email);
                article.Site(data.Site);
                article.Twitter(data.Twitter);
                article.CommentsEnabled(data.CommentsEnabled);
                article.Description(data.Description);
                article.Keywords(data.Keywords);
                article._CreatedAt(data.CreatedAt);
                // little hack to make the textarea actually resize
                $('textarea').toggle().toggle().trigger('autosize');
                stopLoading(null);
                Init(article);
            }).error(function (e) {
                stopLoading(e);
            });
    } else {
        stopLoading(null);
        Init(article);
    }

})();