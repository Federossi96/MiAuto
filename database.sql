CREATE DATABASE autoscout24_replica;
USE autoscout24_replica;

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    version VARCHAR(50),
    anio INT NOT NULL,
    kilometros INT NOT NULL,
    combustible VARCHAR(20) NOT NULL,
    motor VARCHAR(20),
    potencia INT,
    transmision VARCHAR(20),
    color VARCHAR(20),
    precio DECIMAL(10, 2) NOT NULL,
    imagen VARCHAR(255)
);

INSERT INTO cars (marca, modelo, version, anio, kilometros, combustible, motor, potencia, transmision, color, precio, imagen) VALUES
('BMW', 'Serie 3', '320d xDrive', 2020, 35000, 'Diésel', '2.0 TDI', 190, 'Automática', 'Negro', 25900.00, 'assets/images/bmw_serie3.jpg'),
('Audi', 'A4', '35 TDI', 2019, 42500, 'Diésel', '2.0 TDI', 150, 'Manual', 'Gris', 29500.00, 'assets/images/audi_a4.jpg'),
('Mercedes', 'Clase C', 'C 220d', 2021, 18000, 'Diésel', '2.0d', 194, 'Automática', 'Blanco', 33800.00, 'assets/images/mercedes_c.jpg'),
('BMW', 'X5', 'xDrive40i', 2022, 12000, 'Gasolina', '3.0 Turbo', 340, 'Automática', 'Azul', 57900.00, 'assets/images/bmw_x5.jpg'),
('Volkswagen', 'Passat', '2.0 TDI', 2018, 58000, 'Diésel', '2.0 TDI', 150, 'Manual', 'Plata', 21300.00, 'assets/images/vw_passat.jpg'),
('Audi', 'Q5', '45 TFSI Quattro', 2021, 23500, 'Gasolina', '2.0 TFSI', 245, 'Automática', 'Negro', 46200.00, 'assets/images/audi_q5.jpg'),
('Peugeot', '508', '1.6 PureTech', 2020, 28000, 'Gasolina', '1.6 Turbo', 180, 'Automática', 'Rojo', 26700.00, 'assets/images/peugeot_508.jpg'),
('Volvo', 'XC60', 'D4 AWD', 2019, 39000, 'Diésel', '2.0d', 190, 'Automática', 'Gris', 37500.00, 'assets/images/volvo_xc60.jpg'),
('Toyota', 'Camry', '2.5 Hybrid', 2021, 16000, 'Híbrido', '2.5 HEV', 218, 'Automática', 'Blanco', 28900.00, 'assets/images/toyota_camry.jpg'),
('Range Rover', 'Evoque', 'P200', 2020, 25000, 'Gasolina', '2.0 Turbo', 200, 'Automática', 'Negro', 47800.00, 'assets/images/range_evoque.jpg');