import { db } from '../src/db';
import { users } from '../src/db/schema';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando seed do banco de dados...');

  const adminEmail = 'admin@agrovendas.com.br';
  const adminPassword = 'admin123';

  // Verifica se o usuário já existe para não duplicar
  const existingUsers = await db.select().from(users);
  const adminExists = existingUsers.some(u => u.email === adminEmail);

  if (adminExists) {
    console.log(`Usuário admin (${adminEmail}) já cadastrado. Seed ignorado.`);
    return;
  }

  // Gera o hash de senha com bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  // Insere o usuário
  await db.insert(users).values({
    name: 'Administrador AgroVendas',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  });

  console.log('----------------------------------------------------');
  console.log('Seed realizado com sucesso!');
  console.log(`E-mail de acesso: ${adminEmail}`);
  console.log(`Senha de acesso:  ${adminPassword}`);
  console.log('----------------------------------------------------');
}

main().catch(err => {
  console.error('Erro ao executar o seed:', err);
  process.exit(1);
});
