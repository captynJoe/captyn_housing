/**
 * Reupdate configuration for database migrations and seeding.
 * Adjust this file as needed for your project.
 */

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  migrationsFolder: './prisma/migrations',
  seedScript: 'node prisma/seed.js',
};
