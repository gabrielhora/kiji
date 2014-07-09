var MarkdownDidChange = true;
var CurrentBuffer = '#buffer2';
var Editor = null;

/** The model */
function Article() {
    var self = this;

    self.BaseUrl = BASE_URL + 'article/';
    self.Validated = false;
    self.FullScreen = false;

    self.Id = ko.observable(0);
    self.Slug = ko.observable('');
    self.Secret = ko.observable('');
    self.Shortened = ko.observable('');
    self.PublicUrl = ko.observable('');
    self.PrivateUrl = ko.observable('');

    self.Title = ko.observable('');
    self.Markdown = ko.observable('');
    self.MarkdownValue = ko.computed({
        read: function () {
            return self.Markdown();
        },
        write: function (value) {
            self.Markdown(HtmlDecode(value));
        },
        owner: self
    });
    self.Html = ko.observable('');

    self.Name = ko.observable('');
    self.Email = ko.observable('');
    self.Site = ko.observable('');
    self.Twitter = ko.observable('');
    self.CommentsEnabled = ko.observable(true);

    self._CreatedAt = ko.observable('');
    self.Description = ko.observable('');
    self.Keywords = ko.observable('');

    self.Tab = ko.observable(0);

    self.Success = ko.computed(
    {
        read: function () {
            return $('#success').html();
        },
        write: function (msg) {
            $('#success').html(msg).slideDown('fast');
            $('#publish-button').addClass('success');
            setTimeout(function () {
                $('#publish-button').removeClass('success');
                $('#success').slideUp('fast');
            }, 10000);
        }
    });

    self.Message = ko.computed(
    {
        read: function () {
            return $('#message').html();
        },
        write: function (msg) {
            $('#message').html(msg).slideDown('fast');
            $('#publish-button').addClass('error');
            setTimeout(function () {
                $('#publish-button').removeClass('error');
                $('#message').slideUp('fast');
            }, 10000);
        }
    });

    self.Publishing = ko.observable(false);
    self.PublishStatus = ko.observable('');

    self.PublishLabel = ko.computed(function () {
        return self.Id() !== 0 ? 'Save' : 'Publish';
    });

    self.Created = ko.computed(function () {
        if (self._CreatedAt() !== '') {
            return moment(self._CreatedAt()).format('LL');
        }
        return moment().format('LL');
    });
    
    self.By = ko.computed(function () {
        var msg = '';
        if (self.Name() !== '' && self.Email() !== '') {
            msg = "by <a href='mailto:" + self.Email() + "'>" + self.Name() + "</a>";
        } else if (self.Name() !== '') {
            msg = 'by ' + self.Name();
        } else if (self.Email() !== '') {
            msg = "by <a href='mailto:" + self.Email() + "'>" + self.Email() + "</a>";
        }
        return msg + ' on ' + self.Created();
    });

    self.Mailto = ko.computed(function () {
        return 'mailto:' + self.Email();
    });

    self.TwitterLink = ko.computed(function () {
        return 'http://www.twitter.com/' + self.Twitter();
    });

    self.SiteAndTwitter = ko.computed(function() {
        if (self.Site() !== '' && self.Twitter() !== '') {
            return "<a href='//" + self.Site() + "'>" + self.Site() + "</a> / <a href='http://twitter.com/" + self.Twitter() + "'>@" + self.Twitter() + "</a>";
        } else if (self.Site() !== '') {
            return "<a href='//" + self.Site() + "'>" + self.Site() + "</a>";
        } else if (self.Twitter() !== '') {
            return "<a href='http://twitter.com/" + self.Twitter() + "'>@" + self.Twitter() + "</a>";
        }
    });

    self.ToggleFullScreen = function () {
        var speed = 200;
        if (self.FullScreen) {
            $('#menu').slideDown(speed);
            $('input[name=title]').slideDown(speed);
            $('#editor').animate({ width: "50%", top: 60 }, speed);
            $('input[name=title]').slideDown(speed);
        } else {
            $('#menu').slideUp(speed);
            $('input[name=title]').slideUp(speed);
            $('#editor').animate({ width: "100%", top: 0 }, speed);
        }
        self.FullScreen = !self.FullScreen;
    };

    self.ShowWelcome = function () {
        return self.Title() === '' && self.Markdown() === '';
    };

    /** Compile markdown */
    self.Compile = function () {
        self.Html(marked.setOptions(
        {
            sanitize: true,
            breaks: true,
            langPrefix: '',
            highlight: function (code, lang) {
                try {
                    return hljs.highlight(lang, code).value;
                }
                catch (e) {
                    return hljs.highlightAuto(code).value;
                }
            }
        })(self.Markdown()));
    };

    /** Publish this article */
    self.Publish = function () {
        self.Id() === 0 ? self.Insert() : self.Update();
        // everything is saved, unbind the unload event
        $(window).unbind('beforeunload');
    };

    /** Create the article */
    self.Insert = function () {
        if (self.Validate()) {
            self.Publishing(true);

            // post the json to the server
            var json = ko.toJSON(self);

            // and get back the private and public urls
            $.ajax({
                type: 'POST',
                url: self.BaseUrl,
                contentType: 'application/json',
                data: json,
                dataType: "json"
            })
            .done(function (data) {
                // update the article
                self.Id(data.Id);
                self.PublicUrl(data.PublicUrl);
                self.PrivateUrl(data.PrivateUrl);
                self.Slug(data.Slug);
                self.Secret(data.Secret);
                // change tabs
                self.PublishStatus('Done.');
                self.Tab(4);
                // inject addthis for sharing
                self.InjectAddThis();
                // done publishing
                self.Publishing(false);
                self.Success("<ul><li><b>Success!</b> Your post is now published.</li></ul>");
            })
            .error(function () {
                self.Publishing(false);
                self.Message('<ul><li><b>Oops!</b> Something went wrong! Please, try again later.</li></ul>');
            });
        }
    };

    /** Update the article */
    self.Update = function () {
        if (self.Secret() == '') return;
        if (self.Validate()) {
            self.Publishing(true);

            // post the json to the server
            var json = ko.toJSON(self);

            // and get back the private and public urls
            $.ajax({
                type: 'PUT',
                url: self.BaseUrl + self.Secret(),
                data: json,
                contentType: 'application/json',
                dataType: "json"
            })
            .done(function (data) {
                // update the model
                self.Slug(data.Slug);
                self.PublicUrl(data.PublicUrl);
                self.PrivateUrl(data.PrivateUrl);
                // change tabs
                self.PublishStatus('Saved.');
                // inject addthis for sharing
                self.InjectAddThis();
                // done publishing
                self.Publishing(false);
                self.Success("<ul><li>Article saved.</li></ul>");
            })
            .error(function () {
                self.Publishing(false);
                self.Message('<ul><li><b>Oops!</b> Something went wrong! Please, try again later.</li></ul>');
            });
        }
    };

    self.Delete = function() {
        if (confirm('Are you sure? This cannot be undone.')) {
            $.ajax({
                type: 'DELETE',
                url: self.BaseUrl + self.Secret()
            })
            .done(function () {
                $(window).unbind('beforeunload');
                window.location = SITE_URL;
            })
            .error(function() {
                self.Message('<ul><li><b>Oops!</b> Something went wrong! Please, try again later.</li></ul>');
            });
        }
    };

    /** Validate the model */
    self.Validate = function () {
        var message = '';
        self.Validated = true;

        if (self.Title() === '')
            message += '<li>Title is required</li>';
        if (self.Markdown() === '')
            message += '<li>Body is required</li>';
        if ($('#aboutyou-form').parsley('isValid') == false)
            message += '<li>Please fix errors in "Options" tab.</li>';

        if (message !== '') {
            self.Message('<ul>' + message + '</ul>');
            return message === '';
        }
        else {
            self.Message('');
            return true;
        }
    };

    self.InjectAddThis = function () {
        if (self.PublicUrl() === '') return;
        
        /*GLOBAL*/ addthis_share = { url: self.PublicUrl(), title: self.Title() };
        /*GLOBAL*/ addthis_config = {};
        addthis_config.data_track_addressbar = false;
        addthis_config.data_track_clickback = false;
        addthis_config.ui_language = 'en';
        var addthis = document.createElement('script');
        addthis.type = 'text/javascript';
        addthis.src = '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-505b39b410fa5f3b';
        document.getElementsByTagName('head')[0].appendChild(addthis);
    };
    
    /** Signal the preview loop to compile and update the markdown */
    self.Markdown.subscribe(function () {
        MarkdownDidChange = true;
        
        // if the markdown changed confirm before
        $(window).unbind('beforeunload').bind('beforeunload', function () {
            return 'There seems to be unsaved changes.';
        });
    });
}

