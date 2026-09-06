-- ============================================
-- ESQUEMA DE BASE DE DATOS - BANCO WEB
-- MySQL / MariaDB (XAMPP)
-- ============================================

CREATE DATABASE IF NOT EXISTS banco_oficial_produccion;
USE banco_oficial_produccion;

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: clientes (cada usuario solo ve sus clientes)
CREATE TABLE IF NOT EXISTS clientes (
    cedula VARCHAR(20) PRIMARY KEY,
    user_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro DATE DEFAULT (CURRENT_DATE),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla: prestamos (cada usuario solo ve sus prestamos)
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cliente_cedula VARCHAR(20) NOT NULL,
    modalidad VARCHAR(50) NOT NULL,
    monto_prestado DECIMAL(15,2) NOT NULL,
    tasa_interes DECIMAL(8,2) NOT NULL,
    plazo INT NOT NULL,
    fecha_desembolso DATE DEFAULT (CURRENT_DATE),
    total_a_pagar DECIMAL(15,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (cliente_cedula) REFERENCES clientes(cedula)
);

-- Tabla: cronograma_pagos (se mantiene por prestamo_id)
CREATE TABLE IF NOT EXISTS cronograma_pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestamo_id INT NOT NULL,
    numero_cuota INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    valor_cuota DECIMAL(15,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_pago_real DATE,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id)
);

-- Indices para performance
CREATE INDEX idx_clientes_user ON clientes(user_id);
CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_prestamos_user ON prestamos(user_id);
CREATE INDEX idx_prestamos_cliente ON prestamos(cliente_cedula);
CREATE INDEX idx_cuotas_prestamo ON cronograma_pagos(prestamo_id);
CREATE INDEX idx_cuotas_estado ON cronograma_pagos(estado);
