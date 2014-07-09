using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using kiji.Entities;
using kiji.Repositories;
using kiji.Utilities;

namespace kiji.Controllers
{
    public class ArticleController : ApiController
    {
        // GET api/article/5
        public dynamic Get(long id)
        {
            var article = Articles.GetById(id);
            if (article == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            dynamic d = article.ToDynamic();
            d.Secret = null;
            return SetupUrls(d);
        }

        // GET api/article/secret/kj12hl149812kjb219y721
        public dynamic GetBySecret(string secret)
        {
            var article = Articles.GetBySecret(secret);
            if (article == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);
            return SetupUrls(article.ToDynamic());
        }

        // POST api/article
        public dynamic Post([FromBody]Article article)
        {
            if (ModelState.IsValid)
            {
                var inserted = Articles.Insert(article);
                return SetupUrls(inserted.ToDynamic());
            }
            throw new HttpResponseException(HttpStatusCode.BadRequest);
        }

        // PUT api/article/5kbfdkjbdsaf729y3kbfds
        public dynamic Put(string id, [FromBody]dynamic article)
        {
            var update = Articles.GetBySecret(id);
            if (update == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            update = Articles.Update(update, article);
            if (update == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            return SetupUrls(update.ToDynamic());
        }

        // DELETE api/article/5lkjsdalkjhdffsakbfdkb
        public void Delete(string id)
        {
            var article = Articles.GetBySecret(id);
            if (article == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);
            Articles.Delete(article);
        }

        // This is here just to avoid some errors I was getting in jQuery
        public void Options()
        {
        }

        /// <summary>
        /// Setup default article routes (Public and Private) for a dynamic object
        /// </summary>
        private static dynamic SetupUrls(dynamic article)
        {
            var baseUrl = ConfigurationManager.AppSettings["BaseUrl"];
            var publicUrl = ConfigurationManager.AppSettings["PublicUrl"];
            var privateUrl = ConfigurationManager.AppSettings["PrivateUrl"];

            article.PublicUrl = baseUrl + String.Format(publicUrl, article.Shortened);
            article.PrivateUrl = article.Secret != null ? baseUrl + String.Format(privateUrl, article.Secret) : null;
            return article;
        }
    }
}