/** Custom handler to fade in/out stuff */
ko.bindingHandlers.fadeVisible = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value));
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).fadeIn(200) : $(element).hide();
    }
};

/** Initialize the page */
function Init(article) {
    /** Initialize KO */
    ko.applyBindings(article);
    
    /** Inject AddThis if necessary */
    article.InjectAddThis();

    /** Autoresize textarea */
    Editor = CodeMirror.fromTextArea(document.getElementById("codemirror_editor"), {
        lineWrapping: true,
        viewportMargin: Infinity
    });
    
    /** Start the compile preview loop */
    Preview(article);
    setInterval(function () { Preview(article); }, 1000);

    /** Setup shortcuts */
    
    // Fullscreen
    shortcut.add('Ctrl+F', function() {
        article.ToggleFullScreen();
    });

    // ESC key bind to exit fullscreen
    shortcut.add('ESC', function() {
        if (article.FullScreen) article.ToggleFullScreen();
    });
    
    // Ctrl+S to publish the article
    shortcut.add('Ctrl+S', function() {
        article.Publish();
    });
    
    // Change tabs shortcuts
    shortcut.add('Ctrl+1', function() {
        article.Tab(0);
    });
    shortcut.add('Ctrl+2', function () {
        article.Tab(1);
    });
    shortcut.add('Ctrl+3', function () {
        article.Tab(2);
    });
    shortcut.add('Ctrl+4', function () {
        article.Tab(3);
    });
}

/*
 * Utility functions
 */

/** Compile and preview the markdown */
function Preview(article) {
    // set the textarea
    if (Editor) Editor.save();
    article.Markdown($('#codemirror_editor').val());

    // check if changed
    if (!MarkdownDidChange) return;
    MarkdownDidChange = false;
    
    // compile markdown
    article.Compile();
    SetBuffer(article.Html());
}

/** Set the buffer content and switch after loaded */
function SetBuffer(content, callback) {
    var current = $(CurrentBuffer);

    // find all images
    var count = $(content).find('img').size();
    var loaded = 0;

    // set the content
    current.html(content);

    if (count === 0) {
        // images to load, just switch the buffers then
        SwitchBuffer();
        if (callback) callback();
        return;
    }

    // function to control loaded images
    var onLoadOrError = function () {
        loaded++;
        if (loaded === count) {
            // all images loaded, switch buffers
            SwitchBuffer();
            // run the callback if needed
            if (callback) callback();
        }
    };

    // wait for all images to load
    current.find('img').load(onLoadOrError).error(onLoadOrError);
}

/** Switch buffers */
function SwitchBuffer() {
    var newbuffer = CurrentBuffer === '#buffer1' ? '#buffer2' : '#buffer1';
    $(CurrentBuffer).toggle();
    $(newbuffer).toggle();
    CurrentBuffer = newbuffer;
    $(CurrentBuffer).html('');
}

/** Decode HTML */
function HtmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}