using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace kiji.Utilities
{
    public static class Slug
    {
        public static string Slugify(this string phrase)
        {
            var s = phrase.RemoveAccent().ToLower();
            s = Regex.Replace(s, @"[^a-z0-9\s-]", "");
            s = Regex.Replace(s, @"\s+", " ").Trim();
            s = s.Substring(0, s.Length <= 45 ? s.Length : 45).Trim();
            s = Regex.Replace(s, @"\s", "-");
            return s.ToLower();
        }

        public static string RemoveAccent(this string text)
        {
            var bytes = Encoding.GetEncoding("Cyrillic").GetBytes(text);
            return Encoding.ASCII.GetString(bytes);
        }
    }
}