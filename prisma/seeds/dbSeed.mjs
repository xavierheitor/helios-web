// prisma/seed.js

import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

// prisma/seed.js

async function main() {
  // Cria o usuário administrador se não existir
  const username = "admin";
  const plainPassword = "@adminadmin123";

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      password: hashedPassword,
      name: "Administrator",
      email: "admin@example.com",
    },
  });

  console.log(`User created: ${adminUser.username}`);

  // Função auxiliar para criar múltiplos registros
  const createMany = async (count, createFn) => {
    for (let i = 0; i < count; i++) {
      await createFn();
    }
  };

  // 1. Criar Roles
  const rolesIds = [];
  const roleNames = new Set();

  await createMany(5, async () => {
    let name;
    do {
      name = `${faker.person.jobTitle()} ${faker.number.int(1000)}`;
    } while (roleNames.has(name));
    roleNames.add(name);

    const role = await prisma.role.create({
      data: {
        name: name,
        description: faker.lorem.sentence(),
        baseSalary: faker.number.float({ min: 3000, max: 10000 }),
        createdByUser: adminUser.id,
      },
    });
    rolesIds.push(role.id);
  });

  // 2. Criar Contractors
  const contractorsIds = [];
  const contractorCNPJs = new Set();

  await createMany(3, async () => {
    let cnpj;
    do {
      cnpj = faker.string.numeric({ length: 14 });
    } while (contractorCNPJs.has(cnpj));
    contractorCNPJs.add(cnpj);

    const contractor = await prisma.contractor.create({
      data: {
        name: faker.company.name(),
        cnpj: cnpj,
        state: faker.location.state({ abbreviated: true }),
        createdByUser: adminUser.id,
      },
    });
    contractorsIds.push(contractor.id);
  });

  // 3. Criar Contracts
  const contractsIds = [];
  const contractNumbers = new Set();

  await Promise.all(
    contractorsIds.map(async (contractorId) => {
      await createMany(2, async () => {
        let number;
        do {
          number = faker.string.alphanumeric({ length: 10, casing: "upper" });
        } while (contractNumbers.has(number));
        contractNumbers.add(number);

        const contract = await prisma.contract.create({
          data: {
            number: number,
            name: faker.company.catchPhrase(),
            initialDate: faker.date.past(),
            finalDate: faker.date.future(),
            contractorId,
            createdByUser: adminUser.id,
          },
        });
        contractsIds.push(contract.id);
      });
    })
  );

  // 4. Criar Bases
  const basesIds = [];
  const baseNames = new Set();

  await Promise.all(
    contractsIds.map(async (contractId) => {
      await createMany(2, async () => {
        let name;
        do {
          name = `${faker.location.city()} Base ${faker.number.int(1000)}`;
        } while (baseNames.has(name));
        baseNames.add(name);

        const base = await prisma.base.create({
          data: {
            name: name,
            contractId,
            createdByUser: adminUser.id,
          },
        });
        basesIds.push(base.id);
      });
    })
  );

  // 5. Criar VehicleTypes
  const vehicleTypesIds = [];
  const vehicleTypeNames = new Set();

  await createMany(3, async () => {
    let name;
    do {
      name = `${faker.vehicle.type()} ${faker.word.adjective()} ${faker.number.int(
        1000
      )}`;
    } while (vehicleTypeNames.has(name));

    vehicleTypeNames.add(name);

    const vehicleType = await prisma.vehicleType.create({
      data: {
        name: name,
        description: faker.lorem.sentence(),
        createdByUser: adminUser.id,
      },
    });
    vehicleTypesIds.push(vehicleType.id);
  });

  // 6. Criar Vehicles
  const vehiclesIds = [];
  const plates = new Set();
  const operationalNumbers = new Set();

  await Promise.all(
    contractsIds.map(async (contractId) => {
      await createMany(3, async () => {
        let plate;
        do {
          plate = faker.vehicle.vrm();
        } while (plates.has(plate));
        plates.add(plate);

        let operationalNumber;
        do {
          operationalNumber = faker.string.alphanumeric({
            length: 5,
            casing: "upper",
          });
        } while (operationalNumbers.has(operationalNumber));
        operationalNumbers.add(operationalNumber);

        const vehicle = await prisma.vehicle.create({
          data: {
            plate: plate,
            brand: faker.vehicle.manufacturer(),
            model: faker.vehicle.model(),
            year: faker.date.past({ years: 10 }).getFullYear(),
            color: faker.color.human(),
            operationalNumber: operationalNumber,
            contractId,
            vechicleTypeId:
              vehicleTypesIds[
                faker.number.int({
                  min: 0,
                  max: vehicleTypesIds.length - 1,
                })
              ],
            createdByUser: adminUser.id,
          },
        });
        vehiclesIds.push(vehicle.id);
      });
    })
  );

  // 7. Criar TeamTypes
  const teamTypesIds = [];
  const teamTypeNames = new Set();

  await createMany(3, async () => {
    let name;
    do {
      name = `${faker.company.buzzNoun()} Team ${faker.number.int(1000)}`;
    } while (teamTypeNames.has(name));

    teamTypeNames.add(name);

    const teamType = await prisma.teamType.create({
      data: {
        name: name,
        description: faker.lorem.sentence(),
        createdByUser: adminUser.id,
      },
    });
    teamTypesIds.push(teamType.id);
  });

  // 8. Criar Teams
  const teamsIds = [];
  const teamNames = new Set();

  await Promise.all(
    contractsIds.map(async (contractId) => {
      await createMany(2, async () => {
        let name;
        do {
          name = `${faker.animal.type()} Team ${faker.number.int(1000)}`;
        } while (teamNames.has(name));
        teamNames.add(name);

        const team = await prisma.team.create({
          data: {
            name: name,
            contractId,
            teamTypeId:
              teamTypesIds[
                faker.number.int({ min: 0, max: teamTypesIds.length - 1 })
              ],
            createdByUser: adminUser.id,
          },
        });
        teamsIds.push(team.id);
      });
    })
  );

  // 9. Criar Employees
  const employeesIds = [];
  const cpfs = new Set();
  const rgs = new Set();
  const emails = new Set();
  const registrations = new Set();

  await Promise.all(
    contractsIds.map(async (contractId) => {
      await createMany(5, async () => {
        let cpf;
        do {
          cpf = faker.string.numeric({ length: 11 });
        } while (cpfs.has(cpf));
        cpfs.add(cpf);

        let rg;
        do {
          rg = faker.string.numeric({ length: 9 });
        } while (rgs.has(rg));
        rgs.add(rg);

        let firstName = faker.person.firstName();
        let lastName = faker.person.lastName();
        let email;
        do {
          email = faker.internet.email({ firstName, lastName });
        } while (emails.has(email));
        emails.add(email);

        let registration;
        do {
          registration = faker.number.int({ min: 1000, max: 9999 });
        } while (registrations.has(registration));
        registrations.add(registration);

        const employee = await prisma.employee.create({
          data: {
            name: `${firstName} ${lastName}`,
            cpf: cpf,
            rg: rg,
            email: email,
            birthDate: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
            contact: faker.phone.number(),
            admissionDate: faker.date.past({ years: 5 }),
            resingationDate: null,
            city: faker.location.city(),
            estate: faker.location.state({ abbreviated: true }),
            cep: faker.string.numeric({ length: 8 }),
            address: faker.location.streetAddress(),
            number: faker.string.numeric({ length: 4 }),
            district: faker.location.county(),
            registration: registration,
            contractId,
            roleId:
              rolesIds[faker.number.int({ min: 0, max: rolesIds.length - 1 })],
            createdByUser: adminUser.id,
          },
        });
        employeesIds.push(employee.id);
      });
    })
  );

  // 10. Criar ChecklistTypes
  const checklistTypesIds = [];
  const checklistTypeNames = new Set();

  await createMany(3, async () => {
    let name;
    do {
      name = `${faker.word.adjective()} Checklist ${faker.number.int(1000)}`;
    } while (checklistTypeNames.has(name));
    checklistTypeNames.add(name);

    const checklistType = await prisma.checklistType.create({
      data: {
        name: name,
        description: faker.lorem.sentence(),
        createdByUser: adminUser.id,
      },
    });
    checklistTypesIds.push(checklistType.id);
  });

  // 11. Criar Questions
  const questionsIds = [];
  await Promise.all(
    checklistTypesIds.map(async (checklistTypeId) => {
      await createMany(5, async () => {
        const question = await prisma.question.create({
          data: {
            text: faker.lorem.sentence(),
            checklistTypeId,
            createdByUser: adminUser.id,
          },
        });
        questionsIds.push(question.id);
      });
    })
  );

  // 12. Criar Answers
  const answersIds = [];
  await Promise.all(
    checklistTypesIds.map(async (checklistTypeId) => {
      await createMany(3, async () => {
        const answer = await prisma.answer.create({
          data: {
            text: faker.word.adjective(),
            pending: faker.datatype.boolean(),
            checklistTypeId,
            createdByUser: adminUser.id,
          },
        });
        answersIds.push(answer.id);
      });
    })
  );

  // 13. Criar Checklists
  const checklistsIds = [];
  const checklistNames = new Set();

  await Promise.all(
    checklistTypesIds.map(async (checklistTypeId) => {
      await createMany(2, async () => {
        let name;
        do {
          name = `${faker.hacker.verb()} Checklist ${faker.number.int(1000)}`;
        } while (checklistNames.has(name));
        checklistNames.add(name);

        const checklist = await prisma.checklist.create({
          data: {
            name: name,
            description: faker.lorem.sentence(),
            checklistTypeId,
            createdByUser: adminUser.id,
          },
        });
        checklistsIds.push(checklist.id);
      });
    })
  );

  // 14. Criar ChecklistAssociatedQuestions
  await Promise.all(
    checklistsIds.map(async (checklistId) => {
      // Obter o tipo de checklist
      const checklist = await prisma.checklist.findUnique({
        where: { id: checklistId },
        include: { checklistType: true },
      });
      if (!checklist) return;

      // Obter perguntas do mesmo tipo
      const questions = await prisma.question.findMany({
        where: { checklistTypeId: checklist.checklistTypeId },
      });

      // Selecionar algumas perguntas aleatoriamente
      const selectedQuestions = faker.helpers.arrayElements(questions, 3);

      // Associar perguntas ao checklist
      await Promise.all(
        selectedQuestions.map(async (question) => {
          await prisma.checklistAssociatedQuestion.create({
            data: {
              checklistId,
              questionId: question.id,
              createdByUser: adminUser.id,
            },
          });
        })
      );
    })
  );

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
