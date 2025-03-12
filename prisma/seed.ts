const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Fixtures
  const fixtures = [];
  for (let i = 0; i < 5; i++) {
    const fixture = await prisma.fixture.create({
      data: {
        opponent: faker.company.name(),
        date: faker.date.soon(),
        venue: faker.address.streetAddress(),
        isHome: faker.datatype.boolean(),
        description: faker.lorem.sentence(),
        score: `${faker.number.int({ min: 0, max: 5 })}-${faker.number.int({
          min: 0,
          max: 5,
        })}`,
      },
    });
    fixtures.push(fixture);
    console.log(`Created fixture with id: ${fixture.id}`);
  }

  // Create Users with associated PlayerStats
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: i % 2 === 0 ? "USER" : "ADMIN",
        sex: faker.name.sexType(),
        state: faker.address.state(),
        address: faker.address.streetAddress(),
        dob: faker.date.birthdate({ min: 18, max: 50, mode: "age" }),
        phone: faker.phone.number(),
        nickname: faker.internet.userName(),
        picture: faker.image.avatar(),
        positions: JSON.stringify(
          faker.helpers.arrayElements(
            [
              "GK",
              "CB",
              "RB",
              "LB",
              "DM",
              "CM",
              "AM",
              "RW",
              "LW",
              "ST",
              "Coach",
            ],
            2
          )
        ),
        bio: faker.lorem.sentence(),
        attendance: {
          create: Array.from({ length: 3 }, () => ({
            date: faker.date.recent(),
            present: faker.datatype.boolean(),
          })),
        },
        stats: {
          create: {
            fixtureId: faker.helpers.arrayElement(fixtures).id, // Assign a random fixture
            gamesPlayed: faker.number.int({ min: 0, max: 100 }),
            goals: faker.number.int({ min: 0, max: 50 }),
            assists: faker.number.int({ min: 0, max: 50 }),
            cleanSheets: faker.number.int({ min: 0, max: 50 }),
            yellowCards: faker.number.int({ min: 0, max: 10 }),
            redCards: faker.number.int({ min: 0, max: 5 }),
          },
        },
        // images: {
        //   create: Array.from({ length: 2 }, () => ({
        //     url: faker.image.url(),
        //     caption: faker.lorem.sentence(),
        //   })),
        // },
      },
    });

    console.log(`Created user with id: ${user.id}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
