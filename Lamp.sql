create schema lamp_project;
Use lamp_project;

Create table users(
	user_id int primary key auto_increment not null unique,
	username varchar(255) not null,
	passwords varchar(255) not null
);

Create table contacts(
	contact_id int primary key auto_increment not null unique,
	reference_id int not null,
	c_name varchar(255) not null,
	phone varchar(20),
	email varchar(255),
	foreign key (reference_id) references users (user_id)
);

