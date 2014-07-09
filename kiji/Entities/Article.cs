using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using System.Linq;
using System.Web;
using Nustache.Core;
using kiji.Templates;

namespace kiji.Entities
{
    public class Article
    {
        public long Id { get; set; }
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }
        [Required]
        public string Markdown { get; set; }
        public string Slug { get; set; }
        public string Secret { get; set; }
        public string Shortened { get; set; }
        [MaxLength(255)]
        public string Name { get; set; }
        [MaxLength(255)]
        public string Email { get; set; }
        [MaxLength(255)]
        public string Site { get; set; }
        [MaxLength(255)]
        public string Twitter { get; set; }
        [MaxLength(255)]
        public string Description { get; set; }
        [MaxLength(255)]
        public string Keywords { get; set; }
        public bool CommentsEnabled { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public string GetCreatedAt()
        {
            return String.Format(new CultureInfo("en-US"), "{0:MMMM d yyyy}", CreatedAt);
        }

        public string ToHtml(string templateName)
        {
            var filePath = TemplateManager.GetTemplatePath(templateName);
            return Render.FileToString(filePath, this);
        }
    }
}