const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMessaging() {
  console.log("Looking for an admin and a student...");
  const admin = await prisma.profiles.findFirst({ where: { rol: "admin" } });
  const student = await prisma.profiles.findFirst({ where: { rol: "student" } });

  if (!admin || !student) {
    console.log("Admin or student not found. Skipping DB trigger test.");
    return;
  }

  console.log(`Found Admin: ${admin.nombres} (${admin.id}), Student: ${student.nombres} (${student.id})`);

  // Test 1: Admin sends to student -> should succeed
  console.log("Test 1: Admin sends message to student...");
  const msg = await prisma.student_messages.create({
    data: {
      sender_id: admin.id,
      student_id: student.id,
      asunto: "Test automatizado",
      contenido: "Hola estudiante, este es un mensaje de prueba.",
      leido: false,
    }
  });
  console.log("Message created successfully! ID:", msg.id);

  // Test 2: Student reads message -> mark as read
  console.log("Test 2: Student marks message as read...");
  const readMsg = await prisma.student_messages.update({
    where: { id: msg.id },
    data: {
      leido: true,
      leido_at: new Date(),
    }
  });
  console.log("Read status:", { leido: readMsg.leido, leido_at: readMsg.leido_at });

  // Test 3: Student attempts to send message -> should FAIL due to DB trigger
  console.log("Test 3: Testing database trigger (Student tries to send message)...");
  try {
    await prisma.student_messages.create({
      data: {
        sender_id: student.id,
        student_id: admin.id,
        asunto: "Intento ilegal",
        contenido: "No debería permitirse",
      }
    });
    console.error("FAIL: Trigger did not block student sender!");
  } catch (err) {
    console.log("SUCCESS: Trigger blocked student sender as expected! Error message:", err.message);
  }

  // Cleanup test message
  await prisma.student_messages.delete({ where: { id: msg.id } });
  console.log("Test message cleaned up.");
}

testMessaging()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
