ALTER TABLE establishments
  ADD COLUMN zip_code varchar(8) NOT NULL DEFAULT '',
  ADD COLUMN street varchar(255) NOT NULL DEFAULT '',
  ADD COLUMN address_number varchar(30) NOT NULL DEFAULT '',
  ADD COLUMN address_complement varchar(120) NOT NULL DEFAULT '',
  ADD COLUMN neighborhood varchar(120) NOT NULL DEFAULT '',
  ADD COLUMN city varchar(120) NOT NULL DEFAULT '',
  ADD COLUMN state varchar(2) NOT NULL DEFAULT '',
  ADD COLUMN cover_photo varchar(255) NULL,
  ADD COLUMN cover_position tinyint NOT NULL DEFAULT 50,
  ADD COLUMN description text NULL,
  ADD COLUMN cancellation_policy text NULL;

CREATE TABLE client_favorites (
  id int NOT NULL AUTO_INCREMENT,
  client_id int NOT NULL,
  establishment_id int NOT NULL,
  createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_client_favorite (client_id, establishment_id)
);

CREATE TABLE establishment_reviews (
  id int NOT NULL AUTO_INCREMENT,
  client_id int NOT NULL,
  establishment_id int NOT NULL,
  rating tinyint NOT NULL,
  comment varchar(500) NULL,
  createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_client_establishment_review (client_id, establishment_id)
);
