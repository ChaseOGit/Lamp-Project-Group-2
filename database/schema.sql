CREATE DATABASE IF NOT EXISTS lamp_project;
USE lamp_project;

Create table users(
	user_id int primary key auto_increment not null unique,
	username varchar(255) not null unique,
	passwords varchar(255) not null,
    user_priv int not null default 2
);

Create table contacts(
	contact_id int primary key auto_increment not null unique,
	reference_id int not null,
	c_name varchar(255) not null,
	phone varchar(20) unique,
	email varchar(255) unique,
	foreign key (reference_id) references users (user_id)
);
