import { PrismaClient, type Service, type Product } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.workshopSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Oficina do Zé",
      document: "12.345.678/0001-90",
      phone: "(11) 3456-7890",
      whatsapp: "(11) 91234-5678",
      address: "Rua das Ferramentas, 123",
      city: "São Paulo",
      state: "SP",
    },
  });

  const customersData = [
    { name: "João da Silva", document: "111.111.111-11", phone: "(11) 98888-1111", whatsapp: "(11) 98888-1111", address: "Rua A, 100" },
    { name: "Maria Oliveira", document: "222.222.222-22", phone: "(11) 98888-2222", whatsapp: "(11) 98888-2222", address: "Rua B, 200" },
    { name: "Carlos Pereira", document: "333.333.333-33", phone: "(11) 98888-3333", whatsapp: "(11) 98888-3333", address: "Rua C, 300" },
    { name: "Ana Souza", document: "444.444.444-44", phone: "(11) 98888-4444", whatsapp: "(11) 98888-4444", address: "Rua D, 400" },
    { name: "Pedro Santos", document: "555.555.555-55", phone: "(11) 98888-5555", whatsapp: "(11) 98888-5555", address: "Rua E, 500" },
  ];

  const customers = [];
  for (const data of customersData) {
    const existing = await prisma.customer.findFirst({ where: { name: data.name } });
    customers.push(existing || (await prisma.customer.create({ data })));
  }

  const vehiclesData = [
    { plate: "ABC1D23", brand: "Chevrolet", model: "Onix", year: "2020", color: "Prata", mileage: 55200 },
    { plate: "DEF4E56", brand: "Volkswagen", model: "Gol", year: "2018", color: "Branco", mileage: 82000 },
    { plate: "GHI7F89", brand: "Fiat", model: "Uno", year: "2015", color: "Vermelho", mileage: 120500 },
    { plate: "JKL1G23", brand: "Honda", model: "Civic", year: "2021", color: "Preto", mileage: 30100 },
    { plate: "MNO4H56", brand: "Toyota", model: "Corolla", year: "2019", color: "Cinza", mileage: 68000 },
  ];

  const vehicles = [];
  for (let i = 0; i < vehiclesData.length; i++) {
    const existing = await prisma.vehicle.findFirst({ where: { plate: vehiclesData[i].plate } });
    vehicles.push(existing || (await prisma.vehicle.create({ data: { ...vehiclesData[i], customerId: customers[i].id } })));
  }

  const servicesData = [
    { name: "Troca de óleo", description: "Troca de óleo e filtro", defaultPrice: 80 },
    { name: "Alinhamento", description: "Alinhamento de direção", defaultPrice: 70 },
    { name: "Balanceamento", description: "Balanceamento das 4 rodas", defaultPrice: 60 },
    { name: "Troca de pastilhas", description: "Troca de pastilhas de freio", defaultPrice: 120 },
    { name: "Troca de correia", description: "Troca de correia dentada", defaultPrice: 250 },
    { name: "Suspensão", description: "Revisão de suspensão", defaultPrice: 180 },
    { name: "Freios", description: "Revisão completa de freios", defaultPrice: 150 },
    { name: "Troca de embreagem", description: "Troca do kit de embreagem", defaultPrice: 450 },
    { name: "Diagnóstico", description: "Diagnóstico eletrônico", defaultPrice: 90 },
    { name: "Revisão geral", description: "Revisão completa do veículo", defaultPrice: 200 },
  ];

  const services: Service[] = [];
  for (const data of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: data.name } });
    services.push(existing || (await prisma.service.create({ data })));
  }

  const productsData = [
    { name: "Óleo 5W30", code: "OL-5W30", brand: "Mobil", quantity: 40, minStock: 10, costPrice: 25, salePrice: 35 },
    { name: "Filtro de óleo", code: "FO-100", brand: "Tecfil", quantity: 25, minStock: 5, costPrice: 15, salePrice: 25 },
    { name: "Filtro de ar", code: "FA-200", brand: "Tecfil", quantity: 20, minStock: 5, costPrice: 20, salePrice: 30 },
    { name: "Pastilha de freio (jogo)", code: "PF-300", brand: "Fras-le", quantity: 15, minStock: 4, costPrice: 60, salePrice: 90 },
    { name: "Correia dentada", code: "CD-400", brand: "Gates", quantity: 8, minStock: 3, costPrice: 80, salePrice: 130 },
    { name: "Amortecedor", code: "AM-500", brand: "Cofap", quantity: 6, minStock: 2, costPrice: 150, salePrice: 220 },
    { name: "Vela de ignição", code: "VI-600", brand: "NGK", quantity: 30, minStock: 8, costPrice: 12, salePrice: 20 },
    { name: "Bateria 60Ah", code: "BA-700", brand: "Moura", quantity: 5, minStock: 2, costPrice: 250, salePrice: 380 },
    { name: "Fluido de freio", code: "FF-800", brand: "Bosch", quantity: 18, minStock: 5, costPrice: 18, salePrice: 28 },
    { name: "Kit de embreagem", code: "KE-900", brand: "Sachs", quantity: 3, minStock: 2, costPrice: 300, salePrice: 450 },
  ];

  const products: Product[] = [];
  for (const data of productsData) {
    const existing = await prisma.product.findFirst({ where: { name: data.name } });
    products.push(existing || (await prisma.product.create({ data })));
  }

  const existingOrders = await prisma.serviceOrder.count();
  if (existingOrders === 0) {
    const orderConfigs = [
      { customer: 0, vehicle: 0, status: "FINALIZADA" as const, serviceIdx: [0, 1], productIdx: [0, 1], paid: true },
      { customer: 1, vehicle: 1, status: "EM_ANDAMENTO" as const, serviceIdx: [3], productIdx: [3], paid: false },
      { customer: 2, vehicle: 2, status: "ABERTA" as const, serviceIdx: [8], productIdx: [], paid: false },
      { customer: 3, vehicle: 3, status: "ENTREGUE" as const, serviceIdx: [9, 2], productIdx: [6], paid: true },
      { customer: 4, vehicle: 4, status: "FINALIZADA" as const, serviceIdx: [6], productIdx: [8], paid: false },
    ];

    let number = 1;
    for (const cfg of orderConfigs) {
      const orderServices = cfg.serviceIdx.map((i) => ({
        serviceId: services[i].id,
        description: services[i].name,
        quantity: 1,
        unitPrice: services[i].defaultPrice,
        subtotal: services[i].defaultPrice,
      }));
      const orderProducts = cfg.productIdx.map((i) => ({
        productId: products[i].id,
        description: products[i].name,
        quantity: 1,
        unitPrice: products[i].salePrice,
        subtotal: products[i].salePrice,
      }));

      const servicesTotal = orderServices.reduce((s, l) => s + l.subtotal, 0);
      const productsTotal = orderProducts.reduce((s, l) => s + l.subtotal, 0);
      const total = servicesTotal + productsTotal;

      const order = await prisma.serviceOrder.create({
        data: {
          number: number++,
          customerId: customers[cfg.customer].id,
          vehicleId: vehicles[cfg.vehicle].id,
          mileage: vehicles[cfg.vehicle].mileage,
          reportedProblem: "Cliente relatou ruído e solicitou revisão.",
          status: cfg.status,
          servicesTotal,
          productsTotal,
          total,
          paidAmount: cfg.paid ? total : 0,
          paymentStatus: cfg.paid ? "PAGO" : "PENDENTE",
          paymentMethod: cfg.paid ? "PIX" : null,
          stockDeducted: cfg.status === "FINALIZADA" || cfg.status === "ENTREGUE",
          services: { create: orderServices },
          products: { create: orderProducts },
        },
      });

      if (cfg.paid) {
        await prisma.payment.create({
          data: { serviceOrderId: order.id, method: "PIX", amount: total },
        });
        await prisma.financialTransaction.create({
          data: {
            type: "ENTRADA",
            description: `Pagamento OS #${String(order.number).padStart(4, "0")}`,
            amount: total,
            category: "Ordem de serviço",
            serviceOrderId: order.id,
          },
        });
      }
    }

    await prisma.financialTransaction.create({
      data: { type: "SAIDA", description: "Conta de energia", amount: 320, category: "Energia" },
    });
    await prisma.financialTransaction.create({
      data: { type: "SAIDA", description: "Aluguel do galpão", amount: 1800, category: "Aluguel" },
    });
  }

  console.log("Dados de teste criados com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
