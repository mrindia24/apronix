/**
 * Creates (or resets) an administrator account.
 *
 * There is deliberately no public registration page. Use this script:
 *
 *   npm run admin:create -- --email you@apronixtech.com --password 'StrongPassw0rd!' --role SUPER_ADMIN
 *
 * Roles: SUPER_ADMIN | ADMIN | EDITOR
 */
import { PrismaClient, type Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function arg(name: string, fallback?: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index > -1 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function generatePassword(): string {
  // 20 chars, guaranteed mix of character classes
  const raw = randomBytes(24).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
  return `${raw}aA1!`;
}

async function main() {
  const email = (arg('email') ?? process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
  const name = arg('name') ?? process.env.ADMIN_NAME ?? 'Apronix Admin';
  const role = (arg('role') ?? 'SUPER_ADMIN').toUpperCase() as Role;
  let password = arg('password') ?? process.env.ADMIN_PASSWORD ?? '';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('Provide a valid --email (or set ADMIN_EMAIL in .env).');
    process.exit(1);
  }
  if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) {
    console.error('Role must be SUPER_ADMIN, ADMIN or EDITOR.');
    process.exit(1);
  }

  let generated = false;
  if (!password) {
    password = generatePassword();
    generated = true;
  }
  if (password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    await prisma.adminUser.update({
      where: { email },
      data: { passwordHash, role, isActive: true, name },
    });
    await prisma.adminSession.deleteMany({ where: { userId: existing.id } });
    console.log(`\n✔ Updated existing admin ${email} (role: ${role}). All sessions invalidated.`);
  } else {
    await prisma.adminUser.create({ data: { email, name, role, passwordHash } });
    console.log(`\n✔ Created admin ${email} (role: ${role}).`);
  }

  if (generated) {
    console.log(`\n  Generated password: ${password}`);
    console.log('  Save it now — it is not stored anywhere in plain text.\n');
  } else {
    console.log('\n  Password set from the value you supplied.\n');
  }
  console.log('  Sign in at /admin/login\n');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
