import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar tablas en orden correcto
  await prisma.detallePedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.productoIngrediente.deleteMany();
  await prisma.ingrediente.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.sucursal.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.empresa.deleteMany();

  console.log('🧹 Base de datos limpiada');

  // Empresa
  const empresa = await prisma.empresa.create({
    data: {
      nombre: 'Tráiler Don Juancho',
      nit: '900123456-1',
      email: 'admin@donjuancho.com',
      telefono: '3001234567',
    },
  });

  // Admin
  const passwordHash = await bcrypt.hash('Admin123*', 10);
  await prisma.usuario.create({
    data: {
      nombre: 'Juan Carlos López',
      email: 'juan@donjuancho.com',
      password: passwordHash,
      rol: 'ADMIN_EMPRESA',
      empresaId: empresa.id,
    },
  });

  // Sucursal
  await prisma.sucursal.create({
    data: {
      nombre: 'Sucursal Principal',
      direccion: 'Calle 10 # 5-23, Centro',
      telefono: '3001234567',
      empresaId: empresa.id,
    },
  });

  // Categorías
  const catHamburguesas = await prisma.categoria.create({
    data: { nombre: 'Hamburguesas', descripcion: 'Hamburguesas clásicas y especiales', icono: '🍔', color: '#FF6B35', empresaId: empresa.id },
  });
  const catPerros = await prisma.categoria.create({
    data: { nombre: 'Perros Calientes', descripcion: 'Perros calientes tradicionales', icono: '🌭', color: '#FFB347', empresaId: empresa.id },
  });
  const catBebidas = await prisma.categoria.create({
    data: { nombre: 'Bebidas', descripcion: 'Gaseosas, jugos y agua', icono: '🥤', color: '#4FC3F7', empresaId: empresa.id },
  });

  // Hamburguesa Clásica
  const hamburguesa = await prisma.producto.create({
    data: { nombre: 'Hamburguesa Clásica', descripcion: 'Hamburguesa con carne, lechuga, tomate y salsa', precio: 12000, categoriaId: catHamburguesas.id, empresaId: empresa.id },
  });

  const ingredientesHamburguesa = [
    { nombre: 'Pan de hamburguesa', unidad: 'unidad', cantidad: 1, stock: 100, stockMinimo: 20 },
    { nombre: 'Carne de res', unidad: 'gramos', cantidad: 150, stock: 5000, stockMinimo: 500 },
    { nombre: 'Lechuga', unidad: 'gramos', cantidad: 30, stock: 1000, stockMinimo: 200 },
    { nombre: 'Tomate', unidad: 'gramos', cantidad: 40, stock: 2000, stockMinimo: 300 },
    { nombre: 'Salsa especial', unidad: 'gramos', cantidad: 20, stock: 500, stockMinimo: 100 },
    { nombre: 'Cebolla', unidad: 'gramos', cantidad: 25, stock: 1000, stockMinimo: 200 },
    { nombre: 'Jalapeños', unidad: 'gramos', cantidad: 15, stock: 300, stockMinimo: 50 },
  ];

  for (const ing of ingredientesHamburguesa) {
    const ingrediente = await prisma.ingrediente.create({
      data: { nombre: ing.nombre, unidad: ing.unidad, stock: ing.stock, stockMinimo: ing.stockMinimo },
    });
    await prisma.productoIngrediente.create({
      data: { productoId: hamburguesa.id, ingredienteId: ingrediente.id, cantidad: ing.cantidad },
    });
  }
  console.log('✅ Hamburguesa Clásica creada');

  // Perro Caliente
  const perro = await prisma.producto.create({
    data: { nombre: 'Perro Caliente Especial', descripcion: 'Perro caliente con salchicha y papas', precio: 8000, categoriaId: catPerros.id, empresaId: empresa.id },
  });

  const ingredientesPerro = [
    { nombre: 'Pan de perro', unidad: 'unidad', cantidad: 1, stock: 100, stockMinimo: 20 },
    { nombre: 'Salchicha', unidad: 'unidad', cantidad: 1, stock: 200, stockMinimo: 30 },
    { nombre: 'Papas fritas', unidad: 'gramos', cantidad: 100, stock: 3000, stockMinimo: 500 },
    { nombre: 'Mostaza', unidad: 'gramos', cantidad: 15, stock: 500, stockMinimo: 100 },
    { nombre: 'Ketchup', unidad: 'gramos', cantidad: 15, stock: 500, stockMinimo: 100 },
  ];

  for (const ing of ingredientesPerro) {
    const ingrediente = await prisma.ingrediente.create({
      data: { nombre: ing.nombre, unidad: ing.unidad, stock: ing.stock, stockMinimo: ing.stockMinimo },
    });
    await prisma.productoIngrediente.create({
      data: { productoId: perro.id, ingredienteId: ingrediente.id, cantidad: ing.cantidad },
    });
  }
  console.log('✅ Perro Caliente creado');

  // Bebidas
  await prisma.producto.create({
    data: { nombre: 'Gaseosa', descripcion: 'Gaseosa fría 350ml', precio: 3000, categoriaId: catBebidas.id, empresaId: empresa.id },
  });
  await prisma.producto.create({
    data: { nombre: 'Agua', descripcion: 'Agua fría 500ml', precio: 2000, categoriaId: catBebidas.id, empresaId: empresa.id },
  });
  console.log('✅ Bebidas creadas');

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });