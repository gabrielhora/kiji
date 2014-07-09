create table article (
	Id bigint not null primary key auto_increment,
	Title varchar(255) not null,
	Markdown text not null,
	Slug varchar(255) null,
	Secret varchar(255) null,
	Shortened varchar(255) null,
	`Name` varchar(255) null,
	Email varchar(255) null,
	Site varchar(255) null,
	Twitter varchar(255) null,
	Description varchar(255) null,
	Keywords varchar(255) null,
	CommentsEnabled bool null,
	CreatedAt timestamp default 0,
	UpdatedAt timestamp default 0
);