const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const actionSchemas = [
  {
    actionCode: 'microservice1.reserveSlot',
    version: '0.9.0',
    displayName: '予約枠を確保する（旧版）',
    selectable: false,
    requestDeclarationYaml: `requiredKeys:
  - reservationId
  - userId
optionalKeys:
  - priority
allowedKeys:
  - reservationId
  - userId
  - priority
`,
  },
  {
    actionCode: 'microservice1.reserveSlot',
    version: '1.0.0',
    displayName: '予約枠を確保する',
    selectable: true,
    requestDeclarationYaml: `requiredKeys:
  - reservationId
  - userId
optionalKeys:
  - priority
  - note
allowedKeys:
  - reservationId
  - userId
  - priority
  - note
`,
  },
  {
    actionCode: 'microservice2.verifyApproval',
    version: '1.0.0',
    displayName: '承認状態を検証する',
    selectable: true,
    requestDeclarationYaml: `requiredKeys:
  - workflowId
  - approverId
optionalKeys:
  - comment
allowedKeys:
  - workflowId
  - approverId
  - comment
`,
  },
  {
    actionCode: 'microservice3.notifyCompletion',
    version: '1.0.0',
    displayName: '完了を通知する',
    selectable: true,
    requestDeclarationYaml: `requiredKeys:
  - workflowId
  - recipient
optionalKeys:
  - channel
allowedKeys:
  - workflowId
  - recipient
  - channel
`,
  },
];

async function main() {
  for (const schema of actionSchemas) {
    await prisma.actionSchema.upsert({
      where: {
        actionCode_version: {
          actionCode: schema.actionCode,
          version: schema.version,
        },
      },
      create: schema,
      update: {
        displayName: schema.displayName,
        requestDeclarationYaml: schema.requestDeclarationYaml,
        selectable: schema.selectable,
      },
    });
  }

  console.log(`Seeded ${actionSchemas.length} action schema records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });