using System.Configuration;
using MySql.Data.MySqlClient;

namespace kiji.Repositories
{
    public class DatabaseFactory
    {
        private static readonly string ConnectionString = ConfigurationManager.ConnectionStrings["default"].ConnectionString;

        public static Database Create()
        {
            var con = new MySqlConnection(ConnectionString);
            return Database.Init(con, commandTimeout: 30);
        }
    }
}