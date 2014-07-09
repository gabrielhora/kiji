using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using kiji.Repositories;

namespace site
{
    /// <summary>
    /// Summary description for Sitemap
    /// </summary>
    public class Sitemap : IHttpHandler
    {
        private static readonly string BaseUrl = ConfigurationManager.AppSettings["BaseUrl"];
        private static readonly string PublicUrl = ConfigurationManager.AppSettings["PublicUrl"];

        public void ProcessRequest(HttpContext context)
        {
            XNamespace ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
            var urlset = new XElement(ns + "urlset");
            var articles = Articles.All();

            foreach (var article in articles)
            {
                urlset.Add(new XElement(
                    ns + "url",
                    new XElement(ns + "loc", BaseUrl + String.Format(PublicUrl, article.Shortened)),
                    new XElement(ns + "changefreq", "monthly"),
                    new XElement(ns + "priority", "0.8")));
            }

            var xml = new XDocument(new XDeclaration("1.0", "utf-8", "true"), urlset);

            context.Response.ContentType = "text/xml";
            xml.Save(context.Response.Output);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}