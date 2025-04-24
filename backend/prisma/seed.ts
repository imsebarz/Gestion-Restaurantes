// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.item.createMany({
    data: [
      {
        title: 'Arepa de Queso',
        description: 'Nuestra arepa rellena con queso costeño',
        price: 9000,
        imageUrl: 'https://ejemplo.com/arepa-queso.jpg'
      },
      {
        title: 'Burrito Gigante',
        description: 'Burrito de carne, frijoles y salsa casera',
        price: 17000,
        imageUrl: 'https://ejemplo.com/burrito.jpg'
      },
      {
        title: 'Tacos al Pastor',
        description: 'Tacos de cerdo marinados con piña y cebolla',
        price: 14500,
        imageUrl: 'https://ejemplo.com/tacos-pastor.jpg'
      },
      {
        title: 'Quesadilla Mixta',
        description: 'Quesadilla de pollo y queso mozarella',
        price: 15800,
        imageUrl: 'https://ejemplo.com/quesadilla.jpg'
      },
      {
        title: 'Empanada Colombiana',
        description: 'Empanada de maíz rellena de carne y papa',
        price: 3500,
        imageUrl: 'https://ejemplo.com/empanada.jpg'
      },
      {
        title: 'Ceviche de Camarón',
        description: 'Ceviche fresco con limón, cebolla y cilantro',
        price: 19500,
        imageUrl: 'https://ejemplo.com/ceviche.jpg'
      },
      {
        title: 'Churros con Chocolate',
        description: 'Churros calientes acompañados de chocolate espeso',
        price: 8000,
        imageUrl: 'https://ejemplo.com/churros.jpg'
      },
      {
        title: 'Ensalada César',
        description: 'Lechuga, crutones, pollo a la plancha y aderezo César',
        price: 12000,
        imageUrl: 'https://ejemplo.com/ensalada-cesar.jpg'
      }
    ]
  });
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
