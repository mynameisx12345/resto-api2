CREATE DATABASE resto;
USE resto;

CREATE TABLE users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(500)
);
 
 INSERT INTO users(name)
 VALUES('juan dela cruz');


CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

INSERT INTO categories (name)
VALUES('Foods');

INSERT INTO categories (name)
VALUES('Drinks');

INSERT INTO categories (name)
VALUES('Desserts');

CREATE TABLE subcategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO subcategories (name, category_id)
VALUES('Pizza', 1);
INSERT INTO subcategories (name, category_id)
VALUES('Pasta', 1);


CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description VARCHAR(100),
    category_id  INT NOT NULL,
    image_path VARCHAR(200),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    subcategory_id INT NULL,
    FOREIGN kEY (subcategory_id) REFERENCES subcategories(id)
);

CREATE TABLE prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    size VARCHAR(100),
    price DECIMAL(15,2)
)

CREATE TABLE order_hdr (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mode VARCHAR(20),
    area VARCHAR(100),
    area_fee DECIMAL(15,2),
    sub_total DECIMAL(15,2),
    grand_total DECIMAL(15,2),
    discount DECIMAL(5,5),
    pay_mode VARCHAR(50),
    status VARCHAR(50),
    dttm_order DATETIME,
    dttm_pay DATETIME,
    paid_amount DECIMAL(15,2)
);

CREATE TABLE order_dtl (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    item_name VARCHAR(100),
    item_size VARCHAR(50),
    quantity INT NOT NULL,
    price DECIMAL(15,2),
    total DECIMAL(15,2),
    status VARCHAR(50),
    order_hdr_id INT NOT NULL,
    FOREIGN KEY (order_hdr_id) REFERENCES order_hdr(id)
);

CREATE TABLE page_access (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    page_id INT NOT NULL
);

CREATE TABLE category_access (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

ALTER TABLE users
ADD COLUMN password VARCHAR(100);

ALTER TABLE users
ADD COLUMN username VARCHAR(100);

ALTER TABLE users
ADD COLUMN isDeleted BOOLEAN;

CREATE TABLE subcategory_access(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    subcategory_id INT NOT NULL,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

ALTER TABLE items
ADD COLUMN isDeleted BOOLEAN;

ALTER TABLE categories
ADD COLUMN isDeleted BOOLEAN;

ALTER TABLE subcategories
ADD COLUMN isDeleted BOOLEAN;