import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sectorNames = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'];
  for (const name of sectorNames) {
    await prisma.sector.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  await prisma.driver.upsert({
    where: { phone: '+000000000' },
    update: {},
    create: { name: 'Repartidor Demo', phone: '+000000000' }
  });

  // Crear personas demo
  await (prisma as any).person.upsert({
    where: { phone: '+111111111' },
    update: {},
    create: { name: 'Usuario Demo', phone: '+111111111', litersBalance: 50 }
  });

  // obtener id de la persona demo
  const demoPerson = await (prisma as any).person.findUnique({ where: { phone: '+111111111' } });

  // Crear vehículos demo y fuel inventories por sector
  const sectors = await prisma.sector.findMany();
  for (const s of sectors) {
    await (prisma as any).vehicle.upsert({
      where: { plate: `VEH-${s.name}` },
      update: {},
      create: { plate: `VEH-${s.name}`, capacity: 200, litersAvailable: 150, sectorId: s.id, personId: s.name === 'Centro' && demoPerson ? demoPerson.id : undefined }
    });

    await (prisma as any).fuelInventory.upsert({
      where: { sectorId: s.id },
      update: {},
      create: { sectorId: s.id, litersAvailable: 1000 }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


