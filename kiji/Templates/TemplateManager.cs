using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;

namespace kiji.Templates
{
    public class TemplateManager
    {
        private static readonly string TemplateDumpPath = ConfigurationManager.AppSettings["TemplateDumpPath"];

        public static string GetTemplatePath(string name)
        {
            var binPath = AppDomain.CurrentDomain.BaseDirectory;
            var templatePath = Path.Combine(binPath, name);
            return File.Exists(templatePath) ? templatePath : null;
        }

        public static bool DumpToHtmlFile(string content, string fileName)
        {
            var path = Path.Combine(TemplateDumpPath, fileName + ".html");
            try
            {
                File.WriteAllText(path, content);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static void DeleteHtmlFile(string fileName)
        {
            var path = Path.Combine(TemplateDumpPath, fileName + ".html");
            try
            {
                File.Delete(path);
            }
            catch
            {
            }
        }
    }
}