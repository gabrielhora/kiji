using kiji.Entities;

namespace kiji.Repositories
{
    public class Database : Dapper.Database<Database>
    {
        public Table<Article> Articles { get; set; }
    }
}