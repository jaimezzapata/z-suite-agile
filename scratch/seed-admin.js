const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const prisma = new PrismaClient();

async function createAdmin() {
  const cedula = "1017194872";
  const email = `${cedula}@zsuite.local`;
  const password = "Developer2304**";

  try {
    console.log("Creating user in Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        real_email: "zapataval2304@gmail.com",
        cedula: cedula
      }
    });

    if (authError) {
      if (authError.message.includes("already exists") || authError.status === 422) {
        console.log("User might already exist in auth.users.");
      } else {
        throw new Error(`Auth Error: ${authError.message}`);
      }
    }

    const userId = authData?.user?.id;
    if (!userId) {
       console.log("Could not get user ID. Assuming user already exists.");
       // Try to find the user to get ID
       const { data: users } = await supabase.auth.admin.listUsers();
       const existingUser = users.users.find(u => u.email === email);
       if (existingUser) {
         console.log("Found existing user id:", existingUser.id);
         await upsertProfile(existingUser.id, cedula);
       }
       return;
    }

    console.log("User created with ID:", userId);
    await upsertProfile(userId, cedula);

  } catch (error) {
    console.error("Script failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function upsertProfile(userId, cedula) {
  try {
    console.log("Upserting profile for user ID:", userId);
    const profile = await prisma.profiles.upsert({
      where: { id: userId },
      update: {
        nombres: "Jaime",
        apellidos: "Zapata",
        rol: "admin",
      },
      create: {
        id: userId,
        cedula: cedula,
        nombres: "Jaime",
        apellidos: "Zapata",
        rol: "admin"
      }
    });
    console.log("Profile created/updated successfully:", profile);
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

createAdmin();
