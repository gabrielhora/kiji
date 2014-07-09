using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using Dapper;
using kiji.Entities;
using kiji.Templates;
using kiji.Utilities;

namespace kiji.Repositories
{
    public class Articles
    {
        public static IEnumerable<Article> All()
        {
            using (var db = DatabaseFactory.Create())
            {
                return db.Articles.All();
            }
        }

        public static Article GetById(long id)
        {
            using (var db = DatabaseFactory.Create())
            {
                return db.Articles.Get(id);
            }
        }

        public static Article GetBySecret(string secret)
        {
            using (var db = DatabaseFactory.Create())
            {
                return db.Articles.Get(new {Secret = secret});
            }
        }

        public static Article Insert(Article article)
        {
            using (var db = DatabaseFactory.Create())
            {
                article.Secret = Guid.NewGuid().ToString("N");
                article.Slug = article.Title.Slugify();
                article.CreatedAt = DateTime.Now;
                
                // insert the record and then update to create the shortened id
                var inserted = db.Articles.Insert(article);
                var updated = db.Articles.Update(inserted, new {Shortened = Base36.Encode(inserted)});

                // generate the html dump file
                if (updated == 1)
                {
                    article = GetById(inserted);
                    var dump = article.ToHtml(@"Templates\Article.html");
                    if (TemplateManager.DumpToHtmlFile(dump, article.Shortened))
                    {
                        return article;
                    }
                }
                return null;
            }
        }

        public static Article Update(Article article, dynamic data, ICollection<ValidationResult> validationResults = null)
        {
            using (var db = DatabaseFactory.Create())
            {
                var s = Snapshotter.Start(article);

                article.Title = data.Title ?? article.Title;
                article.Slug = article.Title.Slugify();
                article.Markdown = data.Markdown ?? article.Markdown;
                article.Name = data.Name ?? article.Name;
                article.Email = data.Email ?? article.Email;
                article.Site = data.Site ?? article.Site;
                article.Twitter = data.Twitter ?? article.Twitter;
                article.Description = data.Description ?? article.Description;
                article.Keywords = data.Keywords ?? article.Keywords;
                article.CommentsEnabled = data.CommentsEnabled ?? article.CommentsEnabled;
                article.UpdatedAt = DateTime.Now;

                // validate the resulting model
                var ctx = new ValidationContext(article);
                var isValid = Validator.TryValidateObject(article, ctx, validationResults);

                if (isValid)
                {
                    // update
                    db.Articles.Update(article.Id, s.Diff());

                    // generate the html dump
                    var dump = article.ToHtml(@"Templates\Article.html");
                    if (TemplateManager.DumpToHtmlFile(dump, article.Shortened))
                    {
                        // return
                        return GetById(article.Id);
                    }
                }
                return null;
            }
        }

        public static bool Delete(Article article)
        {
            using (var db = DatabaseFactory.Create())
            {
                if (!String.IsNullOrEmpty(article.Shortened))
                {
                    TemplateManager.DeleteHtmlFile(article.Shortened);
                }
                return db.Articles.Delete(article.Id);
            }
        }
    }
}