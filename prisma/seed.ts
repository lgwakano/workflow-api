import { PrismaClient, Role, QuestionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hashing passwords for users
  const hashedPasswordUser = await bcrypt.hash('hashedpassword123', 10);
  const hashedPasswordAdmin = await bcrypt.hash('adminpassword123', 10);
  const hashedPasswordModerator = await bcrypt.hash('modpassword123', 10);

  // Creating some users with different roles
  const user1 = await prisma.user.create({
    data: {
      username: 'john_doe',
      password: hashedPasswordUser, // Hashed password here
      role: Role.User,
      uid: 'user-uuid-1',
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin_user',
      password: hashedPasswordAdmin, // Hashed password here
      role: Role.Admin,
      uid: 'admin-uuid-1',
    },
  });

  const moderator = await prisma.user.create({
    data: {
      username: 'mod_user',
      password: hashedPasswordModerator, // Hashed password here
      role: Role.Moderator,
      uid: 'mod-uuid-1',
    },
  });

  // Creating a customer
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Customer One',
      phone: '123-456-7890',
      email: 'customer1@example.com',
      address: '123 Street Name, City, Country',
      contactName: 'John Doe',
    },
  });

  // Creating jobs for the customer
  const job1 = await prisma.job.create({
    data: {
      uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Project Patio XYZ',
      description: 'Build a new patio in the backyard.',
      customerId: customer1.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      name: 'Job Door 51',
      description: 'Install new doors for office.',
      customerId: customer1.id,
    },
  });

  // Creating reusable question templates
  const question1 = await prisma.question.create({
    data: {
      type: QuestionType.text,
      text: 'What materials would you like?',
    },
  });

  const question2 = await prisma.question.create({
    data: {
      type: QuestionType.radio,
      text: 'Would you prefer a premium option?',
      options: {
        create: [
          { text: 'Yes' },
          { text: 'No' },
        ],
      },
    },
  });

  const question3 = await prisma.question.create({
    data: {
      type: QuestionType.checkbox,
      text: 'Do you need installation?',
      options: {
        create: [
          { text: 'Yes' },
          { text: 'No' },
        ],
      },
    },
  });

  // Linking questions to jobs through JobQuestionTemplate
  await prisma.jobQuestionTemplate.create({
    data: {
      jobId: job1.id,
      questionId: question1.id,
    },
  });

  await prisma.jobQuestionTemplate.create({
    data: {
      jobId: job1.id,
      questionId: question2.id,
    },
  });

  await prisma.jobQuestionTemplate.create({
    data: {
      jobId: job2.id,
      questionId: question3.id,
    },
  });

  // Adding answers to the jobs
  await prisma.jobQuestionAnswer.create({
    data: {
      jobId: job1.id,
      questionId: question1.id,
      answer: ['Wood', 'Steel'],
    },
  });

  await prisma.jobQuestionAnswer.create({
    data: {
      jobId: job1.id,
      questionId: question2.id,
      answer: ['No'],
    },
  });

  await prisma.jobQuestionAnswer.create({
    data: {
      jobId: job2.id,
      questionId: question3.id,
      answer: ['Yes'],
    },
  });

  console.log('Database has been seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
