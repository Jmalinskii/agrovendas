import { db } from '../src/db';
import { users, companies } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // 1. Criar Super Admin se não existir
  const superAdminEmail = 'admin@agrovendas.com.br';
  const superAdminPassword = 'admin123';

  const existingUsers = await db.select().from(users).where(eq(users.email, superAdminEmail)).limit(1);
  let superAdmin = existingUsers[0];

  const salt = await bcrypt.genSalt(10);

  if (!superAdmin) {
    console.log('Criando Super Admin...');
    const hashedSuperPassword = await bcrypt.hash(superAdminPassword, salt);
    const newSuperAdmins = await db.insert(users).values({
      name: 'Administrador AgroVendas',
      email: superAdminEmail,
      password: hashedSuperPassword,
      role: 'SUPER_ADMIN',
      companyId: null, // Super admin não pertence a nenhuma empresa
      isActive: true,
    }).returning();
    superAdmin = newSuperAdmins[0];
    console.log(`Super Admin criado: ${superAdminEmail}`);
  } else {
    // Garantir que a role seja SUPER_ADMIN caso estivesse como 'admin'
    await db.update(users)
      .set({ role: 'SUPER_ADMIN', companyId: null })
      .where(eq(users.id, superAdmin.id));
    console.log('Super Admin já existente atualizado para role SUPER_ADMIN.');
  }

  // 2. Criar Empresa de Demonstração se não existir
  const demoCompanySlug = 'agrodemo';
  const existingCompanies = await db.select().from(companies).where(eq(companies.slug, demoCompanySlug)).limit(1);
  let demoCompany = existingCompanies[0];

  if (!demoCompany) {
    console.log('Criando Empresa de Demonstração (AgroDemo)...');
    const newCompanies = await db.insert(companies).values({
      name: 'AgroDemo Ltda',
      slug: demoCompanySlug,
      document: '12.345.678/0001-90',
      email: 'contato@agrodemo.com.br',
      phone: '(11) 98765-4321',
      logoUrl: null,
      plan: 'pro',
      maxUsers: 25,
      isActive: true,
    }).returning();
    demoCompany = newCompanies[0];
    console.log(`Empresa demo criada: ${demoCompany.name} (slug: ${demoCompanySlug})`);
  } else {
    console.log('Empresa de demonstração já existente.');
  }

  // 3. Criar COMPANY_ADMIN da AgroDemo se não existir
  const companyAdminEmail = 'admin@agrodemo.com.br';
  const companyAdminPassword = 'admin123';
  const existingCompAdmin = await db.select().from(users).where(eq(users.email, companyAdminEmail)).limit(1);

  if (!existingCompAdmin[0]) {
    console.log('Criando Company Admin (Carlos)...');
    const hashedAdminPassword = await bcrypt.hash(companyAdminPassword, salt);
    await db.insert(users).values({
      name: 'Carlos Admin Demo',
      email: companyAdminEmail,
      password: hashedAdminPassword,
      role: 'COMPANY_ADMIN',
      companyId: demoCompany.id,
      isActive: true,
    });
    console.log(`Company Admin criado: ${companyAdminEmail}`);
  }

  // 4. Criar COMPANY_USER da AgroDemo se não existir
  const companyUserEmail = 'roberto@agrodemo.com.br';
  const companyUserPassword = 'user123';
  const existingCompUser = await db.select().from(users).where(eq(users.email, companyUserEmail)).limit(1);

  if (!existingCompUser[0]) {
    console.log('Criando Company User (Roberto)...');
    const hashedUserPassword = await bcrypt.hash(companyUserPassword, salt);
    await db.insert(users).values({
      name: 'Roberto Vendedor Demo',
      email: companyUserEmail,
      password: hashedUserPassword,
      role: 'COMPANY_USER',
      companyId: demoCompany.id,
      isActive: true,
    });
    console.log(`Company User criado: ${companyUserEmail}`);
  }

  console.log('----------------------------------------------------');
  console.log('Seed de multi-tenancy finalizado com sucesso!');
  console.log(`Super Admin:       ${superAdminEmail} / ${superAdminPassword}`);
  console.log(`Empresa Demo:      slug: ${demoCompanySlug}`);
  console.log(`Empresa Admin:     ${companyAdminEmail} / ${companyAdminPassword}`);
  console.log(`Empresa Vendedor:  ${companyUserEmail} / ${companyUserPassword}`);
  console.log('----------------------------------------------------');
}

main().catch(err => {
  console.error('Erro ao executar o seed:', err);
  process.exit(1);
});
