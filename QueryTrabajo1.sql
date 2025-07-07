USE SistemasBEA;
CREATE TABLE Estaciones (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Estacion NVARCHAR(100),
    Dia DATE,
    TotalPasesEntrada INT,
    MontoPasesEntrada DECIMAL(10,2),
    TotalPasesSalida INT,
    MontoPasesSalida DECIMAL(10,2),
    TotalPasesGarita INT,
    MontoPasesGarita DECIMAL(10,2),
    TotalVentasVRT INT,
    MontoVentasVRT DECIMAL(10,2),
    TotalRecargasVRT INT,
    MontoRecargasVRT DECIMAL(10,2),
    IdPuntero INT
);
USE SistemasBEA;

CREATE TABLE Autobuses (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Ruta NVARCHAR(100),
    Dia DATE,
    TotalPasesMoneda INT,
    MontoPasesMoneda DECIMAL(10,2),
    TotalPasesTarjeta INT,
    MontoPasesTarjeta DECIMAL(10,2),
    CantidadRecargas INT,
    MontoRecargas DECIMAL(10,2),
    IdPunteroMoneda INT,
    IdPunteroTarjeta INT
);
-- Datos prueba tabla Estaciones
INSERT INTO Estaciones (Estacion, Dia, TotalPasesEntrada, MontoPasesEntrada, TotalPasesSalida, MontoPasesSalida, TotalPasesGarita, MontoPasesGarita, TotalVentasVRT, MontoVentasVRT, TotalRecargasVRT, MontoRecargasVRT, IdPuntero)
VALUES ('Tlaquepaque Centro', '2025-07-05', 100, 1500.00, 80, 1200.00, 30, 450.00, 20, 300.00, 10, 150.00, 1);

-- Datos prueba tabla Autobuses
INSERT INTO Autobuses (Ruta, Dia, TotalPasesMoneda, MontoPasesMoneda, TotalPasesTarjeta, MontoPasesTarjeta, CantidadRecargas, MontoRecargas, IdPunteroMoneda, IdPunteroTarjeta)
VALUES ('Ruta A', '2025-07-05', 200, 3000.00, 150, 2250.00, 50, 750.00, 1, 1);



CREATE LOGIN jcalvillo WITH PASSWORD = 'bea12345';
USE SistemasBEA;
CREATE USER jcalvillo FOR LOGIN jcalvillo;
ALTER ROLE db_owner ADD MEMBER jcalvillo;

USE SistemasBEA;
SELECT * FROM Estaciones WHERE Id = 1;


USE SistemasBEA;
SELECT name, type_desc FROM sys.database_principals;

ALTER LOGIN jcalvillo WITH PASSWORD = 'bea12345';


CREATE USER jcalvillo FOR LOGIN jcalvillo;
ALTER ROLE db_owner ADD MEMBER jcalvillo;
ALTER LOGIN jcalvillo ENABLE;
SELECT name, is_disabled 
FROM sys.sql_logins 
WHERE name = 'jcalvillo';
